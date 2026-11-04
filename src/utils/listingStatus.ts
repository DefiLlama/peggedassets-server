import { getClosestDayStartTimestamp } from "./date";

export function isInactive(asset: { deadFrom?: string | null; delisted?: boolean }): boolean {
  return Boolean(asset.deadFrom) || asset.delisted === true;
}

export function deadFromSK(asset: { deadFrom?: string | null }): number | null {
  if (!asset.deadFrom) return null;
  const ms = Date.parse(asset.deadFrom);
  const isCalendarDay = !Number.isNaN(ms) && new Date(ms).toISOString().slice(0, 10) === asset.deadFrom;
  if (!isCalendarDay) {
    throw new Error(`deadFrom "${asset.deadFrom}" is not a YYYY-MM-DD date`);
  }
  return ms / 1000;
}

export function balancesUntilDeadFrom<T extends { SK: number }>(balances: T[], asset: { deadFrom?: string | null }): T[] {
  const lastSK = deadFromSK(asset);
  return lastSK === null ? balances : balances.filter((balance) => getClosestDayStartTimestamp(balance.SK) <= lastSK);
}
