import { humanizeNumber } from "@defillama/sdk/build/computeTVL/humanizeNumber";
import { HOUR } from "../../utils/date";

export const NON_CHAIN_KEYS = new Set([
  "PK", "SK", "totalCirculating", "extrapolated", "extrapolatedChains", "extrapolatedChainsCount",
]);

export type ChainDrop = {
  chain: string;
  assetName: string;
  assetId: string;
  previous: number;
  current: number;
  missing: boolean; // chain key absent from the new record, not just 0
  protection?: "held" | "fetch-failed" | "accepted" | "recovered";
  expiresAt?: number;
};

export const chainDrops: ChainDrop[] = [];

export function findChainDrops(
  prev: any,
  next: any,
  pegType: string,
  asset: { name: string; id: string },
  unixTimestamp: number
): ChainDrop[] {
  if (
    typeof prev?.SK !== "number" ||
    !(Math.abs(prev.SK - unixTimestamp) < 12 * HOUR)
  ) return [];

  const chains = new Set(
    [...Object.keys(prev ?? {}), ...Object.keys(next ?? {})].filter((k) => !NON_CHAIN_KEYS.has(k))
  );
  const drops: ChainDrop[] = [];
  for (const chain of chains) {
    const previous = prev?.[chain]?.circulating?.[pegType] ?? 0;
    const current = next?.[chain]?.circulating?.[pegType] ?? 0;
    if (previous > 0 && previous / 2 > current) {
      drops.push({
        chain,
        assetName: asset.name,
        assetId: asset.id,
        previous,
        current,
        missing: next?.[chain] === undefined,
      });
    }
  }
  return drops;
}

const MAX_CHAINS = 10;
const MAX_ASSETS_PER_CHAIN = 5;

export function formatChainDrops(drops: ChainDrop[]): string[] {
  const byChain = new Map<string, ChainDrop[]>();
  for (const d of drops) {
    if (!byChain.has(d.chain)) byChain.set(d.chain, []);
    byChain.get(d.chain)!.push(d);
  }
  const sum = (ds: ChainDrop[]) => ds.reduce((acc, d) => acc + d.previous, 0);
  const sorted = [...byChain.entries()].sort((a, b) => sum(b[1]) - sum(a[1]));

  const lines = [`**Chain-level circulating alerts:**`];
  for (const [chain, ds] of sorted.slice(0, MAX_CHAINS)) {
    lines.push(`• [${ds.length}] ${chain}`);
    for (const d of ds.slice(0, MAX_ASSETS_PER_CHAIN)) {
      let status = "";
      if (d.protection === "held") status = ` (last valid balance retained until ${new Date(d.expiresAt! * 1000).toISOString()})`;
      if (d.protection === "fetch-failed") status = " (fetch unavailable; last valid balance retained)";
      if (d.protection === "accepted") status = " (protection expired; new balance accepted)";
      if (d.protection === "recovered") status = " (fetch recovered; protection removed)";
      lines.push(`    - ${d.assetName} (id=${d.assetId}): ${humanizeNumber(d.previous)} → ${d.missing ? "missing" : humanizeNumber(d.current)}${status}`);
    }
    if (ds.length > MAX_ASSETS_PER_CHAIN) lines.push(`    ... and ${ds.length - MAX_ASSETS_PER_CHAIN} more`);
  }
  if (sorted.length > MAX_CHAINS) lines.push(`... and ${sorted.length - MAX_CHAINS} more chains`);
  return lines;
}
