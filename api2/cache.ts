import { getLastRecord, historicalRates } from "../src/peggedAssets/utils/getLastRecord";
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
  historicalRates?: any;
  lastPrices?: any;
  priceTimestamps?: any;
  rateTimestamps?: any;
  peggedAssetsData?: any;
  historicalPrices?: DailyPeggedPrices[]
} = {}

const cacheFile = 'stablecoin-cache-v5'

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
  await writeToPGCache(cacheFile, cache)
}
