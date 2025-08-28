import * as sdk from "@defillama/sdk";
import PromisePool from "@supercharge/promise-pool";
import { alertOutdated } from "../alertOutdated";
import storePeggedAssets from "./../peggedAssets/storePeggedAssets/storePegged";
import peggedAssets from "./../peggedData/peggedData";

const INTERNAL_CACHE_FILE = 'pegged-assets-cache/sdk-cache.json'

const handler = async () => {
  await initializeSdkInternalCache() // initialize sdk cache - this will cache abi call responses and reduce the number of calls to the blockchain
  const peggedIndexes = Array.from(Array(peggedAssets.length).keys());
  // randomize the order of the pegged indexes
  peggedIndexes.sort(() => Math.random() - 0.5)

  const items = peggedIndexes
  await new PromisePool()
    .withConcurrency(15)
    .for(items)
    .process(async (i: any) => {
      // const timeKey = `                                             pegged_asset_${peggedAssets[i].name}`;
      // console.time(timeKey);
      try {
        await storePeggedAssets([i])
      } catch (e) {
        console.log('error storing', peggedAssets[i].name)
        console.error(e)
      }
      // console.timeEnd(timeKey);
    })
    
  if (process.env.OUTDATED_WEBHOOK) {
    try {
      console.log('🔍 Checking for outdated stablecoins...')
      await alertOutdated()
    } catch (error) {
      console.error('❌ Error checking outdated stablecoins:', error)
    }
  } else {
    console.log('⚠️  OUTDATED_WEBHOOK not configured - skipping stablecoin alerts')
  }
};

handler().catch(console.error).then(async () => {
  console.log("done")
  console.log("saving cache")
  await saveSdkInternalCache()
  process.exit(0)
});



async function initializeSdkInternalCache() {
  let currentCache = await sdk.cache.readCache(INTERNAL_CACHE_FILE)
  sdk.log('cache size:', JSON.stringify(currentCache).length, 'chains:', Object.keys(currentCache))
  const ONE_MONTH = 60 * 60 * 24 * 30
  if (!currentCache || !currentCache.startTime || (Date.now() / 1000 - currentCache.startTime > ONE_MONTH)) {
    currentCache = {
      startTime: Math.round(Date.now() / 1000),
    }
    await sdk.cache.writeCache(INTERNAL_CACHE_FILE, currentCache)
  }
  sdk.sdkCache.startCache(currentCache)
}

async function saveSdkInternalCache() {
  await sdk.cache.writeCache(INTERNAL_CACHE_FILE, sdk.sdkCache.retriveCache())
}
