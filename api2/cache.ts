import { getLastRecord, historicalRates } from "../src/peggedAssets/utils/getLastRecord";
import { FxRateMap } from "../src/utils/fxRates";
import { clearOldPGCacheFiles, readFromPGCache, writeToPGCache } from "./file-cache";
import { getR2JSON, storeR2JSON } from "./utils/r2";

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
  priceTimestamps?: any;
  peggedAssetsData?: any;
  historicalPrices?: DailyPeggedPrices[]
} = {}

const cacheFile = 'stablecoin-cache-v7' // update the version number to reset the cache

// to ensure that we dont run out of disk space, old cache versions are removed
export function clearOldCacheFiles() {
  return clearOldPGCacheFiles('stablecoin-cache-v', cacheFile)
}

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

// Plain JSON on R2 (defillama-datasets bucket), written by the ui-tool after a backfill.
// Same flow as the TVL cache reset queue (config/tvl-cache-reset).
const CACHE_RESET_R2_KEY = 'config/stablecoins-cache-reset'

// Missing key = empty queue. Any other read error throws, so queued ids are never overwritten.
async function readCacheResetQueue(): Promise<Record<string, number>> {
  return (await getR2JSON(CACHE_RESET_R2_KEY)) ?? {}
}

// Drops asset ids from the cron cache file so this run refetches their full history from DDB.
// Must run before initCache(CacheType.CRON).
async function resetCachedAssets(ids: string[]) {
  const data = await readFromPGCache(cacheFile)
  if (data?.peggedAssetsData) {
    ids.forEach((id) => delete data.peggedAssetsData[id])
    await writeToPGCache(cacheFile, data)
  }
  console.log(`Reset stablecoin cache for ids: ${ids.join(', ')}`)
}

// Manual reset, e.g. after editing records directly in DDB:
// STABLECOINS_CACHE_RESET_ASSETS=1,2 pnpm run api2-cron-task
export async function resetCacheAssetsFromEnv() {
  const ids = (process.env.STABLECOINS_CACHE_RESET_ASSETS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
  if (!ids.length) return
  await resetCachedAssets(ids)
}

// R2 queue of asset ids ({ [id]: queuedAt }) to reset, e.g. after a backfill.
// Must run before initCache(CacheType.CRON).
export async function processQueuedCacheResets() {
  const queued = await readCacheResetQueue()
  const ids = Object.keys(queued)
  if (!ids.length) {
    console.log('No queued stablecoin cache resets')
    return
  }

  await resetCachedAssets(ids)

  // Re-read before clearing so ids queued (or re-queued) meanwhile are kept for the next run.
  const latest = await readCacheResetQueue()
  ids.forEach((id) => {
    if (latest[id] === queued[id]) delete latest[id]
  })
  await storeR2JSON(CACHE_RESET_R2_KEY, latest)
}
