import fs from "fs";
import path from "path";
import zlib from "zlib";
import * as sdk from "@defillama/sdk";
import { readRouteData, getRouteDataPath } from "../file-cache";
import { pegTypeFxTicker } from "../../src/utils/fxRates";
import {
  AssetInfo,
  RESOLUTIONS,
  Resolution,
  Tuple,
  assetRegistry,
  chainSlugFromLabel,
  identitySeriesFields,
  pointsToTuples,
  sampleByResolution,
  sumRecord,
  sumRecordOrNull,
} from "./shared";

const round = Math.round;

function toTuple(ts: any, value: any): Tuple | null {
  const t = typeof ts === "number" ? ts : Number(ts);
  if (!Number.isFinite(t) || typeof value !== "number" || !Number.isFinite(value)) return null;
  return [t, round(value)];
}

function sortDedupe(tuples: Tuple[]): Tuple[] {
  tuples.sort((a, b) => a[0] - b[0]);
  const out: Tuple[] = [];
  for (const t of tuples) {
    if (out.length && out[out.length - 1][0] === t[0]) out[out.length - 1] = t;
    else out.push(t);
  }
  return out;
}

let writtenPaths = new Set<string>();
let dirsCreated = new Map<string, Promise<unknown>>();
const ensureDir = (dir: string): Promise<unknown> => {
  let created = dirsCreated.get(dir);
  if (!created) {
    created = fs.promises.mkdir(dir, { recursive: true }).catch((e) => {
      dirsCreated.delete(dir);
      throw e;
    });
    dirsCreated.set(dir, created);
  }
  return created;
};

const BR_MIN_BYTES = 1024;
const brotli = (buf: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) =>
    zlib.brotliCompress(
      buf,
      { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length } },
      (err: any, out: Buffer) => (err ? reject(err) : resolve(out))
    )
  );

async function writeV2(subPath: string, data: any) {
  const filePath = getRouteDataPath(`v2/${subPath}`);
  await ensureDir(path.dirname(filePath));
  const buf = Buffer.from(JSON.stringify(data));
  const tmp = filePath + ".tmp";
  const brWrite = buf.length >= BR_MIN_BYTES ? brotli(buf).then((out) => fs.promises.writeFile(filePath + ".br.tmp", out)) : null;
  await Promise.all([fs.promises.writeFile(tmp, buf), brWrite]);
  if (brWrite) {
    await fs.promises.rename(filePath + ".br.tmp", filePath + ".br");
    writtenPaths.add(subPath + ".br");
  } else {
    await fs.promises.unlink(filePath + ".br").catch(() => {});
  }
  await fs.promises.rename(tmp, filePath);
  writtenPaths.add(subPath);
}

const IO_CONCURRENCY = 8;
const PARSE_CONCURRENCY = 3;
async function mapPool<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    for (let i = next++; i < items.length; i = next++) out[i] = await fn(items[i], i);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function sweepOrphans(): Promise<string[]> {
  const root = getRouteDataPath("v2");
  const removed: string[] = [];
  const walk = async (dir: string) => {
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
        continue;
      }
      const rel = path.relative(root, full);
      if (rel === "_manifest") continue;
      if (writtenPaths.has(rel)) continue;
      const gone = await fs.promises
        .unlink(full)
        .then(() => true)
        .catch(() => false);
      if (gone) removed.push(rel);
    }
  };
  await walk(root);
  return removed;
}

const exists = (filePath: string): Promise<boolean> =>
  fs.promises
    .access(filePath)
    .then(() => true)
    .catch(() => false);

type PublishedBefore = { chains: Set<string>; assets: Set<string> };

async function assertSourcesNotRegressed(chainLabels: string[], listed: [any, AssetInfo][]): Promise<PublishedBefore> {
  const lostChains = (
    await mapPool(chainLabels, IO_CONCURRENCY, async (label) => {
      const slug = chainSlugFromLabel(label);
      if (await exists(getRouteDataPath(`stablecoincharts2/${slug}`))) return null;
      return (await exists(getRouteDataPath(`v2/history/market-cap/daily/by-asset-chain/${slug}`))) ? slug : null;
    })
  ).filter(Boolean);
  const lostAssets = (
    await mapPool(listed, IO_CONCURRENCY, async ([, info]) => {
      if (await exists(getRouteDataPath(`stablecoin/${info.id}`))) return null;
      return (await exists(getRouteDataPath(`v2/asset/${info.slug}`))) ? info.slug : null;
    })
  ).filter(Boolean);
  const publishedSlugs = async (dir: string) =>
    (await fs.promises.readdir(getRouteDataPath(dir)).catch(() => [] as string[])).filter((f) => !/\.(br|tmp)$/.test(f));
  const publishedChains = await publishedSlugs("v2/history/market-cap/daily/by-asset-chain");
  const publishedAssets = await publishedSlugs("v2/asset");
  const nowChains = new Set(chainLabels.map(chainSlugFromLabel));
  const nowAssets = new Set(listed.map(([, info]) => info.slug));
  const retiredChains = publishedChains.filter((s) => !nowChains.has(s));
  const retiredAssets = publishedAssets.filter((s) => !nowAssets.has(s));

  const droppedChains = nowChains.size < publishedChains.length ? retiredChains : [];
  const droppedAssets = nowAssets.size < publishedAssets.length ? retiredAssets : [];
  if (retiredChains.length || retiredAssets.length) {
    console.error(
      `v2 build: slugs retired since the last build - chains [${retiredChains.join(", ") || "none"}], ` +
        `assets [${retiredAssets.join(", ") || "none"}]. Entity counts: chains ${publishedChains.length} -> ` +
        `${nowChains.size}, assets ${publishedAssets.length} -> ${nowAssets.size}` +
        (droppedChains.length || droppedAssets.length ? " - COUNT FELL, treating as source loss" : " (count held, treating as renames)")
    );
  }

  // volume is deliberately unguarded: aborting on it would freeze market-cap and supply too,
  // so a missing volume source is reported through `_manifest` instead
  const published: PublishedBefore = { chains: new Set(publishedChains), assets: new Set(publishedAssets) };
  const lost = lostChains.length + lostAssets.length + droppedChains.length + droppedAssets.length;
  if (!lost) return published;
  const detail =
    `unreadable chains [${lostChains.join(", ") || "none"}], unreadable assets [${lostAssets.join(", ") || "none"}], ` +
    `chains gone from the listing [${droppedChains.join(", ") || "none"}], ` +
    `assets gone from the listing [${droppedAssets.join(", ") || "none"}]`;
  if (process.env.STABLECOINS_V2_ALLOW_SOURCE_REGRESSION === "1") {
    console.error(`v2 build: source regression accepted via STABLECOINS_V2_ALLOW_SOURCE_REGRESSION: ${detail}`);
    return published;
  }
  throw new Error(
    `v2 build: ${lost} source(s) that previously published artifacts are now ` +
      `missing - refusing to publish a build with holes in it: ${detail}. ` +
      `The previous build is left intact and will be served until it ages out. If this is a genuine delisting, ` +
      `rerun once with STABLECOINS_V2_ALLOW_SOURCE_REGRESSION=1.`
  );
}

type SeriesEntry = { data: Tuple[]; [key: string]: any };

function sortSeries(series: SeriesEntry[]): SeriesEntry[] {
  const last = (s: SeriesEntry) => (s.data.length ? s.data[s.data.length - 1][1] : -Infinity);
  return series.filter((s) => s.data.length).sort((a, b) => last(b) - last(a));
}

// writes {unit, data} or {unit, series} at every resolution
async function writeHistory(pathFor: (res: Resolution) => string, generatedAt: number, unit: string, payload: { data?: Tuple[]; series?: SeriesEntry[] }) {
  if (payload.data) {
    const sampled = sampleByResolution(payload.data);
    await mapPool(RESOLUTIONS, RESOLUTIONS.length, (res) => writeV2(pathFor(res), { generatedAt, unit, data: sampled[res] }));
    return;
  }
  // sortSeries keys on each series' LAST point, and sampling moves neither: the last bucket's period-end point IS the last daily point, and a non-empty series can't sample down to empty.
  const ordered = sortSeries(payload.series ?? []);
  const sampled = ordered.map((s) => sampleByResolution(s.data));
  await mapPool(RESOLUTIONS, RESOLUTIONS.length, (res) =>
    writeV2(pathFor(res), {
      generatedAt,
      unit,
      series: res === "daily" ? ordered : ordered.map((s, i) => ({ ...s, data: sampled[i][res] })),
    })
  );
}

export async function buildV2Files() {
  const generatedAt = Math.floor(Date.now() / 1e3);
  const reg = assetRegistry();
  if (reg.issues.length) {
    throw new Error(
      `v2 build: ${reg.issues.length} unusable peggedData entries - refusing to publish: ${reg.issues.join("; ")}. ` +
        `The previous build is left intact and will be served until it ages out; fix peggedData to unblock.`
    );
  }
  const stats = {
    written: 0,
    missingChainFiles: [] as string[],
    missingAssetFiles: [] as string[],
    missingVolumeFiles: [] as string[],
    volumeSources: 0,
    removed: 0,
    droppedPoints: 0,
    sweepSkipped: false,
    derivedVolume: 0,
  };
  writtenPaths = new Set<string>();
  dirsCreated = new Map<string, Promise<unknown>>();

  let [stablecoins, stablecoinChains, chartsAll, domFile, rates] = await Promise.all([
    readRouteData("stablecoins"),
    readRouteData("stablecoinchains"),
    readRouteData("stablecoincharts2/all"),
    readRouteData("stablecoincharts2/all-dominance-chain-breakdown"),
    readRouteData("rates"),
  ]);

  // guard on content, not key presence - an empty-but-present source would publish as healthy
  const sourceAssets: any[] = Array.isArray(stablecoins?.peggedAssets) ? stablecoins.peggedAssets : [];
  const breakdownIds = chartsAll?.breakdown && typeof chartsAll.breakdown === "object" ? Object.keys(chartsAll.breakdown) : [];
  if (!sourceAssets.length) throw new Error("v2 build: /stablecoins has no peggedAssets - refusing to publish an empty dataset");
  if (!breakdownIds.length) throw new Error("v2 build: stablecoincharts2/all has an empty breakdown - refusing to publish an empty dataset");
  if (!Array.isArray(stablecoinChains) || !stablecoinChains.length) {
    throw new Error("v2 build: /stablecoinchains is empty - refusing to publish an empty dataset");
  }

  const previousManifest = await readRouteData("v2/_manifest");
  const previousAssets = await readRouteData("v2/assets");
  const previousCount =
    typeof previousManifest?.assets === "number"
      ? previousManifest.assets
      : Array.isArray(previousAssets?.assets)
      ? previousAssets.assets.length
      : 0;

  const latestRates: Record<string, number> = rates?.[rates.length - 1]?.rates ?? {};
  const referenceUsdFor = (info: AssetInfo): number | null => {
    if (info.pegType === "peggedUSD") return 1;
    if (info.pegType === "peggedVAR") return null;
    const rate = latestRates[pegTypeFxTicker(info.pegType)];
    return rate && isFinite(1 / rate) ? 1 / rate : null;
  };

  const chainLabels: string[] = (stablecoinChains ?? []).map((c: any) => c.name);
  const doubleIds = new Set<string>((chartsAll.doublecountedIds ?? []).map(String));

  // ---------- current-data snapshots ----------

  const snapshotOf = (a: any, info: AssetInfo, scope?: any) => ({
    id: info.id,
    slug: info.slug,
    name: info.name,
    symbol: info.symbol,
    geckoId: info.geckoId,
    pegCurrency: info.pegCurrency,
    pegMechanism: info.pegMechanism,
    priceUsd: typeof a.price === "number" ? a.price : null,
    referenceUsd: referenceUsdFor(info),
    circulatingUsd: sumRecordOrNull(scope ? scope.current : a.circulating) ?? 0,
    circulatingUsdPrevDay: sumRecordOrNull(scope ? scope.circulatingPrevDay : a.circulatingPrevDay),
    circulatingUsdPrevWeek: sumRecordOrNull(scope ? scope.circulatingPrevWeek : a.circulatingPrevWeek),
    circulatingUsdPrevMonth: sumRecordOrNull(scope ? scope.circulatingPrevMonth : a.circulatingPrevMonth),
    chains: (a.chains ?? []).map(chainSlugFromLabel),
    ...(info.doublecounted ? { doublecounted: true } : {}),
    ...(info.deprecated ? { deprecated: true } : {}),
    ...(info.delisted ? { delisted: true } : {}),
    ...(info.yieldBearing ? { yieldBearing: true } : {}),
  });

  const listed: [any, AssetInfo][] = [];
  for (const a of stablecoins.peggedAssets) {
    const info = reg.byId.get(String(a.id));
    if (!info) {
      console.error(`v2 build: /stablecoins asset id ${a.id} missing from peggedData`);
      continue;
    }
    listed.push([a, info]);
  }

  if (!listed.length) {
    throw new Error(`v2 build: none of the ${sourceAssets.length} /stablecoins assets resolved against peggedData - refusing to publish an empty dataset`);
  }
  if (previousCount && listed.length < previousCount / 2) {
    throw new Error(`v2 build: asset count collapsed ${previousCount} -> ${listed.length} - refusing to publish`);
  }

  // pre-flight: refuse to publish if a source that previously published artifacts is now unreadable
  const publishedBefore = await assertSourcesNotRegressed(chainLabels, listed);

  await writeV2("assets", {
    generatedAt,
    assets: listed.map(([a, info]) => snapshotOf(a, info)).sort((x, y) => y.circulatingUsd - x.circulatingUsd),
  });
  stats.written++;

  await mapPool(chainLabels, IO_CONCURRENCY, async (label) => {
    const scoped = listed
      .map(([a, info]) => {
        const chainScope = a.chainCirculating?.[label];
        if (!chainScope) return null;
        return snapshotOf(a, info, chainScope);
      })
      .filter(Boolean) as any[];
    await writeV2(`assets-chain/${chainSlugFromLabel(label)}`, {
      generatedAt,
      assets: scoped.sort((x, y) => y.circulatingUsd - x.circulatingUsd),
    });
    stats.written++;
  });

  // chains snapshot: totals from /stablecoinchains, prev* from the per-chain series, dominant from dominanceMap
  let chainChartMap = domFile?.chainChartMap ?? {};
  let dominanceMap = domFile?.dominanceMap ?? {};
  const valueAtOffset = (tuples: Tuple[], last: number, offsetDays: number): number | null => {
    const target = last - offsetDays * 86400;
    let best: Tuple | null = null;
    for (const t of tuples) {
      if (Math.abs(t[0] - target) <= 86400 * 1.5 && (!best || Math.abs(t[0] - target) < Math.abs(best[0] - target))) best = t;
    }
    return best ? best[1] : null;
  };
  const chainsOut = (stablecoinChains ?? []).map((c: any) => {
    const tuples = pointsToTuples(chainChartMap[c.name] ?? [], "totalCirculatingUSD");
    const lastTs = tuples.length ? tuples[tuples.length - 1][0] : 0;
    const domPoints = dominanceMap[c.name] ?? [];
    const greatest = domPoints.length ? domPoints[domPoints.length - 1]?.greatestMcap : null;
    const domAsset = greatest?.gecko_id ? reg.byGeckoId.get(greatest.gecko_id) : null;
    return {
      slug: chainSlugFromLabel(c.name),
      name: c.name,
      circulatingUsd: round(sumRecord(c.totalCirculatingUSD)),
      circulatingUsdPrevDay: tuples.length ? valueAtOffset(tuples, lastTs, 1) : null,
      circulatingUsdPrevWeek: tuples.length ? valueAtOffset(tuples, lastTs, 7) : null,
      circulatingUsdPrevMonth: tuples.length ? valueAtOffset(tuples, lastTs, 30) : null,
      dominantAsset: greatest
        ? { slug: domAsset?.slug ?? null, symbol: greatest.symbol, circulatingUsd: round(greatest.mcap) }
        : null,
    };
  });
  await writeV2("chains", { generatedAt, chains: chainsOut.sort((a: any, b: any) => b.circulatingUsd - a.circulatingUsd) });
  stats.written++;

  // ---------- market-cap histories ----------

  // global total excludes doublecounted, so it's summed from the clean series rather than v1's aggregate
  const globalByDate = new Map<number, number>();
  const assetSeriesGlobal: SeriesEntry[] = [];
  const assetTotals: [AssetInfo, Tuple[]][] = [];
  for (const [id, points] of Object.entries(chartsAll.breakdown)) {
    const info = reg.byId.get(id);
    if (!info) continue;
    const tuples = pointsToTuples(points as any[], "totalCirculatingUSD");
    assetSeriesGlobal.push({ ...identitySeriesFields(info), data: tuples });
    if (!doubleIds.has(id)) for (const [ts, v] of tuples) globalByDate.set(ts, (globalByDate.get(ts) ?? 0) + v);
    assetTotals.push([info, tuples]);
  }
  await mapPool(assetTotals, IO_CONCURRENCY, async ([info, tuples]) => {
    await writeHistory((r) => `history/market-cap/${r}/total-asset/${info.slug}`, generatedAt, "usd", { data: tuples });
    stats.written += 3;
  });
  chartsAll.breakdown = null;
  assetTotals.length = 0;
  const globalTotal: Tuple[] = [...globalByDate.entries()].sort((a, b) => a[0] - b[0]).map(([t, v]) => [t, round(v)]);
  globalByDate.clear();
  await writeHistory((r) => `history/market-cap/${r}/total`, generatedAt, "usd", { data: globalTotal });
  await writeHistory((r) => `history/market-cap/${r}/by-asset`, generatedAt, "usd", { series: assetSeriesGlobal });
  stats.written += 6;
  assetSeriesGlobal.length = 0;

  const chainSeriesGlobal: SeriesEntry[] = Object.entries(chainChartMap).map(([label, points]) => ({
    slug: chainSlugFromLabel(label),
    name: label,
    data: pointsToTuples(points as any[], "totalCirculatingUSD"),
  }));
  domFile = null;
  chainChartMap = {};
  dominanceMap = {};
  await writeHistory((r) => `history/market-cap/${r}/by-chain`, generatedAt, "usd", { series: chainSeriesGlobal });
  stats.written += 3;
  await mapPool(chainSeriesGlobal, IO_CONCURRENCY, async (s) => {
    await writeHistory((r) => `history/market-cap/${r}/total-chain/${s.slug}`, generatedAt, "usd", { data: s.data });
    stats.written += 3;
  });
  chainSeriesGlobal.length = 0;

  // per-chain asset breakdowns + per-asset chain breakdowns in one pass over the v1 chain files
  const perAssetChains = new Map<string, SeriesEntry[]>();
  const chainResults = await mapPool(chainLabels, PARSE_CONCURRENCY, async (label) => {
    const chainSlug = chainSlugFromLabel(label);
    const chainFile = await readRouteData(`stablecoincharts2/${chainSlug}`);
    if (!chainFile?.breakdown) return { chainSlug, perAsset: null };
    const series: SeriesEntry[] = [];
    const perAsset: [string, SeriesEntry][] = [];
    for (const [id, points] of Object.entries(chainFile.breakdown)) {
      const info = reg.byId.get(id);
      if (!info) continue;
      const tuples = pointsToTuples(points as any[], "totalCirculatingUSD");
      if (!tuples.length) continue;
      series.push({ ...identitySeriesFields(info), data: tuples });
      perAsset.push([id, { slug: chainSlug, name: label, data: tuples }]);
    }
    await writeHistory((r) => `history/market-cap/${r}/by-asset-chain/${chainSlug}`, generatedAt, "usd", { series });
    stats.written += 3;
    return { chainSlug, perAsset };
  });
  // folded back in chain-list order
  for (const { chainSlug, perAsset } of chainResults) {
    if (!perAsset) {
      stats.missingChainFiles.push(chainSlug);
      continue;
    }
    for (const [id, entry] of perAsset) {
      if (!perAssetChains.has(id)) perAssetChains.set(id, []);
      perAssetChains.get(id)!.push(entry);
    }
  }
  await mapPool([...perAssetChains], IO_CONCURRENCY, async ([id, series]) => {
    const info = reg.byId.get(id)!;
    await writeHistory((r) => `history/market-cap/${r}/by-chain-asset/${info.slug}`, generatedAt, "usd", { series });
    stats.written += 3;
  });
  perAssetChains.clear();

  // ---------- supply histories (raw token counts, from the v1 asset detail files) ----------

  // one unit of work per asset; misses are folded back afterwards so stats stay deterministic
  const assetMisses = await mapPool(listed, PARSE_CONCURRENCY, async ([listedAsset, info]) => {
    const detail = await readRouteData(`stablecoin/${info.id}`);
    if (!detail) return info.slug;
    // both variants share one walk of the token array; they differ only by the unreleased addend
    const tuplesBoth = (tokens: any[]): { plain: Tuple[]; unreleased: Tuple[] } => {
      const plain: Tuple[] = [];
      const unreleased: Tuple[] = [];
      for (const t of tokens ?? []) {
        if (!t || t.circulating === undefined) continue;
        const circulating = sumRecord(t.circulating);
        const a = toTuple(t.date, circulating);
        const b = toTuple(t.date, circulating + sumRecord(t.unreleased));
        if (a && b) {
          plain.push(a);
          unreleased.push(b);
        } else stats.droppedPoints++;
      }
      return { plain: sortDedupe(plain), unreleased: sortDedupe(unreleased) };
    };
    const totals = tuplesBoth(detail.tokens);
    const chainEntries = Object.entries(detail.chainBalances ?? {}).map(([label, v]: [string, any]) => ({
      slug: chainSlugFromLabel(label),
      name: label,
      both: tuplesBoth(v?.tokens ?? []),
    }));
    const chainSeriesFor = (key: "plain" | "unreleased"): SeriesEntry[] =>
      chainEntries.map((c) => ({ slug: c.slug, name: c.name, data: c.both[key] }));
    await writeHistory((r) => `history/supply/${r}/${info.slug}/total`, generatedAt, "count", { data: totals.plain });
    await writeHistory((r) => `history/supply/${r}/${info.slug}/total-unreleased`, generatedAt, "count", { data: totals.unreleased });
    await writeHistory((r) => `history/supply/${r}/${info.slug}/by-chain`, generatedAt, "count", { series: chainSeriesFor("plain") });
    await writeHistory((r) => `history/supply/${r}/${info.slug}/by-chain-unreleased`, generatedAt, "count", { series: chainSeriesFor("unreleased") });
    stats.written += 4 * RESOLUTIONS.length;

    const priceUsd = typeof detail.price === "number" ? detail.price : null;
    const refUsd = referenceUsdFor(info);
    const price = priceUsd ?? refUsd;
    const toUsd = (rec: any): number | null => (price === null ? null : round(sumRecord(rec) * price));
    const lastOf = (tokens: any[]) => (tokens?.length ? tokens[tokens.length - 1] : null);
    const chainsCurrent = Object.entries(detail.chainBalances ?? {})
      .map(([label, v]: [string, any]) => {
        const last = lastOf(v?.tokens ?? []);
        if (!last) return null;
        const scope = listedAsset.chainCirculating?.[label];
        return {
          slug: chainSlugFromLabel(label),
          name: label,
          circulatingUsd: scope ? sumRecordOrNull(scope.current) ?? 0 : toUsd(last.circulating),
          unreleasedUsd: toUsd(last.unreleased),
          bridgedInUsd: toUsd(last.bridgedTo),
          mintedUsd: toUsd(last.minted),
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => (b.circulatingUsd ?? -1) - (a.circulatingUsd ?? -1));
    const globalLast = lastOf(detail.tokens);
    const raw = info.raw;
    await writeV2(`asset/${info.slug}`, {
      generatedAt,
      id: info.id,
      slug: info.slug,
      name: info.name,
      symbol: info.symbol,
      geckoId: info.geckoId,
      cmcId: raw.cmcId ?? null,
      address: raw.address ?? null,
      pegCurrency: info.pegCurrency,
      pegMechanism: info.pegMechanism,
      priceSource: raw.priceSource ?? null,
      priceUsd,
      referenceUsd: refUsd,
      description: raw.description ?? null,
      mintRedeemDescription: raw.mintRedeemDescription ?? null,
      url: raw.url ?? null,
      twitter: raw.twitter ?? null,
      wiki: raw.wiki ?? null,
      auditLinks: raw.auditLinks ?? raw.audit_links ?? [],
      onCoinGecko: raw.onCoinGecko === "true" || raw.onCoinGecko === true,
      circulatingUsd: sumRecordOrNull(listedAsset.circulating) ?? 0,
      unreleasedUsd: globalLast ? toUsd(globalLast.unreleased) : 0,
      ...(info.doublecounted ? { doublecounted: true } : {}),
      ...(info.deprecated ? { deprecated: true } : {}),
      ...(info.delisted ? { delisted: true } : {}),
      ...(info.yieldBearing ? { yieldBearing: true } : {}),
      ...(info.deadFrom ? { deadFrom: info.deadFrom } : {}),
      chains: chainsCurrent,
    });
    stats.written++;
    return null;
  });
  for (const slug of assetMisses) if (slug) stats.missingAssetFiles.push(slug);

  // ---------- volume histories (1:1 transforms of the v1 volume files) ----------
  await buildVolume(generatedAt, reg, stats);

  // sweep only runs if no sources regressed vs the previous build - a missing source could be delisted or just unreadable, and deleting on the latter is catastrophic
  const prevMissingChains = typeof previousManifest?.missingChainSources === "number" ? previousManifest.missingChainSources : Infinity;
  const prevMissingAssets = typeof previousManifest?.missingAssetSources === "number" ? previousManifest.missingAssetSources : Infinity;
  const unreadableChains = stats.missingChainFiles.filter((s) => publishedBefore.chains.has(s));
  const unreadableAssets = stats.missingAssetFiles.filter((s) => publishedBefore.assets.has(s));
  const degraded =
    stats.missingChainFiles.length > prevMissingChains ||
    stats.missingAssetFiles.length > prevMissingAssets ||
    unreadableChains.length > 0 ||
    unreadableAssets.length > 0;
  if (degraded) {
    stats.sweepSkipped = true;
    console.error(
      `v2 build: SOURCES REGRESSED (chains ${prevMissingChains} -> ${stats.missingChainFiles.length}, ` +
        `assets ${prevMissingAssets} -> ${stats.missingAssetFiles.length}) - skipping orphan sweep to avoid ` +
        `deleting still-good data. Missing chains: ${stats.missingChainFiles.join(", ") || "none"}; ` +
        `missing assets: ${stats.missingAssetFiles.join(", ") || "none"}; ` +
        `previously published but unreadable now: chains [${unreadableChains.join(", ") || "none"}], ` +
        `assets [${unreadableAssets.join(", ") || "none"}]`
    );
  }
  if (stats.missingVolumeFiles.length) {
    console.error(
      `v2 build: ${stats.missingVolumeFiles.length} volume source(s) unreadable - those routes will answer ` +
        `data_unavailable until the next run: ${stats.missingVolumeFiles.join(", ")}`
    );
  }
  const removed = degraded ? [] : await sweepOrphans();
  stats.removed = removed.length;

  // `_manifest` is written LAST - it's the only proof a run completed; serving relies on that
  await writeV2("_manifest", {
    generatedAt,
    files: writtenPaths.size,
    assets: listed.length,
    chains: chainLabels.length,
    missingChainSources: stats.missingChainFiles.length,
    missingAssetSources: stats.missingAssetFiles.length,
    missingVolumeSources: stats.missingVolumeFiles.length,
    volumeSources: stats.volumeSources,
  });

  console.log(
    `v2 build done: ${stats.written} files, ${removed.length} orphans removed` +
      (stats.missingChainFiles.length ? `; missing chain sources: ${stats.missingChainFiles.length}` : "") +
      (stats.missingAssetFiles.length ? `; missing asset sources: ${stats.missingAssetFiles.length}` : "") +
      (stats.missingVolumeFiles.length ? `; missing volume sources: ${stats.missingVolumeFiles.length}` : "")
  );
  return stats;
}

const TOP_LEVEL_VOLUME = [
  "chart-total",
  "chart-total-chain-breakdown",
  "chart-total-token-breakdown",
  "chart-total-currency-breakdown",
];

async function buildVolume(generatedAt: number, reg: ReturnType<typeof assetRegistry>, stats: any) {
  const volumeDir = getRouteDataPath("volume");
  let files: string[] = [];
  try {
    files = await fs.promises.readdir(volumeDir);
  } catch {
    stats.missingVolumeFiles.push(...TOP_LEVEL_VOLUME);
    console.error("v2 build: no volume files found, skipping volume endpoints");
    return;
  }
  // drop stray .tmp/.br files - their names would leak into route paths
  files = files.filter((f) => !/\.(tmp|br)$/.test(f));
  stats.volumeSources = files.length;
  const readVolume = (name: string) => readRouteData(`volume/${name}`);

  const totalTuples = (rows: any[]): Tuple[] => {
    const out: Tuple[] = [];
    for (const r of rows ?? []) {
      const tuple = Array.isArray(r) ? toTuple(r[0], r[1]) : null;
      if (tuple) out.push(tuple);
      else stats.droppedPoints++;
    }
    return sortDedupe(out);
  };

  // breakdown rows [[ts, {key: value}]] -> one series per key
  const breakdownSeries = (rows: any[], identityFor: (key: string) => any): SeriesEntry[] => {
    const byKey = new Map<string, Tuple[]>();
    for (const row of rows ?? []) {
      if (!Array.isArray(row)) {
        stats.droppedPoints++;
        continue;
      }
      const [ts, values] = row;
      for (const [key, value] of Object.entries(values ?? {})) {
        const tuple = toTuple(ts, value);
        if (!tuple) {
          stats.droppedPoints++;
          continue;
        }
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key)!.push(tuple);
      }
    }
    return [...byKey.entries()].map(([key, data]) => ({ ...identityFor(key), data: sortDedupe(data) }));
  };

  const assetIdentity = (symbol: string) => {
    const matches = reg.bySymbol.get(symbol.toUpperCase()) ?? [];
    // volume sources are keyed by symbol; only a unique match earns an asset identity
    if (matches.length === 1) return { id: matches[0].id, slug: matches[0].slug, name: matches[0].name, symbol: matches[0].symbol };
    return { slug: null, name: symbol, symbol };
  };
  // breakdown keys are chain keys ("optimism"); resolve to a display label
  const chainIdentity = (key: string) => {
    const name = sdk.chainUtils.getChainLabelFromKey(key);
    return { slug: chainSlugFromLabel(name), name };
  };
  // volume filenames carry label-slugs, not chain keys, so resolve via the chain list:
  // getChainLabelFromKey mangles them (e.g. "op-mainnet" -> "Op-mainnet")
  const labelBySlug = new Map<string, string>();
  for (const label of Object.values(sdk.chainUtils.chainKeyToChainLabelMap ?? {}) as string[]) {
    if (label) labelBySlug.set(chainSlugFromLabel(label), label);
  }
  const chainIdentityFromSlug = (slug: string) => ({ slug, name: labelBySlug.get(slug) ?? sdk.chainUtils.getChainLabelFromKey(slug) });
  const currencyIdentity = (code: string) => ({ slug: code.toLowerCase(), name: code.toUpperCase() });

  const writeIf = async (rows: any, pathFor: (r: Resolution) => string, payload: { data?: Tuple[]; series?: SeriesEntry[] }) => {
    if (!rows) return;
    await writeHistory(pathFor, generatedAt, "usd", payload);
    stats.written += 3;
  };

  const [totalRows, chainBreakdown, tokenBreakdown, currencyBreakdown] = await Promise.all(
    TOP_LEVEL_VOLUME.map(readVolume)
  );
  // readRouteData nulls both unreadable and deleted sources - count either rather than skip silently
  for (const [i, rows] of [totalRows, chainBreakdown, tokenBreakdown, currencyBreakdown].entries()) {
    if (!rows) stats.missingVolumeFiles.push(TOP_LEVEL_VOLUME[i]);
  }
  // pivoted once, reused by its own endpoint and the derived families below
  const chainSeries = chainBreakdown ? breakdownSeries(chainBreakdown, chainIdentity) : [];
  const tokenSeries = tokenBreakdown ? breakdownSeries(tokenBreakdown, assetIdentity) : [];
  if (totalRows) await writeIf(totalRows, (r) => `history/volume/${r}/total`, { data: totalTuples(totalRows) });
  if (chainBreakdown) await writeIf(chainBreakdown, (r) => `history/volume/${r}/by-chain`, { series: chainSeries });
  if (tokenBreakdown) await writeIf(tokenBreakdown, (r) => `history/volume/${r}/by-asset`, { series: tokenSeries });
  if (currencyBreakdown) await writeIf(currencyBreakdown, (r) => `history/volume/${r}/by-pegcurrency`, { series: breakdownSeries(currencyBreakdown, currencyIdentity) });

  // asset -> per-chain volume, pivoted out of the per-chain token breakdowns below
  const perAssetChainVolume = new Map<string, SeriesEntry[]>();

  const fileResults = await mapPool(files, PARSE_CONCURRENCY, async (file) => {
    if (file.startsWith("chart-chain-")) {
      const rest = file.slice("chart-chain-".length);
      if (rest.endsWith("-token-breakdown")) {
        const chainSlug = rest.slice(0, -"-token-breakdown".length);
        const rows = await readVolume(file);
        const series = breakdownSeries(rows, assetIdentity);
        await writeIf(rows, (r) => `history/volume/${r}/chain/${chainSlug}/by-asset`, { series });
        return series
          .filter((s) => s.slug && s.data.length)
          .map((s): [string, SeriesEntry] => [s.slug, { ...chainIdentityFromSlug(chainSlug), data: s.data }]);
      } else if (rest.endsWith("-currency-breakdown")) {
        const chainSlug = rest.slice(0, -"-currency-breakdown".length);
        const rows = await readVolume(file);
        await writeIf(rows, (r) => `history/volume/${r}/chain/${chainSlug}/by-pegcurrency`, { series: breakdownSeries(rows, currencyIdentity) });
      } else {
        const rows = await readVolume(file);
        await writeIf(rows, (r) => `history/volume/${r}/chain/${rest}/total`, { data: totalTuples(rows) });
      }
    } else if (file.startsWith("chart-token-")) {
      const rest = file.slice("chart-token-".length);
      const isChainBreakdown = rest.endsWith("-chain-breakdown");
      const symbol = isChainBreakdown ? rest.slice(0, -"-chain-breakdown".length) : rest;
      const matches = reg.bySymbol.get(symbol.toUpperCase()) ?? [];
      if (matches.length !== 1) return null;
      const slug = matches[0].slug;
      const rows = await readVolume(file);
      if (isChainBreakdown) await writeIf(rows, (r) => `history/volume/${r}/asset/${slug}/by-chain`, { series: breakdownSeries(rows, chainIdentity) });
      else await writeIf(rows, (r) => `history/volume/${r}/asset/${slug}/total`, { data: totalTuples(rows) });
    }
    return null;
  });
  for (const entries of fileResults) {
    for (const [slug, entry] of entries ?? []) {
      if (!perAssetChainVolume.has(slug)) perAssetChainVolume.set(slug, []);
      perAssetChainVolume.get(slug)!.push(entry);
    }
  }

  type Derived = [(r: Resolution) => string, { data?: Tuple[]; series?: SeriesEntry[] }];
  const pending: Derived[] = [];
  const queued = new Set<string>();
  const derive = (subPath: (r: Resolution) => string, payload: Derived[1]) => {
    const daily = subPath("daily");
    if (writtenPaths.has(daily) || queued.has(daily)) return; // a dedicated source file already wrote it
    queued.add(daily);
    pending.push([subPath, payload]);
  };

  for (const s of chainSeries) {
    if (!s.slug || !s.data.length) continue;
    derive((r) => `history/volume/${r}/chain/${s.slug}/total`, { data: s.data });
  }
  for (const s of tokenSeries) {
    if (!s.slug || !s.data.length) continue;
    derive((r) => `history/volume/${r}/asset/${s.slug}/total`, { data: s.data });
  }
  for (const [slug, series] of perAssetChainVolume) {
    derive((r) => `history/volume/${r}/asset/${slug}/by-chain`, { series });
  }
  await mapPool(pending, IO_CONCURRENCY, async ([subPath, payload]) => {
    await writeHistory(subPath, generatedAt, "usd", payload);
    stats.written += 3;
    stats.derivedVolume = (stats.derivedVolume ?? 0) + 3;
  });
}
