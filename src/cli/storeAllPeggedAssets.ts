import * as sdk from "@defillama/sdk";
import PromisePool from "@supercharge/promise-pool";
import storePeggedAssets from "./../peggedAssets/storePeggedAssets/storePegged";
import peggedAssets from "./../peggedData/peggedData";
import { sendMessage } from "./../utils/discord";

const INTERNAL_CACHE_FILE = 'pegged-assets-cache/sdk-cache.json'

const handler = async () => {
  await initializeSdkInternalCache() // initialize sdk cache - this will cache abi call responses and reduce the number of calls to the blockchain
  const peggedIndexes = Array.from(Array(peggedAssets.length).keys());
  // randomize the order of the pegged indexes
  peggedIndexes.sort(() => Math.random() - 0.5)

  type Failure = { id: string; name: string; error: string };
  type Skip = { id: string; name: string; reason: 'delisted' | 'deadFrom' };
  const failures: Failure[] = [];
  const skipped: Skip[] = [];
  let successCount = 0;

  await new PromisePool()
    .withConcurrency(15)
    .for(peggedIndexes)
    .process(async (i: any) => {
      const asset: any = peggedAssets[i];
      if (asset.delisted) {
        skipped.push({ id: asset.id, name: asset.name, reason: 'delisted' });
        return;
      }
      if (asset.deadFrom) {
        skipped.push({ id: asset.id, name: asset.name, reason: 'deadFrom' });
        return;
      }

      const startTime = Date.now();
      let success = false;
      let errorObject: any;
      try {
        await storePeggedAssets([i])
        success = true;
        successCount++;
      } catch (e: any) {
        errorObject = e;
        const error = (e?.message ?? String(e)).split('\n')[0].slice(0, 250);
        failures.push({ id: asset.id, name: asset.name, error });
        console.log('error storing', asset.name)
        console.error(e)
      } finally {
        // Skip ES logging in DRY_RUN_MODE to avoid polluting prod ES from local tests
        if (process.env.DRY_RUN_MODE !== 'true') {
          const metadata = {
            application: 'stablecoins',
            type: 'pegged-asset',
            name: asset.gecko_id || asset.module || asset.name,
            assetId: asset.id,
          };
          const runtime = (Date.now() - startTime) / 1000;
          try {
            await sdk.elastic.addRuntimeLog({ runtime, success, metadata });
            if (!success && errorObject) {
              await sdk.elastic.addErrorLog({
                errorStringFull: JSON.stringify(errorObject?.message ?? errorObject),
                metadata,
              } as any);
            }
          } catch (logErr) {
            console.error('ES log failed for', asset.name, ':', logErr);
          }
        }
      }
    })

  // ─── Run summary ───
  const total = peggedIndexes.length;
  const ran = total - skipped.length;
  console.log('\n═══ Adapter run summary ═══');
  console.log(`Total assets:  ${total}`);
  console.log(`Skipped:       ${skipped.length} (delisted or deadFrom — not run)`);
  console.log(`Successful:    ${successCount}${ran > 0 ? ` (${((successCount / ran) * 100).toFixed(1)}% of ran)` : ''}`);
  console.log(`Failed:        ${failures.length}`);

  if (skipped.length > 0 && skipped.length <= 30) {
    console.log('\nSkipped assets:');
    for (const s of skipped) console.log(`  - ${s.name} (id=${s.id}) [${s.reason}]`);
  }

  const byError = new Map<string, Failure[]>();
  if (failures.length > 0) {
    for (const f of failures) {
      if (!byError.has(f.error)) byError.set(f.error, []);
      byError.get(f.error)!.push(f);
    }
    console.log('\nFailures grouped by error:');
    const sorted = [...byError.entries()].sort((a, b) => b[1].length - a[1].length);
    for (const [errMsg, fs] of sorted) {
      console.log(`  • [${fs.length}] ${errMsg}`);
      for (const f of fs.slice(0, 5)) console.log(`      - ${f.name} (id=${f.id})`);
      if (fs.length > 5) console.log(`      ... and ${fs.length - 5} more`);
    }
  }

  return { total, ran, successCount, skipped, failures, byError };
};

async function postSummaryDigest(summary: {
  total: number; ran: number; successCount: number;
  skipped: { name: string; id: string; reason: string }[];
  failures: { name: string; id: string; error: string }[];
  byError: Map<string, { name: string; id: string; error: string }[]>;
}) {
  const webhook = process.env.SUMMARY_WEBHOOK;
  if (!webhook || summary.failures.length === 0) return;

  const lines: string[] = [
    `🚨 **Stablecoin cron run — ${summary.failures.length} failure(s)**`,
    `Total: ${summary.total} · Skipped: ${summary.skipped.length} · OK: ${summary.successCount} · Failed: ${summary.failures.length}`,
    ``,
    `**Failures grouped by error:**`,
  ];
  const sorted = [...summary.byError.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [errMsg, fs] of sorted) {
    lines.push(`• [${fs.length}] ${errMsg}`);
    for (const f of fs.slice(0, 5)) lines.push(`    - ${f.name} (id=${f.id})`);
    if (fs.length > 5) lines.push(`    ... and ${fs.length - 5} more`);
  }
  try {
    await sendMessage(lines.join('\n'), webhook, false);
    console.log('Discord summary digest sent');
  } catch (e) {
    console.error('Failed to send Discord summary:', e);
  }
}

handler()
  .then(async (summary) => {
    if (process.env.SUMMARY_JSON === 'true') {
      console.log('\n--- SUMMARY_JSON_BEGIN ---');
      console.log(JSON.stringify({
        total: summary.total,
        ran: summary.ran,
        successCount: summary.successCount,
        skipped: summary.skipped,
        failures: summary.failures,
        runAt: Math.floor(Date.now() / 1000),
      }, null, 2));
      console.log('--- SUMMARY_JSON_END ---');
    }
    await postSummaryDigest(summary);
    console.log("done");
    console.log("saving cache");
    await saveSdkInternalCache();
    const failOnError = process.env.FAIL_ON_ERROR === 'true';
    process.exit(failOnError && summary.failures.length > 0 ? 1 : 0);
  })
  .catch(async (e) => {
    console.error('Fatal error in handler:', e);
    try { await saveSdkInternalCache(); } catch { }
    process.exit(2);
  });



async function initializeSdkInternalCache() {
  let currentCache = await sdk.cache.readCache(INTERNAL_CACHE_FILE)
  sdk.log('cache size:', JSON.stringify(currentCache).length, 'chains:', Object.keys(currentCache))
  const ONE_MONTH = 60 * 60 * 24 * 30
  if (!currentCache || !currentCache.startTime || (Date.now() / 1000 - currentCache.startTime > ONE_MONTH)) {
    currentCache = {
      startTime: Math.round(Date.now() / 1000),
    }
    await sdk.cache.writeCache(INTERNAL_CACHE_FILE, currentCache)
  }
  sdk.sdkCache.startCache(currentCache)
}

async function saveSdkInternalCache() {
  await sdk.cache.writeCache(INTERNAL_CACHE_FILE, sdk.sdkCache.retriveCache())
}
