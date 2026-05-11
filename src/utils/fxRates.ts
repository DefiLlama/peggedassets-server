import { getTimestampAtStartOfDayUTC, secondsInDay } from "./date";

// FX rates: per-day map for O(1) lookup. Lookup tolerates a ±1-day gap in
// the FX feed (mirrors the prior `ratesCompareFn` binary-search semantics:
// any entry within 1 day of the query is acceptable).
export type FxRateRow = { date: number; rates: Record<string, number> };

export type FxRateMap = {
  byDay: Map<number, Record<string, number>>;
  latest: Record<string, number>;
};

export function buildFxRateMap(rows: FxRateRow[]): FxRateMap | null {
  if (!Array.isArray(rows) || !rows.length) return null;
  const sorted = rows.slice().sort((a, b) => a.date - b.date);
  const byDay = new Map<number, Record<string, number>>();
  for (const entry of sorted) {
    if (!entry || !entry.rates) continue;
    byDay.set(getTimestampAtStartOfDayUTC(entry.date), entry.rates);
  }
  if (!byDay.size) return null;
  return { byDay, latest: sorted[sorted.length - 1].rates };
}

// Latest rate when timestamp == 0; otherwise prefer the exact UTC day, then
// fall back to ±1 day (matching the prior ratesCompareFn tolerance).
export function lookupFxRate(fx: FxRateMap, currency: string, timestamp: number): number | null {
  if (timestamp === 0) {
    const r = fx.latest?.[currency];
    return typeof r === "number" && r > 0 ? r : null;
  }
  const day = getTimestampAtStartOfDayUTC(timestamp);
  for (const d of [day, day - secondsInDay, day + secondsInDay]) {
    const r = fx.byDay.get(d)?.[currency];
    if (typeof r === "number" && r > 0) return r;
  }
  return null;
}
