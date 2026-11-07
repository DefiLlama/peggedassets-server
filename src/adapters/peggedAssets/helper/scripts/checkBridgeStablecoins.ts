/**
 * Report Bridge (Stripe) Open Issuance stablecoins that peggedData does not track yet, or
 * tracks on fewer chains than Bridge has deployed them on.
 *
 * Sources (all public, no key):
 *   - ticker list:   https://apidocs.bridge.xyz/platform/issuance/reporting-and-transparency.md
 *                    (supplemented by slugs linked from https://reserves.bridge.xyz/)
 *   - supply:        https://transparency.bridge.xyz/v0/stablecoins/<ticker>
 *   - deployments:   https://reserves.bridge.xyz/<ticker>  (explorer links -> chain + contract)
 *
 * Usage:
 *   npx ts-node --transpile-only src/adapters/peggedAssets/helper/scripts/checkBridgeStablecoins.ts [--json out.json] [--min-supply 1000]
 *
 * Exit codes:
 *   0  every discovered token is fully tracked and every check completed
 *   1  something is missing or needs a human look
 *   2  the check itself was incomplete (ticker discovery or a per-ticker fetch failed, bad CLI args)
 *
 * Matching is done on (DefiLlama chain, normalized address), using only the primary `address` and the
 * token-deployment keys of `chainConfig.chains` (issued, bridgedFrom*, cosmosIssued, cosmosBridgedFrom*).
 * Assets whose deployments live in an adapter file are only known by their primary address, so a
 * deployment tracked only in an adapter file shows up as a missing chain.
 * The report is meant to be read by whoever adds the peggedData entries; it never edits files.
 */
import * as fs from "fs";
import peggedAssets from "../../../../peggedData/peggedData";

const TICKERS_MD = "https://apidocs.bridge.xyz/platform/issuance/reporting-and-transparency.md";
const RESERVES = "https://reserves.bridge.xyz";
const TRANSPARENCY = "https://transparency.bridge.xyz/v0/stablecoins";

// explorer host -> DefiLlama chain key. Unknown hosts are reported, not guessed.
const EXPLORER_CHAINS: Record<string, string> = {
  "etherscan.io": "ethereum",
  "basescan.org": "base",
  "arbiscan.io": "arbitrum",
  "optimistic.etherscan.io": "optimism",
  "polygonscan.com": "polygon",
  "bscscan.com": "bsc",
  "lineascan.build": "linea",
  "snowtrace.io": "avax",
  "snowscan.xyz": "avax",
  "uniscan.xyz": "unichain",
  "explorer.inkonchain.com": "ink",
  "blockscout.lisk.com": "lisk",
  "monad.socialscan.io": "monad",
  "monadexplorer.com": "monad",
  "hyperevmscan.io": "hyperliquid",
  "purrsec.com": "hyperliquid",
  "explore.tempo.xyz": "tempo",
  "solscan.io": "solana",
  "explorer.solana.com": "solana",
  "suiscan.xyz": "sui",
  "suivision.xyz": "sui",
  "explorer.aptoslabs.com": "aptos",
  "aptoscan.com": "aptos",
  "stellarchain.io": "stellar",
  "stellar.expert": "stellar",
  "tronscan.org": "tron",
};

// chainConfig keys that hold addresses of the token itself (see addChainExports in helper/getSupply.ts).
// unreleased / reserves (treasury wallets), bridgeOnETH (bridge contract), bridge (a name), issuedABI are excluded.
function isDeploymentKey(key: string) {
  return key === "issued" || key === "cosmosIssued" || key.startsWith("bridgedFrom") || key.startsWith("cosmosBridgedFrom");
}

const MOVE_CHAINS = new Set(["aptos", "sui", "movement", "move"]);

// Comparable form of an address on a given chain. Hex is case-insensitive; base58 (solana, tron) is not.
export function normalizeAddress(chain: string, address: string): string {
  let a = address.trim();
  if (chain === "stellar") return a.replace(/^([^:-]+)-(G[A-Z2-7]{55})$/, "$1:$2").toLowerCase(); // CODE-ISSUER == CODE:ISSUER
  if (/^0x[0-9a-f]/i.test(a)) {
    a = a.toLowerCase();
    if (MOVE_CHAINS.has(chain)) a = a.replace(/0x0*([0-9a-f]+)/g, (_m, h) => `0x${h}`); // 0x05ab == 0x5ab
  }
  return a;
}

export const deploymentKey = (chain: string, address: string) => `${chain}|${normalizeAddress(chain, address)}`;

type Deployment = { chain: string; address: string; source: string };
type Supply = { status: "ok"; value: number } | { status: "unknown"; reason: string };
export type Token = {
  ticker: string;
  name: string;
  symbol: string;
  pegType: string;
  supply: Supply;
  deployments: Deployment[];
  unmapped: string[]; // explorer links the script could not attribute to a chain
  bareAddresses: string[]; // addresses shown on the page without an explorer link (chain unknown)
};
type Fetcher = (url: string) => Promise<string>;

const defaultFetch: Fetcher = async (url) => {
  const res = await fetch(url, { headers: { "user-agent": "defillama-peggedassets-bridge-check" } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
};

export type Discovery = { tickers: Map<string, string>; docsOk: boolean; indexOk: boolean; errors: string[] };

export async function getTickers(text: Fetcher): Promise<Discovery> {
  const tickers = new Map<string, string>(); // ticker -> pegType
  const errors: string[] = [];
  let docsOk = false;
  let indexOk = false;
  try {
    const md = await text(TICKERS_MD);
    const start = md.search(/Supported stablecoin tickers/i);
    if (start < 0) throw new Error(`"Supported stablecoin tickers" section not found in ${TICKERS_MD}`);
    const end = md.indexOf("\n## ", start);
    const section = md.slice(start, end > 0 ? end : undefined);
    let peg = "peggedUSD";
    let found = 0;
    for (const line of section.split("\n")) {
      const heading = line.match(/\*\*([A-Z]{3})-pegged\*\*/);
      if (heading) peg = `pegged${heading[1]}`;
      for (const m of line.matchAll(/`([a-z0-9_]+)`/g)) {
        tickers.set(m[1], peg);
        found++;
      }
    }
    if (!found) throw new Error(`no tickers parsed from the "Supported stablecoin tickers" section of ${TICKERS_MD}`);
    docsOk = true;
  } catch (e: any) {
    errors.push(`ticker list from docs failed: ${e.message}`);
  }
  // the reserves index links the top tokens; union in case the docs lag behind. It is not a complete list.
  try {
    const html = await text(RESERVES + "/");
    for (const m of html.matchAll(/href="\/([a-z0-9_]+)"/g)) if (!tickers.has(m[1])) tickers.set(m[1], "peggedUSD");
    indexOk = true;
  } catch (e: any) {
    errors.push(`reserves index failed: ${e.message}`);
  }
  return { tickers, docsOk, indexOk, errors };
}

export function parseSupply(raw: unknown): Supply {
  if (typeof raw === "number" || (typeof raw === "string" && raw.trim() !== "")) {
    const value = Number(raw);
    if (Number.isFinite(value) && value >= 0) return { status: "ok", value };
  }
  return { status: "unknown", reason: `invalid total_onchain_amount ${JSON.stringify(raw)}` };
}

export async function getToken(ticker: string, pegType: string, text: Fetcher): Promise<Token> {
  const token: Token = {
    ticker, name: ticker, symbol: ticker.toUpperCase(), pegType,
    supply: { status: "unknown", reason: "not fetched" }, deployments: [], unmapped: [], bareAddresses: [],
  };
  try {
    token.supply = parseSupply(JSON.parse(await text(`${TRANSPARENCY}/${ticker}`)).total_onchain_amount);
  } catch (e: any) {
    token.supply = { status: "unknown", reason: `transparency api failed: ${e.message}` };
  }
  const html = await text(`${RESERVES}/${ticker}`); // throws -> the ticker is recorded as a failed check
  const title = html.match(/<title>([^<]*?)\s*\|\s*Bridge<\/title>/);
  const nameSym = title?.[1].match(/^(.*)\s\(([^)]+)\)$/);
  if (nameSym) {
    token.name = nameSym[1].trim();
    token.symbol = nameSym[2].trim();
  }
  const links = new Set<string>();
  for (const m of html.matchAll(/https?:\/\/[^"'\s<>)\\]+\/(?:address|token|account|coin|object|contract|fungible-asset)\/[^"'\s<>)\\]+/g))
    links.add(m[0].replace(/\\$/, ""));
  const seen = new Set<string>();
  for (const link of links) {
    const host = new URL(link).host.replace(/^www\./, "");
    const chain = EXPLORER_CHAINS[host];
    let address = decodeURIComponent(link.split(/\/(?:address|token|account|coin|object|contract|fungible-asset)\//)[1] || "").replace(/\/$/, "");
    if (!chain || !address) {
      token.unmapped.push(link);
      continue;
    }
    if (chain === "sui") address = address.split("/")[0]; // suiscan appends /traders etc.
    if (chain === "stellar" && /^G[A-Z2-7]{55}$/.test(address)) address = `${token.symbol}:${address}`; // asset = CODE:ISSUER
    const key = deploymentKey(chain, address);
    if (seen.has(key)) continue; // same contract linked from two explorers
    seen.add(key);
    token.deployments.push({ chain, address, source: link });
  }
  // addresses shown without any explorer link: the chain is unknown, so they are only ever reported
  if (!token.deployments.length) {
    for (const m of html.matchAll(/0x[0-9a-fA-F]{64}/g)) if (!token.bareAddresses.includes(m[0])) token.bareAddresses.push(m[0]);
  }
  return token;
}

type Asset = { id: string; name: string; address?: string | null; chainConfig?: { chains?: Record<string, Record<string, unknown>> } };

export type AddressIndex = {
  byKey: Map<string, Set<string>>; // chain|address -> peggedData ids
  stellarByIssuer: Map<string, Set<string>>; // stellar issuer -> peggedData ids (issuer pages don't name the asset code)
};

// Primary `address` is "chain:address"; DefiLlama treats an unprefixed 0x address as ethereum.
// Anything else (no recognizable chain) is skipped rather than guessed.
function primaryDeployment(address: string): [string, string] | null {
  const m = address.match(/^([a-z0-9_]+):(.+)$/);
  if (m && !/^0x/.test(address)) return [m[1], m[2]];
  if (/^0x[0-9a-fA-F]{40}$/.test(address)) return ["ethereum", address];
  return null;
}

export function buildIndex(assets: Asset[]): AddressIndex {
  const index: AddressIndex = { byKey: new Map(), stellarByIssuer: new Map() };
  const add = (chain: string, address: string, id: string) => {
    if (!address) return;
    const key = deploymentKey(chain, address);
    if (!index.byKey.has(key)) index.byKey.set(key, new Set());
    index.byKey.get(key)!.add(id);
    if (chain === "stellar") {
      const issuer = address.match(/(G[A-Z2-7]{55})$/)?.[1];
      if (issuer) {
        if (!index.stellarByIssuer.has(issuer)) index.stellarByIssuer.set(issuer, new Set());
        index.stellarByIssuer.get(issuer)!.add(id);
      }
    }
  };
  for (const asset of assets) {
    const primary = primaryDeployment(String(asset.address || ""));
    if (primary) add(primary[0], primary[1], asset.id);
    for (const [chain, chainCfg] of Object.entries(asset.chainConfig?.chains ?? {})) {
      for (const [key, value] of Object.entries(chainCfg ?? {})) {
        if (!isDeploymentKey(key)) continue;
        for (const v of Array.isArray(value) ? value : [value]) if (typeof v === "string") add(chain, v, asset.id);
      }
    }
  }
  return index;
}

// peggedData ids tracking exactly this deployment on this chain (empty when untracked, >1 when ambiguous)
export function lookup(index: AddressIndex, d: { chain: string; address: string }): string[] {
  return [...(index.byKey.get(deploymentKey(d.chain, d.address)) ?? [])];
}

// Stellar pages only link the issuer; the asset code comes from the page title. An issuer can issue several
// codes (e.g. VCHF/VEUR), so an issuer-only match is a candidate for a human to confirm, never proof of tracking.
export function stellarIssuerCandidates(index: AddressIndex, d: { chain: string; address: string }): string[] {
  if (d.chain !== "stellar") return [];
  const issuer = d.address.match(/(G[A-Z2-7]{55})$/)?.[1];
  return [...((issuer && index.stellarByIssuer.get(issuer)) || [])];
}

type Attention = { token: Token; reasons: string[] };
type MissingChain = { token: Token; id: string; name: string; deployments: Deployment[] };
export type Result = {
  discovery: { docsOk: boolean; indexOk: boolean; errors: string[]; tickers: string[] };
  failures: { ticker: string; error: string }[];
  missingTokens: Token[];
  belowMinSupply: Token[];
  missingChains: MissingChain[];
  needsAttention: Attention[];
  inSync: string[];
  minSupply: number;
  exitCode: 0 | 1 | 2;
};

export function classify(token: Token, index: AddressIndex, assetName: (id: string) => string, minSupply: number, out: Result) {
  const reasons: string[] = [];
  const ids = new Set<string>();
  const unknown: Deployment[] = [];
  let candidates = false; // an unknown deployment may belong to a tracked asset; a human has to confirm
  for (const d of token.deployments) {
    const hit = lookup(index, d);
    if (hit.length > 1) reasons.push(`${d.chain} \`${d.address}\` is tracked by several peggedData ids: ${hit.join(", ")}`);
    if (hit.length) {
      hit.forEach((id) => ids.add(id));
      continue;
    }
    unknown.push(d);
    const cand = stellarIssuerCandidates(index, d);
    if (cand.length) {
      candidates = true;
      reasons.push(`stellar \`${d.address}\`: asset code not tracked, but its issuer is used by ${cand.map((id) => `${id} (${assetName(id)})`).join(", ")}; confirm the asset code`);
    }
  }
  // the chain of an address shown without an explorer link cannot be established from the page
  for (const a of token.bareAddresses) reasons.push(`address without explorer link (chain unknown): \`${a}\``);
  for (const u of token.unmapped) reasons.push(`unknown explorer: ${u}`);
  if (!token.deployments.length && !token.bareAddresses.length && !token.unmapped.length)
    reasons.push("no deployments found on the reserves page (page layout may have changed)");
  if (token.supply.status === "unknown") reasons.push(`supply unknown (${token.supply.reason})`);
  if (ids.size > 1) reasons.push(`deployments match different peggedData ids: ${[...ids].map((id) => `${id} (${assetName(id)})`).join(", ")}`);

  if (!ids.size) {
    if (!token.deployments.length || candidates) {
      // nothing attributable to a chain, or possibly an existing asset: only a human can tell what this is
      out.needsAttention.push({ token, reasons });
    } else if (token.supply.status === "ok" && token.supply.value < minSupply) {
      out.belowMinSupply.push(token);
    } else {
      out.missingTokens.push(token); // unmapped / bare / unknown supply are listed alongside it
    }
    return;
  }
  if (ids.size === 1 && unknown.length) {
    const id = [...ids][0];
    out.missingChains.push({ token, id, name: assetName(id), deployments: unknown });
  } else if (unknown.length) {
    reasons.push(`untracked deployments, owner ambiguous: ${unknown.map((d) => `${d.chain} \`${d.address}\``).join(", ")}`);
  }
  if (reasons.length) out.needsAttention.push({ token, reasons });
  else if (!unknown.length) out.inSync.push(token.ticker);
}

export async function run({ text = defaultFetch, assets = peggedAssets as any as Asset[], minSupply = 0 } = {}): Promise<Result> {
  const discovery = await getTickers(text);
  const index = buildIndex(assets);
  const assetById = new Map(assets.map((a) => [a.id, a]));
  const out: Result = {
    discovery: { docsOk: discovery.docsOk, indexOk: discovery.indexOk, errors: discovery.errors, tickers: [...discovery.tickers.keys()] },
    failures: [], missingTokens: [], belowMinSupply: [], missingChains: [], needsAttention: [], inSync: [], minSupply, exitCode: 0,
  };
  for (const [ticker, pegType] of [...discovery.tickers.entries()].sort()) {
    let token: Token;
    try {
      token = await getToken(ticker, pegType, text);
    } catch (e: any) {
      out.failures.push({ ticker, error: e.message });
      continue;
    }
    classify(token, index, (id) => assetById.get(id)?.name ?? id, minSupply, out);
  }
  const incomplete = !discovery.docsOk || !discovery.indexOk || !discovery.tickers.size || out.failures.length > 0;
  const findings = out.missingTokens.length || out.missingChains.length || out.needsAttention.length;
  out.exitCode = incomplete ? 2 : findings ? 1 : 0;
  return out;
}

export function render(r: Result, date = new Date()): string {
  const fmt = (s: Supply) => (s.status === "ok" ? s.value.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "?");
  const lines: string[] = [];
  lines.push(`# Bridge stablecoin check (${date.toISOString().slice(0, 10)})`);
  lines.push(
    `Tickers discovered: ${r.discovery.tickers.length}. In sync: ${r.inSync.length}. Missing tokens: ${r.missingTokens.length}. ` +
      `Missing chains: ${r.missingChains.length}. Needs attention: ${r.needsAttention.length}. Below --min-supply: ${r.belowMinSupply.length}. Failed checks: ${r.failures.length}.`
  );
  if (!r.discovery.docsOk || !r.discovery.indexOk || r.failures.length) {
    lines.push("", "## INCOMPLETE CHECK (results below are partial, do not treat as in sync)");
    if (!r.discovery.docsOk) lines.push("- ticker discovery from Bridge docs failed; the ticker list may be incomplete");
    if (!r.discovery.indexOk) lines.push("- reserves index could not be read; tickers only listed there may be missing");
    for (const e of r.discovery.errors) lines.push(`  - ${e}`);
    for (const f of r.failures) lines.push(`- ticker \`${f.ticker}\` not checked: ${f.error}`);
  }
  if (r.missingTokens.length) {
    lines.push("", "## Not tracked in peggedData");
    for (const t of r.missingTokens) {
      lines.push(`- **${t.name} (${t.symbol})** ticker \`${t.ticker}\`, ${t.pegType}, supply ${fmt(t.supply)}  <${RESERVES}/${t.ticker}>`);
      if (t.supply.status === "unknown") lines.push(`  - supply unknown: ${t.supply.reason}`);
      for (const d of t.deployments) lines.push(`  - ${d.chain}: \`${d.address}\``);
      for (const u of t.unmapped) lines.push(`  - UNMAPPED: ${u}`);
      for (const a of t.bareAddresses) lines.push(`  - address without explorer link (chain unknown): \`${a}\``);
    }
  }
  if (r.missingChains.length) {
    lines.push("", "## Tracked, but missing chains");
    for (const m of r.missingChains) {
      lines.push(`- **${m.name}** (peggedData id ${m.id}, ticker \`${m.token.ticker}\`, supply ${fmt(m.token.supply)})`);
      for (const d of m.deployments) lines.push(`  - ${d.chain}: \`${d.address}\``);
    }
  }
  if (r.needsAttention.length) {
    lines.push("", "## Needs a human look");
    for (const { token: t, reasons } of r.needsAttention) {
      lines.push(`- **${t.name} (${t.symbol})** ticker \`${t.ticker}\`, supply ${fmt(t.supply)}  <${RESERVES}/${t.ticker}>`);
      for (const reason of reasons) lines.push(`  - ${reason}`);
    }
  }
  if (r.belowMinSupply.length) {
    lines.push("", `## Skipped: untracked, supply below --min-supply ${fmt({ status: "ok", value: r.minSupply })}`);
    for (const t of r.belowMinSupply) {
      lines.push(`- ${t.name} (${t.symbol}) ticker \`${t.ticker}\`, supply ${fmt(t.supply)}`);
      for (const d of t.deployments) lines.push(`  - ${d.chain}: \`${d.address}\``);
      for (const u of t.unmapped) lines.push(`  - UNMAPPED: ${u}`);
    }
  }
  if (r.exitCode === 0)
    lines.push("", r.belowMinSupply.length
      ? `Every Bridge token with supply >= ${fmt({ status: "ok", value: r.minSupply })} is tracked; ${r.belowMinSupply.length} smaller untracked token(s) were not checked (listed above).`
      : "Everything on reserves.bridge.xyz is already tracked.");
  return lines.join("\n");
}

export function parseArgs(args: string[]): { jsonOut: string | null; minSupply: number } {
  const value = (flag: string) => {
    const i = args.indexOf(flag);
    if (i < 0) return null;
    const v = args[i + 1];
    if (v === undefined || v.startsWith("--")) throw new Error(`${flag} needs a value`);
    return v;
  };
  const jsonOut = value("--json");
  const rawMin = value("--min-supply");
  const minSupply = rawMin === null ? 0 : Number(rawMin);
  if (!Number.isFinite(minSupply) || minSupply < 0) throw new Error(`--min-supply must be a non-negative number, got ${rawMin}`);
  return { jsonOut, minSupply };
}

if (require.main === module) {
  (async () => {
    const { jsonOut, minSupply } = parseArgs(process.argv.slice(2));
    const result = await run({ minSupply });
    console.log(render(result));
    if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(result, null, 2));
    process.exit(result.exitCode);
  })().catch((e) => {
    console.error(e);
    process.exit(2);
  });
}
