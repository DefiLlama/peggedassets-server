import { secondsInDay, secondsInHour } from "./date";

export type PriceRecord = { SK: number; prices: Record<string, number | null | undefined> };
export type PriceSeries = Map<string, Array<{ SK: number; price: number }>>;
export type PricingSource = "market" | "last-known" | "peg";
export type Pricing = { price: number; asOf: number | null; source: PricingSource };

const MAX_PEG_MULTIPLE = 1.5;

// older daily records store some prices as strings
export function asPrice(value: unknown): number | undefined {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : undefined;
}

export function buildPriceSeries(records: PriceRecord[]): PriceSeries {
  const series: PriceSeries = new Map();
  for (const { SK, prices } of [...records].sort((a, b) => a.SK - b.SK)) {
    for (const [geckoId, value] of Object.entries(prices ?? {})) {
      const price = asPrice(value);
      if (price === undefined) continue;
      const entries = series.get(geckoId) ?? [];
      entries.push({ SK, price });
      series.set(geckoId, entries);
    }
  }
  return series;
}

export function withLatestHourly<T extends PriceRecord>(records: T[], hourly: T | undefined): T[] {
  const last = records[records.length - 1];
  if (!last || !hourly || hourly.SK <= last.SK || hourly.SK >= last.SK + 25 * secondsInHour) return records;
  return [...records.slice(0, -1), { ...hourly, SK: last.SK }];
}

export function hasMarketPrices(prices: Record<string, number | null | undefined>, ignoring: string[]): boolean {
  return Object.entries(prices).some(([geckoId, price]) => !ignoring.includes(geckoId) && asPrice(price) !== undefined);
}

function lastIndexAtOrBefore(entries: Array<{ SK: number }>, SK: number): number {
  let low = 0;
  let high = entries.length - 1;
  let found = -1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (entries[mid].SK <= SK) {
      found = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return found;
}

export function resolvePricing(
  asset: { gecko_id?: string | null; pegType: string },
  at: {
    current?: Record<string, number | null | undefined>;
    series: PriceSeries;
    daySK: number;
    nowSK?: number;
    pegPrice: number;
  },
  rules: { maxAgeDays?: number } = {}
): Pricing {
  const { pegPrice } = at;
  if (!asset.gecko_id) return { price: pegPrice, asOf: null, source: "peg" };

  const marketPrice = asPrice(at.current?.[asset.gecko_id]);
  if (marketPrice !== undefined) {
    return { price: marketPrice, asOf: at.nowSK ?? at.daySK, source: "market" };
  }

  const maxPrice = asset.pegType === "peggedVAR" ? Infinity : MAX_PEG_MULTIPLE * (pegPrice > 0 ? pegPrice : 1);
  const oldestSK = rules.maxAgeDays === undefined ? -Infinity : at.daySK - rules.maxAgeDays * secondsInDay;
  const entries = at.series.get(asset.gecko_id) ?? [];
  for (let i = lastIndexAtOrBefore(entries, at.daySK); i >= 0 && entries[i].SK >= oldestSK; i--) {
    if (entries[i].price <= maxPrice) return { price: entries[i].price, asOf: entries[i].SK, source: "last-known" };
  }

  return { price: pegPrice, asOf: null, source: "peg" };
}
