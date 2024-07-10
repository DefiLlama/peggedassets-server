import { getLastRecord, historicalRates } from "../src/peggedAssets/utils/getLastRecord";
import { readFromPGCache, writeToPGCache } from "./file-cache";


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

const MINUTES = 60 * 1000
const HOUR = 60 * MINUTES

const cacheFile = 'stablecoin-cache'

export async function initCache() {
  console.time('Cache initialized')
  const _cache = await readFromPGCache(cacheFile) ?? {}
  Object.keys(_cache).forEach(key => cache[key] = _cache[key])
  cache.rates = await getLastRecord(historicalRates);
  console.timeEnd('Cache initialized')
}

export async function saveCache() {
  await writeToPGCache(cacheFile, cache)
}
