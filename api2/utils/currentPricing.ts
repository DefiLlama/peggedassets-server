import { getCurrentUnixTimestamp, getTimestampAtStartOfDayUTC } from "../../src/utils/date";
import { fxFallbackPrice, pegPriceAt } from "../../src/utils/fxRates";
import { Pricing, PriceSeries, resolvePricing } from "../../src/utils/pricing";
import { cache } from "../cache";
import getEnv from "../env";

let warnedNoSeries = false;

export function cachedSeries(): PriceSeries {
  if (cache.priceSeries) return cache.priceSeries;
  if (!warnedNoSeries) {
    console.warn("no price series in the cache, every listing without a fresh price is valued at the peg");
    warnedNoSeries = true;
  }
  return new Map();
}

export function currentPricing(pegged: { gecko_id?: string | null; pegType: string }, now = getCurrentUnixTimestamp()): Pricing {
  const pegPrice = cache.fxRateMap
    ? pegPriceAt(cache.fxRateMap, pegged.pegType, 0)
    : fxFallbackPrice(cache.rates?.rates, pegged.pegType);
  return resolvePricing(
    pegged,
    {
      current: cache.peggedPrices,
      series: cachedSeries(),
      daySK: getTimestampAtStartOfDayUTC(now),
      nowSK: now,
      pegPrice,
    },
    { maxAgeDays: getEnv().priceCarryMaxDays }
  );
}
