import PromisePool from "@supercharge/promise-pool";
import storePeggedAssets from "./../peggedAssets/storePeggedAssets/storePegged";
import peggedAssets from "./../peggedData/peggedData";
import * as sdk from "@defillama/sdk"

const INTERNAL_CACHE_FILE = 'pegged-assets-cache/sdk-cache.json'

const handler = async () => {
  await initializeSdkInternalCache() // initialize sdk cache - this will cache abi call responses and reduce the number of calls to the blockchain
  const peggedIndexes = Array.from(Array(peggedAssets.length).keys());
  // randomize the order of the pegged indexes
  peggedIndexes.sort(() => Math.random() - 0.5)
  
  const items = peggedIndexes.slice(0, 7)
  await new PromisePool(items)
  .withConcurrency(7)
  .for(peggedIndexes)
  .process((i: any) => storePeggedAssets([i]))
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
  const ONE_WEEK = 60 * 60 * 24 * 7
  if (!currentCache || !currentCache.startTime || (Date.now() / 1000 - currentCache.startTime > ONE_WEEK)) {
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
