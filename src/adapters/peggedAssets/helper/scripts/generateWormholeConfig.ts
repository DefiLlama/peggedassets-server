/*
 * Generate Wormhole Portal Token Bridge configs for pegged asset adapters.
 *
 * With no args, iterates over every peggedData entry that declares
 * `bridgeConfig.wormholeConfig` and writes a fresh wormholeConfig.ts under each
 * adapter directory. Pass `--asset <gecko_id>` to run for just one.
 *
 * Matching: tokens are matched by `symbol` field against the configured symbols
 * list (default `[peggedAsset.symbol]`). The Wormhole registry has no
 * coinGeckoId field on per-chain token entries.
 *
 * Source attribution: each registry token carries an explicit `original` field
 * (a Wormhole Chain name like "Ethereum") on wormhole-wrapped entries; native
 * mints lack the field. No collateral voting and no source-chain pin needed —
 * the registry is unambiguous about which chain each wrapped variant tracks.
 *
 * Topology: WormholeConfig = BridgeAttribution[]. The generated file emits an
 * array, one BridgeAttribution per source chain, with tokens listing the
 * destination chains where the wormhole-wrapped supply lives.
 *
 * Usage:
 *   ts-node src/adapters/peggedAssets/helper/scripts/generateWormholeConfig.ts
 *   ts-node src/adapters/peggedAssets/helper/scripts/generateWormholeConfig.ts --asset usd-coin
 *   ts-node src/adapters/peggedAssets/helper/scripts/generateWormholeConfig.ts --dry
 *
 * CLI flags:
 *   --asset <gecko_id>   Optional. Restrict to one asset. When specified, bypasses
 *                        the bridgeConfig.wormholeConfig gate — see inline comment
 *                        in main(). Mirrors HL generator's --asset behavior.
 *   --dry                Optional. Print each generated file to stdout instead of
 *                        writing. Skips syncChainsAllowlist.
 */
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

import peggedAssets from "../../../../peggedData/peggedData";

// `@wormhole-foundation/sdk-base` is dual-published (CJS + ESM) and the
// published package ships only compiled output (no source .ts). Its exports
// field blocks direct deep-path imports of the underlying mainnetChainTokens
// const-map (e.g. .../dist/cjs/constants/tokens/mainnet.js is "not defined by
// exports"). The supported access pattern is the high-level query API exposed
// at the "./tokens" subpath. We iterate the `chains` constant from the package
// root (mixed-network list) and ask getTokensBySymbol per chain; the API
// returns undefined for chains that lack the symbol on Mainnet.
type WormholeToken = {
  chain: string;       // Wormhole chain name (PascalCase, e.g. "Ethereum")
  symbol: string;
  address: string;
  decimals: number;
  original?: string;   // present on wormhole-wrapped entries; the source chain name
  key: string;
};

type WormholeTokensApi = {
  getTokensBySymbol: (
    network: "Mainnet",
    chain: string,
    symbol: string
  ) => WormholeToken[] | undefined;
};

function loadWormholeRegistry() {
  // require.resolve honors the exports map → resolves to dist/cjs/index.js.
  // The package.json is two levels up from that file.
  const cjsEntryDir = path.dirname(
    require.resolve("@wormhole-foundation/sdk-base")
  );
  const registryPackageJson = require(
    path.join(cjsEntryDir, "..", "..", "package.json")
  ) as { version: string };

  const tokenApi = require("@wormhole-foundation/sdk-base/tokens") as WormholeTokensApi;
  const root = require("@wormhole-foundation/sdk-base") as { chains: readonly string[] };

  return {
    getTokensBySymbol: tokenApi.getTokensBySymbol,
    allChainNames: root.chains,
    registryVersion: registryPackageJson.version,
  };
}

const DEFILLAMA_ADAPTERS_CHAINS_URL =
  "https://raw.githubusercontent.com/DefiLlama/DefiLlama-Adapters/main/projects/helper/chains.json";
const LOCAL_CHAINS_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "helper",
  "chains.json"
);

// Maps lowercase Wormhole chain name → DefiLlama llamaKey when they differ.
// Identity (lower(chainName) === llamaKey) does not need an entry here.
//
// Verified against @wormhole-foundation/sdk-base@4.20.0 Mainnet token list and
// src/adapters/peggedAssets/helper/chains.json. When a new WH chain appears
// (logged in the unknown-skip summary at generator runtime), re-run this
// verification before adjusting.
const WH_NAME_TO_LLAMA: Record<string, string> = {
  avalanche: "avax", // DefiLlama uses "avax" for Avalanche C-Chain
};

// Resolve a Wormhole chain name to the canonical DefiLlama llamaKey.
// Applied bilaterally to both destination (token.chain) and source
// (token.original). Returns undefined for chains with no mapping
// (log + skip at the call site).
function toWormholeChainLlamaKey(
  whChainName: string,
  localChainsSet: Set<string>
): string | undefined {
  const lower = whChainName.toLowerCase();
  if (WH_NAME_TO_LLAMA[lower]) return WH_NAME_TO_LLAMA[lower];
  if (localChainsSet.has(lower)) return lower;
  return undefined;
}

type Args = {
  asset?: string;
  dry: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  const asset = typeof args.asset === "string" ? args.asset : undefined;
  return { asset, dry: args.dry === true };
}

type WormholeRegistry = ReturnType<typeof loadWormholeRegistry>;

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

type Hit = {
  destLlamaKey: string;
  srcLlamaKey: string;
  address: string;
  decimals: number;
  symbol: string;
};

type AssetResult = {
  geckoId: string;
  chains: string[];
  unknownChains: Map<string, string>;
  entriesEmitted: number;
  sourceChainCount: number;
  skippedNonEvm: number;
  skippedUnknownDest: number;
  skippedUnknownSrc: number;
  skippedSelfRef: number;
  skippedDuplicate: number;
  decimalOutliers: number;
};

async function main() {
  const { asset, dry } = parseArgs(process.argv.slice(2));
  const localChains: string[] = JSON.parse(
    fs.readFileSync(LOCAL_CHAINS_PATH, "utf8")
  );
  const localChainsSet = new Set(localChains);
  const registry = loadWormholeRegistry();

  let targets: any[];

  if (asset) {
    // --asset bypasses the bridgeConfig.wormholeConfig gate intentionally,
    // mirroring generateHyperlaneConfig.ts — allows running and testing the
    // generator on any asset before the per-asset gate is wired up in
    // peggedData, keeping generator changes and peggedData wiring as
    // independent commits.
    const allAssets = peggedAssets as any[];
    const match = allAssets.find(
      (p) => p.gecko_id === asset || p.module === asset
    );
    if (!match) {
      throw new Error(
        `Asset "${asset}" not found in peggedData (matched against gecko_id and module)`
      );
    }
    targets = [match];
  } else {
    targets = (peggedAssets as any[]).filter(
      (p) => p.bridgeConfig?.wormholeConfig
    );
    if (targets.length === 0) {
      throw new Error(
        `No peggedData entries have bridgeConfig.wormholeConfig set. Add one first, or use --asset <gecko_id>.`
      );
    }
  }

  const allNeededChains: string[] = [];
  // Aggregate unknown chain names across all assets for the end-of-run summary.
  const allUnknownChains = new Map<string, string[]>();
  const allResults: AssetResult[] = [];

  for (const peggedAsset of targets) {
    const result = await generateForAsset(
      peggedAsset,
      localChainsSet,
      dry,
      registry
    );
    allResults.push(result);
    allNeededChains.push(...result.chains);
    for (const [cn, label] of result.unknownChains) {
      const list = allUnknownChains.get(cn) ?? [];
      list.push(label);
      allUnknownChains.set(cn, list);
    }
  }

  if (allUnknownChains.size > 0) {
    const lines: string[] = [];
    lines.push(
      `\n[wormhole] ${allUnknownChains.size} Wormhole chain name(s) have no DefiLlama mapping and were skipped.`
    );
    lines.push(
      `  To add coverage: verify the chain's llamaKey in DefiLlama-Adapters/projects/helper/chains.json,`
    );
    lines.push(
      `  then add an entry to WH_NAME_TO_LLAMA (if the name differs) or verify`
    );
    lines.push(
      `  chains.json includes the name (if the name is already canonical). Skipped chains:`
    );
    for (const [cn, labels] of [...allUnknownChains.entries()].sort()) {
      lines.push(`    ${cn}: ${labels.join(", ")}`);
    }
    process.stderr.write(lines.join("\n") + "\n");
  }

  {
    const totalEmitted = allResults.reduce((s, r) => s + r.entriesEmitted, 0);
    const totalNonEvm = allResults.reduce((s, r) => s + r.skippedNonEvm, 0);
    const totalUnkDest = allResults.reduce((s, r) => s + r.skippedUnknownDest, 0);
    const totalUnkSrc = allResults.reduce((s, r) => s + r.skippedUnknownSrc, 0);
    const totalDecOutliers = allResults.reduce((s, r) => s + r.decimalOutliers, 0);
    const totalSelfRef = allResults.reduce((s, r) => s + r.skippedSelfRef, 0);
    const totalDups = allResults.reduce((s, r) => s + r.skippedDuplicate, 0);

    const unkDestChains = new Set<string>();
    const unkSrcChains = new Set<string>();
    for (const result of allResults) {
      for (const [chainName, label] of result.unknownChains) {
        if (label.endsWith("/dest")) unkDestChains.add(chainName);
        if (label.endsWith("/src")) unkSrcChains.add(chainName);
      }
    }

    const summaryLines: string[] = [];
    summaryLines.push(`\n[wormhole] Generator summary:`);
    summaryLines.push(`  Assets processed: ${allResults.length}`);
    summaryLines.push(`  Total entries emitted: ${totalEmitted}`);
    summaryLines.push(``);
    summaryLines.push(`  Filtering counts:`);
    const destChainStr = unkDestChains.size > 0 ? `  (chains: ${[...unkDestChains].sort().join(", ")})` : "";
    const srcChainStr = unkSrcChains.size > 0 ? `  (chains: ${[...unkSrcChains].sort().join(", ")})` : "";
    summaryLines.push(`    Skipped non-EVM destination addresses: ${totalNonEvm}`);
    summaryLines.push(`    Skipped due to unknown destination chain: ${totalUnkDest}${destChainStr}`);
    summaryLines.push(`    Skipped due to unknown source chain: ${totalUnkSrc}${srcChainStr}`);
    summaryLines.push(``);
    summaryLines.push(`  Validation findings:`);
    summaryLines.push(`    Decimals divergence warnings: ${totalDecOutliers} entries flagged`);
    summaryLines.push(`    Self-reference (original == destChain): ${totalSelfRef} entries`);
    summaryLines.push(`    Duplicates in registry: ${totalDups} entries`);
    summaryLines.push(``);
    summaryLines.push(`  Per-asset results:`);
    for (const r of allResults) {
      const srcNote = r.sourceChainCount > 0
        ? ` across ${r.sourceChainCount} source chain${r.sourceChainCount === 1 ? "" : "s"}`
        : "";
      summaryLines.push(`    ${r.geckoId}: ${r.entriesEmitted} entries${srcNote}`);
    }
    process.stderr.write(summaryLines.join("\n") + "\n");
  }

  if (!dry) {
    await syncChainsAllowlist(allNeededChains);
  }
}

async function generateForAsset(
  peggedAsset: any,
  localChainsSet: Set<string>,
  dry: boolean,
  registry: WormholeRegistry
): Promise<AssetResult> {
  const { getTokensBySymbol, allChainNames, registryVersion } = registry;

  // Extract config knobs. When --asset is used before the gate is wired in
  // peggedData, wormholeConfig may be undefined; WARN and apply defaults.
  const rawConfig = peggedAsset.bridgeConfig?.wormholeConfig;
  if (rawConfig === undefined) {
    process.stderr.write(
      `[${peggedAsset.gecko_id}] WARN: bridgeConfig.wormholeConfig not declared; running with defaults\n`
    );
  }
  const cfg = rawConfig ?? {};

  const symbols: string[] = cfg.symbols?.length
    ? cfg.symbols
    : [peggedAsset.symbol];
  const normalizedSymbols = new Set(symbols.map((s: string) => s.toUpperCase()));
  const excludeChains = new Set<string>(cfg.excludeChains ?? []);
  const excludeSources = new Set<string>(cfg.excludeSources ?? []);
  const chainMap: Record<string, string> = cfg.chainMap ?? {};

  // Empty-result severity depends on whether any config knob is active beyond empty defaults.
  const defaultSymbols = [peggedAsset.symbol];
  const symbolsAreDefault =
    symbols.length === defaultSymbols.length &&
    [...symbols].sort().join(",") === [...defaultSymbols].sort().join(",");
  const hasActiveFilters =
    !symbolsAreDefault ||
    excludeChains.size > 0 ||
    excludeSources.size > 0 ||
    Object.keys(chainMap).length > 0;

  const hits: Hit[] = [];
  const unknownChains = new Map<string, string>();
  const warnedDestChains = new Set<string>();
  const warnedSrcChains = new Set<string>();
  const warnedRemapDest = new Set<string>();
  const warnedRemapSrc = new Set<string>();
  let skippedNonEvm = 0;
  let skippedUnknownDest = 0;
  let skippedUnknownSrc = 0;
  let skippedSelfRef = 0;
  let skippedDuplicate = 0;
  const seen = new Set<string>();

  for (const chainName of allChainNames) {
    for (const sym of symbols) {
      const tokens = getTokensBySymbol("Mainnet", chainName, sym);
      if (!tokens) continue;

      for (const token of tokens) {
        // must be wormhole-wrapped (has original); native mints on their home
        // chain lack this field and are not part of bridge supply accounting
        if (token.original === undefined) continue;
        // symbol must belong to the configured match list
        if (!normalizedSymbols.has(token.symbol.toUpperCase())) continue;

        // source and destination must differ — a token wrapping itself is a
        // data anomaly, not a real bridge entry
        if (token.original.toLowerCase() === token.chain.toLowerCase()) {
          process.stderr.write(
            `[${peggedAsset.gecko_id}] WARN: self-reference on ${token.chain} (original == chain); skipping\n`
          );
          skippedSelfRef++;
          continue;
        }

        // non-EVM destination addresses are out of scope; skip without per-token WARN;
        // the global summary reports the total
        if (!EVM_ADDRESS_RE.test(token.address)) {
          skippedNonEvm++;
          continue;
        }

        // decimals must be a finite numeric value in a plausible range
        if (typeof token.decimals !== "number" || token.decimals < 0 || token.decimals > 77) {
          process.stderr.write(
            `[${peggedAsset.gecko_id}] WARN: ${token.chain} token ${token.address} has invalid decimals (${token.decimals}); skipping\n`
          );
          continue;
        }

        // destination chain must resolve to a DefiLlama llamaKey
        let destLlamaKey = toWormholeChainLlamaKey(token.chain, localChainsSet);
        if (!destLlamaKey) {
          skippedUnknownDest++;
          unknownChains.set(token.chain.toLowerCase(), `${peggedAsset.gecko_id}/dest`);
          if (!warnedDestChains.has(token.chain.toLowerCase())) {
            process.stderr.write(
              `[${peggedAsset.gecko_id}] WARN: destination chain "${token.chain}" has no DefiLlama mapping; skipping all tokens on this chain\n`
            );
            warnedDestChains.add(token.chain.toLowerCase());
          }
          continue;
        }

        // source chain must resolve to a DefiLlama llamaKey
        let srcLlamaKey = toWormholeChainLlamaKey(token.original, localChainsSet);
        if (!srcLlamaKey) {
          skippedUnknownSrc++;
          unknownChains.set(token.original.toLowerCase(), `${peggedAsset.gecko_id}/src`);
          if (!warnedSrcChains.has(token.original.toLowerCase())) {
            process.stderr.write(
              `[${peggedAsset.gecko_id}] WARN: source chain "${token.original}" has no DefiLlama mapping; skipping\n`
            );
            warnedSrcChains.add(token.original.toLowerCase());
          }
          continue;
        }

        // Apply chainMap bilaterally. Keys are post-resolution llamaKeys — for most
        // WH chains the llamaKey equals the lowercase WH name; the only exception
        // currently is "avalanche"→"avax", so a user remapping avalanche writes
        // chainMap: { avax: "..." }, not { avalanche: "..." }. If the user maps
        // to a chain not in chains.json, accept the override and WARN once.
        if (chainMap[destLlamaKey]) {
          destLlamaKey = chainMap[destLlamaKey];
          if (!localChainsSet.has(destLlamaKey) && !warnedRemapDest.has(destLlamaKey)) {
            process.stderr.write(
              `[${peggedAsset.gecko_id}] WARN: chainMap remapped destination to "${destLlamaKey}" which is not in chains.json; user override accepted\n`
            );
            warnedRemapDest.add(destLlamaKey);
          }
        }
        if (chainMap[srcLlamaKey]) {
          srcLlamaKey = chainMap[srcLlamaKey];
          if (!localChainsSet.has(srcLlamaKey) && !warnedRemapSrc.has(srcLlamaKey)) {
            process.stderr.write(
              `[${peggedAsset.gecko_id}] WARN: chainMap remapped source to "${srcLlamaKey}" which is not in chains.json; user override accepted\n`
            );
            warnedRemapSrc.add(srcLlamaKey);
          }
        }

        // destination excluded by user config
        if (excludeChains.has(destLlamaKey)) continue;
        // source excluded by user config
        if (excludeSources.has(srcLlamaKey)) continue;

        // deduplicate by (dest, source, address) — same address can appear
        // across multiple chain queries; framework handles multi-source dedup at
        // apply time so we don't pre-dedup across sources here
        const seenKey = `${destLlamaKey}:${srcLlamaKey}:${token.address.toLowerCase()}`;
        if (seen.has(seenKey)) {
          process.stderr.write(
            `[${peggedAsset.gecko_id}] WARN: duplicate (${token.address} dest=${destLlamaKey} src=${srcLlamaKey}); skipping\n`
          );
          skippedDuplicate++;
          continue;
        }
        seen.add(seenKey);

        hits.push({ destLlamaKey, srcLlamaKey, address: token.address, decimals: token.decimals, symbol: token.symbol });
      }
    }
  }

  // Two-pass decimal outlier detection. Compute modal decimals across all
  // surviving hits first, then flag divergents. Entries are retained — registry
  // truth is preserved (e.g. USDC on BSC is genuinely 18 decimals).
  const decimalsFreq: Record<number, number> = {};
  for (const h of hits) {
    decimalsFreq[h.decimals] = (decimalsFreq[h.decimals] ?? 0) + 1;
  }
  const modalDecimals = Object.entries(decimalsFreq).sort((a, b) => b[1] - a[1])[0]?.[0];
  const outliers = modalDecimals
    ? hits.filter((h) => String(h.decimals) !== modalDecimals)
    : [];
  const decimalOutliers = outliers.length;

  if (outliers.length > 0) {
    const outLines = [
      `[${peggedAsset.gecko_id}] WARN: decimals diverge from modal=${modalDecimals} (registry truth preserved; verify on-chain):`,
    ];
    for (const h of outliers) {
      outLines.push(`  dest=${h.destLlamaKey} src=${h.srcLlamaKey}  ${h.address}  decimals=${h.decimals}`);
    }
    process.stderr.write(outLines.join("\n") + "\n");
  }

  // Group by source chain, sort inner tokens by chain, sort outer by sourceChain
  const bySource = new Map<string, Array<{ chain: string; address: string; decimals: number; symbol: string }>>();
  for (const h of hits) {
    const arr = bySource.get(h.srcLlamaKey) ?? [];
    arr.push({ chain: h.destLlamaKey, address: h.address, decimals: h.decimals, symbol: h.symbol });
    bySource.set(h.srcLlamaKey, arr);
  }
  for (const tokens of bySource.values()) {
    tokens.sort((a, b) => a.chain.localeCompare(b.chain));
  }
  const sortedSources = [...bySource.entries()].sort(([a], [b]) => a.localeCompare(b));

  // empty result — severity depends on whether user configured any filters
  if (sortedSources.length === 0) {
    const severity = hasActiveFilters ? "WARN" : "INFO";
    const reason = hasActiveFilters
      ? "active filters may have excluded all tokens — verify excludeChains/excludeSources/chainMap/symbols config"
      : "no wormhole-wrapped entries found in registry for this asset (expected for forward-compat wiring)";
    process.stderr.write(`[${peggedAsset.gecko_id}] ${severity}: zero entries emitted — ${reason}\n`);
  }

  const detectedSources = sortedSources.map(([src]) => src).join(", ") || "(none)";
  const entriesEmitted = hits.length;
  const sourceChainCount = sortedSources.length;

  // Build output file
  const fileLines: string[] = [];
  fileLines.push(`// Auto-generated by src/adapters/peggedAssets/helper/scripts/generateWormholeConfig.ts`);
  fileLines.push(`// Asset: ${peggedAsset.name} (${peggedAsset.gecko_id})`);
  fileLines.push(`// Sources detected: ${detectedSources}`);
  fileLines.push(`// Registry: @wormhole-foundation/sdk-base@${registryVersion}`);
  fileLines.push(`// Re-run: ts-node src/adapters/peggedAssets/helper/scripts/generateWormholeConfig.ts --asset ${peggedAsset.gecko_id}`);
  fileLines.push(``);
  fileLines.push(`import type { WormholeConfig } from "../helper/bridgeConfig";`);
  fileLines.push(``);
  fileLines.push(`const wormholeConfig: WormholeConfig = [`);
  for (const [sourceChain, tokens] of sortedSources) {
    fileLines.push(`  {`);
    fileLines.push(`    sourceChain: "${sourceChain}",`);
    fileLines.push(`    tokens: [`);
    for (const t of tokens) {
      fileLines.push(`      { chain: "${t.chain}", address: "${t.address}", decimals: ${t.decimals} }, // ${t.symbol}`);
    }
    fileLines.push(`    ],`);
    fileLines.push(`  },`);
  }
  fileLines.push(`];`);
  fileLines.push(``);
  fileLines.push(`export default wormholeConfig;`);
  fileLines.push(``);

  const content = fileLines.join("\n");

  const adapterKey = peggedAsset.module ?? peggedAsset.gecko_id;
  const outPath = path.resolve(
    __dirname,
    "..",
    "..",
    adapterKey,
    "wormholeConfig.ts"
  );

  if (dry) {
    process.stdout.write(`\n===== ${peggedAsset.gecko_id} =====\n`);
    process.stdout.write(content);
  } else {
    fs.writeFileSync(outPath, content);
    console.log(
      `[${peggedAsset.gecko_id}] wrote ${path.relative(process.cwd(), outPath)} (${entriesEmitted} tokens across ${sourceChainCount} source${sourceChainCount === 1 ? "" : "s"})`
    );
  }

  // Per-asset stderr diagnostic
  const diagLines: string[] = [];
  diagLines.push(`# ${peggedAsset.name} (${peggedAsset.gecko_id})`);
  diagLines.push(
    `  emitted: ${entriesEmitted}   sources: ${sourceChainCount}   skipped_non_evm: ${skippedNonEvm}   skipped_unknown_dest: ${skippedUnknownDest}   skipped_unknown_src: ${skippedUnknownSrc}   self_ref: ${skippedSelfRef}   duplicates: ${skippedDuplicate}   decimal_outliers: ${decimalOutliers}`
  );
  process.stderr.write(diagLines.join("\n") + "\n");

  return {
    geckoId: peggedAsset.gecko_id,
    chains: hits.map((h) => h.destLlamaKey),
    unknownChains,
    entriesEmitted,
    sourceChainCount,
    skippedNonEvm,
    skippedUnknownDest,
    skippedUnknownSrc,
    skippedSelfRef,
    skippedDuplicate,
    decimalOutliers,
  };
}

// Verbatim from generateHyperlaneConfig.ts at upstream commit 91818643. The
// chains.json allowlist sync is bridge-agnostic; future refactor candidate to
// extract to a shared helper across the generateLzConfig, generateHyperlaneConfig
// and generateWormholeConfig scripts.
async function syncChainsAllowlist(neededChains: string[]) {
  const local: string[] = JSON.parse(fs.readFileSync(LOCAL_CHAINS_PATH, "utf8"));
  const localSet = new Set(local);
  const missing = [...new Set(neededChains)].filter((c) => !localSet.has(c));
  if (missing.length === 0) return;

  let remote: string[] = [];
  try {
    const { data } = await axios.get(DEFILLAMA_ADAPTERS_CHAINS_URL, {
      timeout: 30_000,
    });
    remote = Array.isArray(data) ? data : [];
  } catch {
    console.warn(
      `[chains.json sync] Could not fetch DefiLlama-Adapters chains.json; adding all missing chains without remote cross-check: ${missing.join(", ")}`
    );
  }

  const remoteSet = new Set(remote);
  const knownInRemote = missing.filter((c) => remoteSet.has(c));
  const notInRemote = missing.filter((c) => !remoteSet.has(c));

  const merged = [...new Set([...local, ...missing])].sort((a, b) =>
    a.localeCompare(b)
  );
  fs.writeFileSync(LOCAL_CHAINS_PATH, JSON.stringify(merged, null, 2) + "\n");

  console.log(
    `[chains.json sync] Added ${missing.length} chain(s) to helper/chains.json:`
  );
  if (knownInRemote.length)
    console.log(`  in DefiLlama-Adapters list: ${knownInRemote.join(", ")}`);
  if (notInRemote.length)
    console.log(
      `  NOT in DefiLlama-Adapters list (review manually): ${notInRemote.join(", ")}`
    );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
