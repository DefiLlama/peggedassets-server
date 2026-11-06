/**
 * Report Bridge (Stripe) Open Issuance stablecoins that peggedData does not track yet, or
 * tracks on fewer chains than Bridge has deployed them on.
 *
 * Sources (all public, no key):
 *   - ticker list:   https://apidocs.bridge.xyz/platform/issuance/reporting-and-transparency.md
 *                    (fallback: slugs linked from https://reserves.bridge.xyz/)
 *   - supply:        https://transparency.bridge.xyz/v0/stablecoins/<ticker>
 *   - deployments:   https://reserves.bridge.xyz/<ticker>  (explorer links -> chain + contract)
 *
 * Usage:
 *   npx ts-node --transpile-only src/adapters/peggedAssets/helper/scripts/checkBridgeStablecoins.ts [--json out.json] [--min-supply 1000]
 *
 * Exit code 1 when something is missing (so a scheduler can key off it), 0 when fully in sync.
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

type Deployment = { chain: string; address: string; source: string };
type Token = {
  ticker: string;
  name: string;
  symbol: string;
  pegType: string;
  supply: number | null;
  deployments: Deployment[];
  unmapped: string[]; // explorer links the script could not attribute to a chain
  bareAddresses: string[]; // addresses shown on the page without an explorer link (chain unknown)
};

async function text(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "user-agent": "defillama-peggedassets-bridge-check" } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

async function getTickers(): Promise<Map<string, string>> {
  const tickers = new Map<string, string>(); // ticker -> pegType
  try {
    const md = await text(TICKERS_MD);
    const start = md.search(/Supported stablecoin tickers/i);
    const section = start >= 0 ? md.slice(start, md.indexOf("\n## ", start) > 0 ? md.indexOf("\n## ", start) : undefined) : "";
    let peg = "peggedUSD";
    for (const line of section.split("\n")) {
      const heading = line.match(/\*\*([A-Z]{3})-pegged\*\*/);
      if (heading) peg = `pegged${heading[1]}`;
      for (const m of line.matchAll(/`([a-z0-9_]+)`/g)) tickers.set(m[1], peg);
    }
  } catch (e: any) {
    console.error(`[bridge-check] ticker list from docs failed: ${e.message}`);
  }
  // the reserves index links the top 20 tokens; union in case the docs lag behind
  try {
    const html = await text(RESERVES + "/");
    for (const m of html.matchAll(/href="\/([a-z0-9_]+)"/g)) if (!tickers.has(m[1])) tickers.set(m[1], "peggedUSD");
  } catch (e: any) {
    console.error(`[bridge-check] reserves index failed: ${e.message}`);
  }
  return tickers;
}

async function getToken(ticker: string, pegType: string): Promise<Token> {
  const token: Token = { ticker, name: ticker, symbol: ticker.toUpperCase(), pegType, supply: null, deployments: [], unmapped: [], bareAddresses: [] };
  try {
    const api = JSON.parse(await text(`${TRANSPARENCY}/${ticker}`));
    token.supply = Number(api.total_onchain_amount);
  } catch (e: any) {
    console.error(`[bridge-check] ${ticker}: transparency api failed: ${e.message}`);
  }
  const html = await text(`${RESERVES}/${ticker}`);
  const title = html.match(/<title>([^<]*?)\s*\|\s*Bridge<\/title>/);
  const nameSym = title?.[1].match(/^(.*)\s\(([^)]+)\)$/);
  if (nameSym) {
    token.name = nameSym[1].trim();
    token.symbol = nameSym[2].trim();
  }
  const links = new Set<string>();
  for (const m of html.matchAll(/https?:\/\/[^"'\s<>)\\]+\/(?:address|token|account|coin|object|contract)\/[^"'\s<>)\\]+/g))
    links.add(m[0].replace(/\\$/, ""));
  for (const link of links) {
    const host = new URL(link).host.replace(/^www\./, "");
    const chain = EXPLORER_CHAINS[host];
    let address = decodeURIComponent(link.split(/\/(?:address|token|account|coin|object|contract)\//)[1] || "").replace(/\/$/, "");
    if (!chain) {
      token.unmapped.push(link);
      continue;
    }
    if (chain === "sui") address = address.split("/")[0]; // suiscan appends /traders etc.
    if (chain === "stellar" && /^G[A-Z2-7]{55}$/.test(address)) address = `${token.symbol.toUpperCase()}:${address}`; // asset = CODE:ISSUER
    token.deployments.push({ chain, address, source: link });
  }
  // some pages (e.g. Aptos fungible assets) show the address without an explorer link
  if (!token.deployments.length) {
    for (const m of html.matchAll(/0x[0-9a-fA-F]{64}/g)) if (!token.bareAddresses.includes(m[0])) token.bareAddresses.push(m[0]);
  }
  return token;
}

function trackedAddresses(): Map<string, string> {
  // lowercase address -> peggedData id
  const map = new Map<string, string>();
  for (const asset of peggedAssets as any[]) {
    const main = String(asset.address || "").split(":").pop()!;
    if (main) map.set(main.toLowerCase(), asset.id);
    for (const chainCfg of Object.values(asset.chainConfig?.chains ?? {}) as any[]) {
      for (const value of Object.values(chainCfg) as any[]) {
        const list = Array.isArray(value) ? value : [value];
        for (const v of list) if (typeof v === "string") map.set(v.split(":").pop()!.toLowerCase(), asset.id);
      }
    }
  }
  return map;
}

function addrKey(address: string) {
  return address.split(":").pop()!.toLowerCase();
}

(async () => {
  const args = process.argv.slice(2);
  const jsonOut = args.includes("--json") ? args[args.indexOf("--json") + 1] : null;
  const minSupply = args.includes("--min-supply") ? Number(args[args.indexOf("--min-supply") + 1]) : 0;

  const tickers = await getTickers();
  if (!tickers.size) throw new Error("no Bridge tickers discovered");
  const tracked = trackedAddresses();
  const assetById = new Map((peggedAssets as any[]).map((a) => [a.id, a]));

  const missingTokens: Token[] = [];
  const missingChains: { token: Token; id: string; name: string; deployments: Deployment[] }[] = [];
  const needsAttention: Token[] = [];
  let inSync = 0;

  for (const [ticker, pegType] of [...tickers.entries()].sort()) {
    let token: Token;
    try {
      token = await getToken(ticker, pegType);
    } catch (e: any) {
      console.error(`[bridge-check] ${ticker}: ${e.message}`);
      continue;
    }
    const known = token.deployments.filter((d) => tracked.has(addrKey(d.address)));
    const unknown = token.deployments.filter((d) => !tracked.has(addrKey(d.address)));
    const bareTracked = token.bareAddresses.some((a) => tracked.has(addrKey(a)));
    if (!token.deployments.length) {
      if (bareTracked) inSync++;
      else needsAttention.push(token);
    } else if (!known.length) {
      if ((token.supply ?? 0) >= minSupply) missingTokens.push(token);
      else inSync++;
    } else if (unknown.length) {
      const id = tracked.get(addrKey(known[0].address))!;
      missingChains.push({ token, id, name: assetById.get(id)?.name ?? id, deployments: unknown });
    } else {
      inSync++;
      if (token.unmapped.length) needsAttention.push(token);
    }
  }

  const fmt = (n: number | null) => (n == null ? "?" : n.toLocaleString("en-US", { maximumFractionDigits: 0 }));
  const lines: string[] = [];
  lines.push(`# Bridge stablecoin check (${new Date().toISOString().slice(0, 10)})`);
  lines.push(`Tickers discovered: ${tickers.size}. In sync: ${inSync}. Missing tokens: ${missingTokens.length}. Missing chains: ${missingChains.length}. Needs attention: ${needsAttention.length}.`);
  if (missingTokens.length) {
    lines.push("", "## Not tracked in peggedData");
    for (const t of missingTokens) {
      lines.push(`- **${t.name} (${t.symbol})** ticker \`${t.ticker}\`, ${t.pegType}, supply ${fmt(t.supply)}  <${RESERVES}/${t.ticker}>`);
      for (const d of t.deployments) lines.push(`  - ${d.chain}: \`${d.address}\``);
      for (const u of t.unmapped) lines.push(`  - UNMAPPED: ${u}`);
      for (const a of t.bareAddresses) lines.push(`  - address without explorer link (chain unknown): \`${a}\``);
    }
  }
  if (missingChains.length) {
    lines.push("", "## Tracked, but missing chains");
    for (const m of missingChains) {
      lines.push(`- **${m.name}** (peggedData id ${m.id}, ticker \`${m.token.ticker}\`, supply ${fmt(m.token.supply)})`);
      for (const d of m.deployments) lines.push(`  - ${d.chain}: \`${d.address}\``);
    }
  }
  if (needsAttention.length) {
    lines.push("", "## Needs a human look (no explorer link, or unknown explorer host)");
    for (const t of needsAttention) {
      lines.push(`- **${t.name} (${t.symbol})** ticker \`${t.ticker}\`, supply ${fmt(t.supply)}  <${RESERVES}/${t.ticker}>`);
      for (const u of t.unmapped) lines.push(`  - unknown explorer: ${u}`);
      for (const a of t.bareAddresses) lines.push(`  - address without explorer link (chain unknown): \`${a}\``);
    }
  }
  if (!missingTokens.length && !missingChains.length && !needsAttention.length) lines.push("", "Everything on reserves.bridge.xyz is already tracked.");

  console.log(lines.join("\n"));
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ missingTokens, missingChains, needsAttention, tickers: [...tickers.keys()] }, null, 2));
  process.exit(missingTokens.length || missingChains.length || needsAttention.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
