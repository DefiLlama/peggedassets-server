import { getLastRecord, historicalRates } from "../src/peggedAssets/utils/getLastRecord";
import { FxRateMap } from "../src/utils/fxRates";
import { PriceSeries } from "../src/utils/pricing";
import { readFromPGCache, writeToPGCache } from "./file-cache";

export enum CacheType {
  CRON,
  API_SERVER
}

type Prices = {
  [coinGeckoId: string]: number;
};

type DailyPeggedPrices = {
  PK: string;
  SK: number;
  prices: Prices;
}

export const cache: {
  peggedPrices?: Prices;
  rates?: any;
  fxRateMap?: FxRateMap | null;
  lastPrices?: any;
  peggedAssetsData?: any;
  historicalPrices?: DailyPeggedPrices[]
  priceSeries?: PriceSeries
} = {}

const cacheFile = 'stablecoin-cache-v7'

export async function initCache(cacheType = CacheType.API_SERVER) {
  console.time('Cache initialized')
  if (cacheType === CacheType.CRON) {
    const _cache = await readFromPGCache(cacheFile) ?? {}
    Object.keys(_cache).forEach(key => cache[key] = _cache[key])
    cache.rates = await getLastRecord(historicalRates);
  }
  console.timeEnd('Cache initialized')
}

export async function saveCache() {
  // a Map does not survive JSON, the chart handler rebuilds both every run
  await writeToPGCache(cacheFile, { ...cache, priceSeries: undefined, fxRateMap: undefined })
}
