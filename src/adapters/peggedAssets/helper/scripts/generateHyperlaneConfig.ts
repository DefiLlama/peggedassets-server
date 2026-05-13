/*
 * Generate Hyperlane Warp Route bridge configs for pegged asset adapters.
 *
 * With no args, iterates over every peggedData entry that declares
 * `bridgeConfig.hyperlaneConfig` and writes a fresh hyperlaneConfig.ts under each
 * adapter directory. Pass `--asset <gecko_id>` to run for just one.
 *
 * Matching: tokens are matched by `coinGeckoId === peggedAsset.gecko_id` (precise)
 * OR by symbol membership in the symbols list (fallback). OR-logic is deliberate:
 * synthetic entries often lack coinGeckoId and need symbol matching; collateral
 * entries often have coinGeckoId but the symbol-only match catches edge cases.
 *
 * Source chain detection: votes on collateral-side token chainNames across all warp
 * routes matching the asset. Most-voted llamaKey wins; explicit alphabetical tiebreaker
 * avoids iteration-order dependence. Non-EVM chains contribute to the vote (same as LZ).
 *
 * Filter: only EvmHypSynthetic* tokens (destination-side) are emitted. Collateral
 * entries are used only for source chain voting. Non-EVM standards are logged and skipped.
 *
 * Design note: Hyperlane Warp Routes have a mesh topology where a single route
 * can have multiple collateral chains contributing to a single synthetic
 * destination. Unlike LayerZero's hub-and-spoke (one canonical source per
 * asset), Hyperlane routes can lock collateral on N chains simultaneously.
 *
 * This generator deliberately collapses mesh to a single source per asset via
 * collateral-side voting. Mathematical attribution between sources has
 * approximately ~0.1% error in mesh-heavy routes; total mcap accuracy is
 * preserved. A future extension could introduce multi-source attribution with
 * runtime collateral balance reads if per-chain precision becomes important.
 *
 * Usage:
 *   ts-node src/adapters/peggedAssets/helper/scripts/generateHyperlaneConfig.ts
 *   ts-node src/adapters/peggedAssets/helper/scripts/generateHyperlaneConfig.ts --asset usd-coin
 *   ts-node src/adapters/peggedAssets/helper/scripts/generateHyperlaneConfig.ts --dry
 *
 * CLI flags:
 *   --asset <gecko_id>   Optional. Restrict to one asset. When specified, bypasses the
 *                        bridgeConfig.hyperlaneConfig gate — see inline comment in main().
 *   --dry                Optional. Print each generated file to stdout instead of writing.
 *                        Skips syncChainsAllowlist.
 */
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

// @hyperlane-xyz/registry@25.0.0 only exposes ".", "./chains/*", and "./fs" via
// its package.json `exports` field.  Direct subpath imports like
// "@hyperlane-xyz/registry/dist/warpRouteConfigs" throw ERR_PACKAGE_PATH_NOT_EXPORTED
// at runtime.  We resolve the package root via the allowed "." entry point and
// then load the sibling dist files by absolute path — robust across npm/pnpm/yarn.
const _registryPkgDir = path.dirname(
  require.resolve("@hyperlane-xyz/registry")
);
const { warpRouteConfigs }: { warpRouteConfigs: Record<string, any> } =
  require(path.join(_registryPkgDir, "warpRouteConfigs.js"));
const { chainMetadata }: { chainMetadata: Record<string, any> } =
  require(path.join(_registryPkgDir, "chainMetadata.js"));
const REGISTRY_VERSION: string = (
  require(path.join(_registryPkgDir, "..", "package.json")) as { version: string }
).version;

import peggedAssets from "../../../../peggedData/peggedData";

const DEFILLAMA_ADAPTERS_CHAINS_URL =
  "https://raw.githubusercontent.com/DefiLlama/DefiLlama-Adapters/main/projects/helper/chains.json";
const LOCAL_CHAINS_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "helper",
  "chains.json"
);

// Synthetic-side standard types: their totalSupply() represents bridged supply
// on destination chains.
//
// Anchored to @hyperlane-xyz/registry@25.0.0 (pinned exactly in package.json).
// Verified on 2026-05-13: each of the four strings below appears as the
// `standard:` field on at least one token entry in the registry's warp route
// YAMLs at this version (EvmHypSynthetic: 243, EvmHypXERC20: 63,
// EvmHypVSXERC20: 44, EvmHypSyntheticRebase: 2). To re-verify after a registry
// bump, run from repo root:
//
//   grep -rh "standard:" node_modules/@hyperlane-xyz/registry/dist/deployments/warp_routes/ \
//     | sort | uniq -c | sort -rn
//
// If a new synthetic standard appears, classify it (destination-side mint/burn
// → add here; source-side lock → keep out) by cross-checking the TokenType enum
// in typescript/sdk/src/token/config.ts in github.com/hyperlane-xyz/hyperlane-monorepo.
//
// EvmHypSyntheticRebase: totalSupply() on rebase contracts reflects the rebased
// amount (not pre-rebase shares), so it is safe to treat identically to
// EvmHypSynthetic for circulating supply purposes.
const SYNTHETIC_TYPES = new Set([
  "EvmHypSynthetic",
  "EvmHypSyntheticRebase",
  "EvmHypXERC20",
  "EvmHypVSXERC20",
]);

// Non-EVM protocol prefixes: the corresponding standard types are recognized
// but not trackable by the EVM-based bridgedSupply helper. They are logged and
// skipped. Starknet, Sealevel (Solana/Eclipse), Aleo, Radix, Tron, CosmWasm
// (Cw), and CosmosNative are out of scope for this initial implementation.
const NON_EVM_PREFIXES = [
  "Sealevel",
  "Aleo",
  "Radix",
  "Starknet",
  "Cw",
  "Tron",
  "CosmosNative",
];

// Maps Hyperlane chainName → DefiLlama llamaKey when they differ.
// Identity (chainName === llamaKey) does not need an entry here.
//
// Derived empirically from @hyperlane-xyz/registry@25.0.0 warp route YAMLs for
// USDC, USDT, DAI, and EURC. To update: enumerate chainNames appearing in the
// warp_routes YAML files, cross-reference against
// src/adapters/peggedAssets/helper/chains.json, and add missing translations.
const HYPERLANE_NAME_TO_LLAMA: Record<string, string> = {
  avalanche: "avax",       // Avalanche C-Chain
  solanamainnet: "solana", // Hyperlane appends "mainnet" to distinguish from testnets
  plume: "plume_mainnet",  // Plume Network
  swell: "swellchain",     // Swell L2 (Hyperlane: "swell", DefiLlama: "swellchain")
  worldchain: "wc",        // World Chain
  viction: "tomochain",    // Viction (formerly TomoChain; DefiLlama retains "tomochain")
  pulsechain: "pulse",     // PulseChain
  hyperevm: "hyperliquid", // HyperEVM — the EVM execution layer of Hyperliquid
};

// Collateral-side standards vote for source-chain detection.
//
// Verified against the 29 standards present in @hyperlane-xyz/registry on 2026-05-13:
//
//   VOTE (Collateral pattern):
//     Evm/Sealevel/Cosmos/Cw/Starknet/Tron/Radix HypCollateral,
//     EvmHypCollateralFiat, EvmHypOwnerCollateral, EvmHypRebaseCollateral
//   VOTE (Lockbox pattern):
//     EvmHypXERC20Lockbox, EvmHypVSXERC20Lockbox
//   VOTE (Native pattern):
//     Evm/Sealevel/Aleo/Cw HypNative, EvmNative
//   NO VOTE (in SYNTHETIC_TYPES):
//     EvmHypSynthetic, EvmHypSyntheticRebase, EvmHypXERC20, EvmHypVSXERC20
//   NO VOTE (non-EVM synthetic, also not emitted):
//     Sealevel/Aleo/Starknet/Radix/CosmosNative HypSynthetic
//   NO VOTE (special bridges):
//     EvmM0Portal, EvmM0PortalLite, CosmosIbc
//
// When a new standard appears (logged in the unknown-skip summary at generator
// runtime), re-run this verification before adjusting.
function isCollateralStandard(standard: string): boolean {
  if (SYNTHETIC_TYPES.has(standard)) return false;
  return /(Collateral|Lockbox|Native)/.test(standard);
}

// Resolve a Hyperlane chainName to the canonical DefiLlama llamaKey.
// Returns undefined for chains that have no DefiLlama mapping (log + skip).
function toHyperlaneChainLlamaKey(
  chainName: string,
  localChainsSet: Set<string>
): string | undefined {
  if (HYPERLANE_NAME_TO_LLAMA[chainName]) return HYPERLANE_NAME_TO_LLAMA[chainName];
  if (localChainsSet.has(chainName)) return chainName;
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

type Hit = {
  llamaKey: string;
  address: string;
  decimals: number;
  standard: string;
  symbol: string;
};

async function main() {
  const { asset, dry } = parseArgs(process.argv.slice(2));
  const localChains: string[] = JSON.parse(
    fs.readFileSync(LOCAL_CHAINS_PATH, "utf8")
  );
  const localChainsSet = new Set(localChains);

  let targets: any[];

  if (asset) {
    // --asset bypasses the bridgeConfig.hyperlaneConfig gate intentionally.
    // This allows the generator to be run and tested on any asset before the
    // per-asset gate is wired up in peggedData (Phase 4), keeping Phase 2
    // (generator) and Phase 4 (gate wiring) independently deployable.
    // The LZ generator throws if the gate is absent; here we relax that to
    // support the two-phase rollout.
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
      (p) => p.bridgeConfig?.hyperlaneConfig
    );
    if (targets.length === 0) {
      throw new Error(
        `No peggedData entries have bridgeConfig.hyperlaneConfig set. Add one first, or use --asset <gecko_id>.`
      );
    }
  }

  const allNeededChains: string[] = [];
  // Aggregate unknown chain names across all assets for the end-of-run summary.
  const allUnknownChains = new Map<string, string[]>();

  for (const peggedAsset of targets) {
    const { chains, unknownChains } = await generateForAsset(
      peggedAsset,
      localChainsSet,
      dry
    );
    allNeededChains.push(...chains);
    for (const [cn, label] of unknownChains) {
      const list = allUnknownChains.get(cn) ?? [];
      list.push(label);
      allUnknownChains.set(cn, list);
    }
  }

  if (allUnknownChains.size > 0) {
    const lines: string[] = [];
    lines.push(
      `\n[hyperlane] ${allUnknownChains.size} Hyperlane chainName(s) have no DefiLlama mapping and were skipped.`
    );
    lines.push(
      `  To add coverage: verify the chain's llamaKey in DefiLlama-Adapters/projects/helper/chains.json,`
    );
    lines.push(
      `  then add an entry to HYPERLANE_NAME_TO_LLAMA (if the name differs) or verify`
    );
    lines.push(
      `  chains.json includes the name (if the name is already canonical). Skipped chains:`
    );
    for (const [cn, labels] of [...allUnknownChains.entries()].sort()) {
      lines.push(`    ${cn}: ${labels.join(", ")}`);
    }
    process.stderr.write(lines.join("\n") + "\n");
  }

  if (!dry) {
    await syncChainsAllowlist(allNeededChains);
  }
}

async function generateForAsset(
  peggedAsset: any,
  localChainsSet: Set<string>,
  dry: boolean
): Promise<{ chains: string[]; unknownChains: Map<string, string> }> {
  const hyperlaneConfig = peggedAsset.bridgeConfig?.hyperlaneConfig ?? {};
  const symbols: string[] = hyperlaneConfig.symbols?.length
    ? hyperlaneConfig.symbols
    : [peggedAsset.symbol];
  const normalizedSymbols = new Set(symbols.map((s: string) => s.toUpperCase()));
  const excludeChains = new Set<string>(hyperlaneConfig.excludeChains ?? []);
  const chainMap: Record<string, string> = hyperlaneConfig.chainMap ?? {};
  const explicitStandardTypes: Set<string> | undefined =
    hyperlaneConfig.standardTypes?.length
      ? new Set<string>(hyperlaneConfig.standardTypes)
      : undefined;

  function matchesAsset(token: any): boolean {
    if (token.coinGeckoId === peggedAsset.gecko_id) return true;
    const sym = (token.symbol ?? "").toUpperCase();
    return normalizedSymbols.size > 0 && normalizedSymbols.has(sym);
  }

  function isTestnet(chainName: string): boolean {
    const meta = chainMetadata[chainName];
    if (meta?.isTestnet === true) return true;
    return /sepolia|testnet/i.test(chainName);
  }

  // Step 1: Vote on source chain via collateral-side entries.
  // Non-EVM chains contribute to the vote (same as LZ generator): voting should
  // reflect where collateral physically lives, independent of which chains we
  // can track as output.
  const collateralVotes: Record<string, number> = {};
  for (const [, config] of Object.entries(warpRouteConfigs)) {
    const tokens: any[] = config.tokens ?? [];
    if (!tokens.some(matchesAsset)) continue;
    for (const token of tokens) {
      if (!matchesAsset(token)) continue;
      if (isTestnet(token.chainName ?? "")) continue;
      if (!isCollateralStandard(token.standard ?? "")) continue;
      const llamaKey = toHyperlaneChainLlamaKey(token.chainName, localChainsSet);
      if (!llamaKey) continue;
      collateralVotes[llamaKey] = (collateralVotes[llamaKey] ?? 0) + 1;
    }
  }

  // Explicit alphabetical tiebreaker: avoids dependence on Object.entries iteration
  // order, which has caused subtle issues in similar voting algorithms.
  let source: string | undefined;
  let bestCount = 0;
  for (const [key, n] of Object.entries(collateralVotes)) {
    if (n > bestCount || (n === bestCount && (source === undefined || key < source))) {
      source = key;
      bestCount = n;
    }
  }

  if (!source) {
    process.stderr.write(
      `[${peggedAsset.gecko_id}] Could not detect source chain: no collateral-side entries found matching this asset. Ensure gecko_id or symbols match at least one warp route token. Skipping.\n`
    );
    return { chains: [], unknownChains: new Map() };
  }

  // Step 2: Collect synthetic-side entries for the output config.
  const hits: Hit[] = [];
  const skippedNoLlama: string[] = [];
  const skippedNonEvm: Array<{ chainName: string; std: string }> = [];
  const skippedWrongType: Array<{ chainName: string; std: string }> = [];
  // chainName → "gecko_id/standard" label for the end-of-run summary
  const unknownChains = new Map<string, string>();

  for (const [, config] of Object.entries(warpRouteConfigs)) {
    const tokens: any[] = config.tokens ?? [];
    if (!tokens.some(matchesAsset)) continue;
    for (const token of tokens) {
      if (!matchesAsset(token)) continue;
      if (isTestnet(token.chainName ?? "")) continue;

      const std: string = token.standard ?? "";

      // Collateral-side entries are excluded from output. They are used only for
      // voting in step 1. Silent skip here: these are expected and not worth
      // logging (EvmHypCollateral, TronHypCollateral, etc. are all collateral-side).
      if (isCollateralStandard(std)) continue;

      // Non-EVM synthetics are logged: they represent real bridged supply that
      // could be tracked in a future extension, so flagging them helps maintainers
      // know which coverage is missing.
      if (NON_EVM_PREFIXES.some((p) => std.startsWith(p))) {
        skippedNonEvm.push({ chainName: token.chainName, std });
        continue;
      }

      const includeType = explicitStandardTypes
        ? explicitStandardTypes.has(std)
        : SYNTHETIC_TYPES.has(std);

      if (!includeType) {
        skippedWrongType.push({ chainName: token.chainName, std });
        continue;
      }

      let llamaKey = toHyperlaneChainLlamaKey(token.chainName, localChainsSet);
      if (!llamaKey) {
        skippedNoLlama.push(token.chainName);
        unknownChains.set(
          token.chainName,
          `${peggedAsset.gecko_id}/${std}`
        );
        continue;
      }

      if (chainMap[llamaKey]) llamaKey = chainMap[llamaKey];
      if (llamaKey === source) continue;
      if (excludeChains.has(llamaKey)) continue;

      if (typeof token.decimals !== "number") {
        process.stderr.write(
          `[${peggedAsset.gecko_id}] token on ${token.chainName} (${token.addressOrDenom}) is missing decimals; skipping\n`
        );
        continue;
      }

      hits.push({
        llamaKey,
        address: token.addressOrDenom,
        decimals: token.decimals,
        standard: std,
        symbol: token.symbol ?? "",
      });
    }
  }

  // Deduplicate by chain+address: the same token can appear in multiple overlapping
  // warp routes (e.g. a multi-chain route and a bilateral route both list the same
  // synthetic). Summing duplicates would double-count supply.
  const seen = new Set<string>();
  const dedupedHits: Hit[] = [];
  for (const h of hits) {
    const key = `${h.llamaKey}:${h.address.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      dedupedHits.push(h);
    }
  }
  dedupedHits.sort(
    (a, b) =>
      a.llamaKey.localeCompare(b.llamaKey) || a.address.localeCompare(b.address)
  );

  // Build output file
  const lines: string[] = [];
  lines.push(
    `// Auto-generated by src/adapters/peggedAssets/helper/scripts/generateHyperlaneConfig.ts`
  );
  lines.push(
    `// Asset: ${peggedAsset.name} (${peggedAsset.gecko_id})   Source (auto-detected): ${source}`
  );
  lines.push(
    `// Re-run: ts-node src/adapters/peggedAssets/helper/scripts/generateHyperlaneConfig.ts --asset ${peggedAsset.gecko_id}`
  );
  lines.push(`// Registry: @hyperlane-xyz/registry@${REGISTRY_VERSION}`);
  lines.push(``);
  lines.push(`import type { HyperlaneConfig } from "../helper/bridgeConfig";`);
  lines.push(``);
  lines.push(`const hyperlaneConfig: HyperlaneConfig = {`);
  lines.push(`  sourceChain: "${source}",`);
  lines.push(`  tokens: [`);
  for (const h of dedupedHits) {
    lines.push(
      `    { chain: "${h.llamaKey}", address: "${h.address}", decimals: ${h.decimals} }, // ${h.standard} ${h.symbol}`
    );
  }
  lines.push(`  ],`);
  lines.push(`};`);
  lines.push(``);
  lines.push(`export default hyperlaneConfig;`);
  lines.push(``);

  const content = lines.join("\n");

  const adapterKey = peggedAsset.module ?? peggedAsset.gecko_id;
  const outPath = path.resolve(
    __dirname,
    "..",
    "..",
    adapterKey,
    "hyperlaneConfig.ts"
  );

  if (dry) {
    process.stdout.write(`\n===== ${peggedAsset.gecko_id} =====\n`);
    process.stdout.write(content);
  } else {
    fs.writeFileSync(outPath, content);
    console.log(
      `[${peggedAsset.gecko_id}] wrote ${path.relative(process.cwd(), outPath)} (${dedupedHits.length} tokens, source=${source})`
    );
  }

  // Diagnostics to stderr
  const hitsByChain = new Map<string, Hit[]>();
  for (const h of dedupedHits) {
    const list = hitsByChain.get(h.llamaKey) ?? [];
    list.push(h);
    hitsByChain.set(h.llamaKey, list);
  }
  const duplicateChains = [...hitsByChain.entries()].filter(
    ([, hs]) => hs.length > 1
  );

  const errLines: string[] = [];
  errLines.push(
    `# ${peggedAsset.name} (${peggedAsset.gecko_id}) — source=${source}`
  );
  errLines.push(
    `  matched: ${dedupedHits.length}   skipped_no_llama: ${skippedNoLlama.length}   skipped_non_evm: ${skippedNonEvm.length}   skipped_wrong_type: ${skippedWrongType.length}   chains_with_duplicates: ${duplicateChains.length}`
  );

  if (skippedNonEvm.length) {
    errLines.push(
      `  ## non-EVM tokens (out of scope; trackable in a future extension):`
    );
    const byType = skippedNonEvm.reduce(
      (acc: Record<string, Set<string>>, s) => {
        (acc[s.std] = acc[s.std] ?? new Set()).add(s.chainName);
        return acc;
      },
      {}
    );
    for (const [std, cns] of Object.entries(byType))
      errLines.push(`    ${std}: ${[...cns].join(", ")}`);
  }

  if (skippedWrongType.length) {
    errLines.push(
      `  ## unrecognized non-collateral types (review if new standard added to Hyperlane SDK):`
    );
    const byType = skippedWrongType.reduce(
      (acc: Record<string, Set<string>>, s) => {
        (acc[s.std] = acc[s.std] ?? new Set()).add(s.chainName);
        return acc;
      },
      {}
    );
    for (const [std, cns] of Object.entries(byType))
      errLines.push(`    ${std}: ${[...cns].join(", ")}`);
  }

  if (duplicateChains.length) {
    errLines.push(
      `  ## chains with multiple synthetic deployments (summed by runtime):`
    );
    for (const [chain, hs] of duplicateChains) {
      errLines.push(`    ${chain}:`);
      for (const h of hs)
        errLines.push(
          `      ${h.address}  decimals=${h.decimals}  ${h.standard} ${h.symbol}`
        );
    }
  }

  process.stderr.write(errLines.join("\n") + "\n");

  return {
    chains: dedupedHits.map((h) => h.llamaKey),
    unknownChains,
  };
}

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
