import { humanizeNumber } from "@defillama/sdk/build/computeTVL/humanizeNumber";

export const CHAIN_DROP_FLOOR = 1_000_000;

const NON_CHAIN_KEYS = new Set([
  "PK", "SK", "totalCirculating", "extrapolated", "extrapolatedChains", "extrapolatedChainsCount",
]);

export type ChainDrop = {
  chain: string;
  assetName: string;
  assetId: string;
  previous: number;
  missing: boolean; // chain key absent from the new record, not just 0
};

export const chainDrops: ChainDrop[] = [];

export function findChainDrops(
  prev: any,
  next: any,
  pegType: string,
  asset: { name: string; id: string }
): ChainDrop[] {
  const chains = new Set(
    [...Object.keys(prev ?? {}), ...Object.keys(next ?? {})].filter((k) => !NON_CHAIN_KEYS.has(k))
  );
  const drops: ChainDrop[] = [];
  for (const chain of chains) {
    const previous = prev?.[chain]?.circulating?.[pegType] ?? 0;
    const current = next?.[chain]?.circulating?.[pegType] ?? 0;
    if (previous >= CHAIN_DROP_FLOOR && current === 0) {
      drops.push({
        chain,
        assetName: asset.name,
        assetId: asset.id,
        previous,
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

  const lines = [`**Chains whose supply dropped to 0 since last hour:**`];
  for (const [chain, ds] of sorted.slice(0, MAX_CHAINS)) {
    lines.push(`• [${ds.length}] ${chain}`);
    for (const d of ds.slice(0, MAX_ASSETS_PER_CHAIN)) {
      lines.push(`    - ${d.assetName} (id=${d.assetId}): ${humanizeNumber(d.previous)} → ${d.missing ? "missing" : "0"}`);
    }
    if (ds.length > MAX_ASSETS_PER_CHAIN) lines.push(`    ... and ${ds.length - MAX_ASSETS_PER_CHAIN} more`);
  }
  if (sorted.length > MAX_CHAINS) lines.push(`... and ${sorted.length - MAX_CHAINS} more chains`);
  return lines;
}
