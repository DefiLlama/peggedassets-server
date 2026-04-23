/*
 * Generate LayerZero bridge configs for pegged asset adapters.
 *
 * With no args, iterates over every peggedData entry that declares
 * `bridgeConfig.lzConfig` and writes a fresh layerzeroConfig.ts under each
 * adapter directory. Pass `--asset <gecko_id>` to run for just one.
 *
 * Matching: tokens are matched primarily by `peggedTo.address === peggedAsset.address`
 * (precise); falls back to the `symbols` list when `peggedTo.address` is absent.
 *
 * Auto-detects the source chain from LZ metadata (most common peggedTo.chainName
 * across matching tokens) and writes it into the generated file. Default filter:
 * include LZ OFT wrappers (HydraOFT, NativeOFT, OFT) as destination-chain supply,
 * plus ERC20s that have a LZ adapter (proxyAddresses) AND peggedTo pointing to
 * the source chain at a different address. Lock-side types (ProxyOFT,
 * WABProxyOFT, OFTAdapter) are always excluded.
 *
 * Advanced overrides on lzConfig (in peggedData):
 *   oftTypes: ["..."]             explicit allow-list of LZ types; bypasses auto-inference
 *   requirePeggedToSource: true   require peggedTo.chainName === source even for explicit types
 *   excludeChains: ["..."]        llama chain keys to skip in output
 *   chainMap: { frax: "fraxtal" } rename emitted chain keys
 *
 * Usage:
 *   ts-node src/adapters/peggedAssets/helper/scripts/generateLzConfig.ts
 *   ts-node src/adapters/peggedAssets/helper/scripts/generateLzConfig.ts --asset usd-coin
 *   ts-node src/adapters/peggedAssets/helper/scripts/generateLzConfig.ts --dry
 *
 * CLI flags:
 *   --asset <gecko_id>   Optional. Restrict to one asset. Default: run for all assets with lzConfig.
 *   --dry                Optional. Print each generated file to stdout instead of writing.
 */
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
const providers = require("@defillama/sdk/build/providers.json");
import peggedAssets from "../../../../peggedData/peggedData";

const LZ_METADATA_URL = "https://metadata.layerzero-api.com/v1/metadata";
const DEFILLAMA_ADAPTERS_CHAINS_URL =
  "https://raw.githubusercontent.com/DefiLlama/DefiLlama-Adapters/main/projects/helper/chains.json";
const LOCAL_CHAINS_PATH = path.resolve(__dirname, "..", "..", "helper", "chains.json");

// providers.json maps multiple keys to the same chainId; prefer the canonical DefiLlama key.
const CANONICAL_CHAIN_ALIASES: Record<string, string> = {
  frax: "fraxtal",
};

// LZ metadata uses its own chain naming (chainName and peggedTo.chainName fields).
// Map those to the canonical DefiLlama chain key where they differ.
const LZ_NAME_TO_LLAMA: Record<string, string> = {
  avalanche: "avax",
  binance: "bsc",
  coredao: "core",
  ape: "apechain",
  islander: "vana",
  rootstock: "rsk",
  fraxtal: "fraxtal",
  zksync: "era",
  rarible: "rari",
  plumephoenix: "plume_mainnet",
  story: "sty",
  superposition: "spn",
  apexfusionnexus: "ap3x",
  botanix: "btnx",
  lightlink: "lightlink_phoenix",
  redbelly: "rbn",
  xchain: "xc",
  og: "0g",
};

// Skip LZ chains whose nativeChainId collides with an unrelated EVM chain in providers.json.
// (LZ uses nativeChainId=101 for Solana, which also exists as Einsteinium/eti.)
const ALWAYS_SKIP_LLAMA_KEYS = new Set<string>(["eti"]);

// OFT wrapper types: the destination-side asset holders actually hold. Include by default.
const OFT_WRAPPER_TYPES = new Set<string>([
  "HydraOFT",
  "NativeOFT",
  "OFT",
  "OFTV2",
]);

// Lock-side adapter types: companion contracts that lock the source asset; never
// represent destination-chain supply. Always excluded — including them double-counts.
const LOCK_SIDE_TYPES = new Set<string>([
  "ProxyOFT",
  "WABProxyOFT",
  "OFTAdapter",
]);

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

// Convert an LZ chain name (e.g. `avalanche`, `story`) to the canonical DefiLlama key.
function toLlamaKey(lzName: string | undefined): string | undefined {
  if (!lzName) return undefined;
  return LZ_NAME_TO_LLAMA[lzName] ?? lzName;
}

// Validate address shape. LZ metadata occasionally contains malformed EVM
// addresses (e.g. truncated to 40 chars) and also mixes in non-EVM addresses
// (Aptos resource paths, TON raw addresses) that wouldn't work with bridgedSupply's
// EVM multicall anyway. Reject anything that's not a clean 42-char 0x address OR a
// non-0x address (solana base58, tron T-prefixed, etc).
function isInvalidBridgedAddress(address: string): string | null {
  if (!address.startsWith("0x")) return null; // non-0x: let bridgedSupply's chain-specific logic handle it
  if (address.length !== 42) return "malformed EVM address";
  if (address.includes("::")) return "non-EVM resource path";
  return null;
}

// peggedData.address may be prefixed with a chain key (e.g. "avax:0x...").
// Return just the lowercase canonical address portion, or undefined if absent.
function normalizeSourceAddress(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const stripped = raw.includes(":") ? raw.slice(raw.indexOf(":") + 1) : raw;
  return stripped.toLowerCase();
}

// Vote on source chain: most common peggedTo.chainName (mapped to Llama key)
// across mainnet tokens matching the asset. Prefers address match over symbol.
function detectSourceChain(
  metadata: Record<string, any>,
  normalizedSymbols: Set<string>,
  sourceAddress: string | undefined
): string | undefined {
  const counts: Record<string, number> = {};
  for (const info of Object.values<any>(metadata)) {
    if (info.environment !== "mainnet") continue;
    for (const token of Object.values<any>(info.tokens || {})) {
      if (!matchesAsset(token, normalizedSymbols, sourceAddress)) continue;
      const llamaKey = toLlamaKey(token?.peggedTo?.chainName);
      if (!llamaKey) continue;
      counts[llamaKey] = (counts[llamaKey] || 0) + 1;
    }
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const [key, n] of Object.entries(counts)) {
    if (n > bestCount) {
      best = key;
      bestCount = n;
    }
  }
  return best;
}

// Match a LZ token to the asset via EITHER symbol OR peggedTo.address.
// Using OR (not AND) is deliberate: some destination-chain wrappers have
// peggedTo.address pointing to a sibling address (e.g. USDe on ink/megaeth
// points to Ethereal's 0x0000 placeholder instead of mainnet USDe), but the
// symbol still cleanly identifies them.
function matchesAsset(
  token: any,
  normalizedSymbols: Set<string>,
  sourceAddress: string | undefined
): boolean {
  const symbol = (token.symbol || "").toUpperCase();
  const symbolMatches = normalizedSymbols.size > 0 && normalizedSymbols.has(symbol);
  const peggedToAddress: string | undefined = token?.peggedTo?.address;
  const addressMatches =
    !!sourceAddress &&
    !!peggedToAddress &&
    peggedToAddress.toLowerCase() === sourceAddress;
  return symbolMatches || addressMatches;
}

function buildChainIdToLlamaKey(): Record<number, string> {
  const map: Record<number, string> = {};
  for (const [key, info] of Object.entries<any>(providers)) {
    if (typeof info?.chainId === "number" && map[info.chainId] === undefined) {
      map[info.chainId] = key;
    }
  }
  return map;
}

type Hit = {
  llamaKey: string;
  lzKey: string;
  address: string;
  decimals: number;
  type: string;
  symbol: string;
};

async function main() {
  const { asset, dry } = parseArgs(process.argv.slice(2));

  // Select which pegged assets to run for.
  let targets = (peggedAssets as any[]).filter((p) => p.bridgeConfig?.lzConfig);
  if (asset) {
    const match = targets.find((p) => p.gecko_id === asset || p.module === asset);
    if (!match) {
      throw new Error(
        `Asset "${asset}" not found in peggedData with bridgeConfig.lzConfig set (matched against gecko_id/module)`
      );
    }
    targets = [match];
  }
  if (targets.length === 0) {
    throw new Error(
      `No peggedData entries have bridgeConfig.lzConfig set. Add one first.`
    );
  }

  const cidToLlama = buildChainIdToLlamaKey();
  const { data: metadata } = await axios.get(LZ_METADATA_URL, { timeout: 60_000 });

  const allNeededChains: string[] = [];
  for (const peggedAsset of targets) {
    const chains = await generateForAsset(peggedAsset, metadata, cidToLlama, dry);
    allNeededChains.push(...chains);
  }

  if (!dry) {
    await syncChainsAllowlist(allNeededChains);
  }
}

async function generateForAsset(
  peggedAsset: any,
  metadata: Record<string, any>,
  cidToLlama: Record<number, string>,
  dry: boolean
): Promise<string[]> {
  const lzConfig = peggedAsset.bridgeConfig.lzConfig;
  const symbols: string[] = lzConfig.symbols?.length
    ? lzConfig.symbols
    : [peggedAsset.symbol];
  const normalizedSymbols = new Set(symbols.map((s: string) => s.toUpperCase()));
  const sourceAddress = normalizeSourceAddress(peggedAsset.address);
  const excludeChains = new Set<string>(lzConfig.excludeChains ?? []);
  const chainMap: Record<string, string> = lzConfig.chainMap ?? {};
  const explicitOftTypes = lzConfig.oftTypes?.length
    ? new Set<string>(lzConfig.oftTypes)
    : undefined;
  const requirePeggedToSource: boolean = lzConfig.requirePeggedToSource === true;

  const source = detectSourceChain(metadata, normalizedSymbols, sourceAddress);
  if (!source) {
    console.warn(
      `[${peggedAsset.gecko_id}] Could not detect source chain; skipping. Ensure peggedAsset.address or bridgeConfig.lzConfig.symbols matches at least one LZ-listed token with peggedTo.chainName set.`
    );
    return [];
  }

  const hits: Hit[] = [];
  const skippedNoMapping: Array<{
    lzKey: string;
    chainId?: number;
    address: string;
    type: string;
    symbol: string;
  }> = [];
  const skippedWrongType: Array<{
    lzKey: string;
    llamaKey?: string;
    address: string;
    type?: string;
    symbol: string;
  }> = [];

  for (const [lzKey, info] of Object.entries<any>(metadata)) {
    if (info.environment !== "mainnet") continue;
    const cid: number | undefined = info?.chainDetails?.nativeChainId;
    const tokens = info.tokens || {};
    for (const [address, token] of Object.entries<any>(tokens)) {
      if (!matchesAsset(token, normalizedSymbols, sourceAddress)) continue;
      const invalidReason = isInvalidBridgedAddress(address);
      if (invalidReason) {
        console.warn(
          `[${peggedAsset.gecko_id}] dropping ${invalidReason} on ${lzKey}: ${address} (${token.symbol})`
        );
        continue;
      }
      const symbol = (token.symbol || "").toUpperCase();
      let llamaKey = cid !== undefined ? cidToLlama[cid] : undefined;
      if (llamaKey && CANONICAL_CHAIN_ALIASES[llamaKey]) llamaKey = CANONICAL_CHAIN_ALIASES[llamaKey];
      if (llamaKey && chainMap[llamaKey]) llamaKey = chainMap[llamaKey];
      if (!llamaKey) {
        skippedNoMapping.push({
          lzKey,
          chainId: cid,
          address,
          type: token.type,
          symbol,
        });
        continue;
      }
      if (llamaKey === source) continue;
      if (ALWAYS_SKIP_LLAMA_KEYS.has(llamaKey)) continue;
      if (excludeChains.has(llamaKey)) continue;

      const tokenType: string = token.type ?? "";
      const peggedToChain: string | undefined = toLlamaKey(token?.peggedTo?.chainName);

      if (LOCK_SIDE_TYPES.has(tokenType)) {
        skippedWrongType.push({ lzKey, llamaKey, address, type: tokenType, symbol });
        continue;
      }

      let includeToken: boolean;
      if (explicitOftTypes) {
        includeToken = explicitOftTypes.has(tokenType);
      } else if (OFT_WRAPPER_TYPES.has(tokenType)) {
        includeToken = true;
      } else if (tokenType === "ERC20") {
        const hasLzAdapter =
          Array.isArray(token?.proxyAddresses) && token.proxyAddresses.length > 0;
        const crossChainDeployment =
          peggedToChain === source &&
          typeof token?.peggedTo?.address === "string" &&
          token.peggedTo.address.toLowerCase() !== address.toLowerCase();
        includeToken = hasLzAdapter && crossChainDeployment;
      } else {
        includeToken = false;
      }
      if (!includeToken) {
        skippedWrongType.push({ lzKey, llamaKey, address, type: tokenType, symbol });
        continue;
      }

      if (requirePeggedToSource && peggedToChain !== source) continue;
      hits.push({
        llamaKey,
        lzKey,
        address,
        decimals: token.decimals ?? 6,
        type: token.type,
        symbol: token.symbol,
      });
    }
  }

  hits.sort(
    (a, b) =>
      a.llamaKey.localeCompare(b.llamaKey) || a.address.localeCompare(b.address)
  );

  const lines: string[] = [];
  lines.push(
    `// Auto-generated by src/adapters/peggedAssets/helper/scripts/generateLzConfig.ts`
  );
  lines.push(
    `// Asset: ${peggedAsset.name} (${peggedAsset.gecko_id})   Match: ${
      sourceAddress ? `address=${sourceAddress}` : `symbols=${[...normalizedSymbols].join("|")}`
    }   Source (auto-detected): ${source}   Filter: ${
      explicitOftTypes
        ? `oftTypes=${[...explicitOftTypes].join("|")}`
        : "auto (OFT wrappers + peggedTo=source)"
    }`
  );
  lines.push(
    `// Re-run: ts-node src/adapters/peggedAssets/helper/scripts/generateLzConfig.ts --asset ${peggedAsset.gecko_id}`
  );
  lines.push(``);
  lines.push(`import type { LayerZeroConfig } from "../helper/bridgeConfig";`);
  lines.push(``);
  lines.push(`const layerzeroConfig: LayerZeroConfig = {`);
  lines.push(`  sourceChain: "${source}",`);
  lines.push(`  tokens: [`);
  for (const h of hits) {
    lines.push(
      `    { chain: "${h.llamaKey}", address: "${h.address}", decimals: ${h.decimals} }, // ${h.type} ${h.symbol} (lz:${h.lzKey})`
    );
  }
  lines.push(`  ],`);
  lines.push(`};`);
  lines.push(``);
  lines.push(`export default layerzeroConfig;`);
  lines.push(``);

  const content = lines.join("\n");

  const adapterKey = peggedAsset.module ?? peggedAsset.gecko_id;
  const outPath = path.resolve(
    __dirname,
    "..",
    "..",
    adapterKey,
    "layerzeroConfig.ts"
  );

  if (dry) {
    process.stdout.write(`\n===== ${peggedAsset.gecko_id} =====\n`);
    process.stdout.write(content);
  } else {
    fs.writeFileSync(outPath, content);
    console.log(
      `[${peggedAsset.gecko_id}] wrote ${path.relative(process.cwd(), outPath)} (${hits.length} tokens, source=${source})`
    );
  }

  const errLines: string[] = [];
  errLines.push(`# ${peggedAsset.name} (${peggedAsset.gecko_id}) — source=${source}`);
  errLines.push(
    `  matched: ${hits.length}   skipped_no_llama: ${skippedNoMapping.length}   skipped_wrong_type: ${skippedWrongType.length}`
  );
  if (skippedNoMapping.length) {
    errLines.push(
      `  ## unmapped LZ chains (no chainId match in @defillama/sdk providers.json):`
    );
    for (const s of skippedNoMapping)
      errLines.push(
        `    lz:${s.lzKey}  chainId=${s.chainId ?? "?"}  type=${s.type ?? "?"}  ${s.address}  ${s.symbol}`
      );
  }
  process.stderr.write(errLines.join("\n") + "\n");

  return hits.map((h) => h.llamaKey);
}

async function syncChainsAllowlist(neededChains: string[]) {
  const local: string[] = JSON.parse(fs.readFileSync(LOCAL_CHAINS_PATH, "utf8"));
  const localSet = new Set(local);
  const missing = [...new Set(neededChains)].filter((c) => !localSet.has(c));
  if (missing.length === 0) return;

  let remote: string[] = [];
  try {
    const { data } = await axios.get(DEFILLAMA_ADAPTERS_CHAINS_URL, { timeout: 30_000 });
    remote = Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn(
      `[chains.json sync] Could not fetch DefiLlama-Adapters chains.json; adding all missing chains without remote cross-check: ${missing.join(", ")}`
    );
  }

  const remoteSet = new Set(remote);
  const knownInRemote = missing.filter((c) => remoteSet.has(c));
  const notInRemote = missing.filter((c) => !remoteSet.has(c));

  const merged = [...new Set([...local, ...missing])].sort((a, b) => a.localeCompare(b));
  fs.writeFileSync(LOCAL_CHAINS_PATH, JSON.stringify(merged, null, 2) + "\n");

  console.log(`[chains.json sync] Added ${missing.length} chain(s) to helper/chains.json:`);
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
