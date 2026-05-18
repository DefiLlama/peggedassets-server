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

  for (const peggedAsset of targets) {
    const { chains, unknownChains } = await generateForAsset(
      peggedAsset,
      localChainsSet,
      dry,
      registry
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

  if (!dry) {
    await syncChainsAllowlist(allNeededChains);
  }
}

// TODO: implement the per-asset processing — match wormhole-wrapped tokens
// (those carrying an `original` field) by symbol, group by source chain,
// apply chain mapping and user filters (excludeChains, excludeSources,
// chainMap), validate addresses and decimals, sort deterministically, and
// emit the WormholeConfig file (or print to stdout when --dry). Also emit
// per-asset diagnostics to stderr.
//
// Returns the list of llamaKeys referenced in the generated output (for
// syncChainsAllowlist) and the map of unknown WH chain names encountered
// (for the end-of-run summary).
//
// Parameters use the leading-underscore convention to suppress
// noUnusedParameters; drop the prefix when wired in.
async function generateForAsset(
  _peggedAsset: any,
  _localChainsSet: Set<string>,
  _dry: boolean,
  _registry: WormholeRegistry
): Promise<{ chains: string[]; unknownChains: Map<string, string> }> {
  return { chains: [], unknownChains: new Map() };
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
