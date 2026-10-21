import { getClosestDayStartTimestamp } from "./date";

export function isInactive(asset: { deadFrom?: string | null; delisted?: boolean }): boolean {
  return Boolean(asset.deadFrom) || asset.delisted === true;
}

export function deadFromSK(asset: { deadFrom?: string | null }): number | null {
  if (!asset.deadFrom) return null;
  const sk = Date.parse(asset.deadFrom) / 1000;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asset.deadFrom) || Number.isNaN(sk)) {
    throw new Error(`deadFrom "${asset.deadFrom}" is not a YYYY-MM-DD date`);
  }
  return sk;
}

export function balancesUntilDeadFrom<T extends { SK: number }>(balances: T[], asset: { deadFrom?: string | null }): T[] {
  const lastSK = deadFromSK(asset);
  return lastSK === null ? balances : balances.filter((balance) => getClosestDayStartTimestamp(balance.SK) <= lastSK);
}
