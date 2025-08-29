process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown', error)
})

import * as rates from "../../src/getRates";
import sluggifyPegged from "../../src/peggedAssets/utils/sluggifyPegged";
import peggedAssets from "../../src/peggedData/peggedData";
import { getChainDisplayName, normalizeChain } from "../../src/utils/normalizeChain";
import { CacheType, cache, initCache, saveCache } from "../cache";
import { storeRouteData } from "../file-cache";
import { craftChainDominanceResponse } from "../routes/getChainDominance";
import { getStablecoinData } from "../routes/getStableCoin";
import storeStablecoins from "./getStableCoins";
import { craftStablecoinChainsResponse } from "./getStablecoinChains";
import { craftStablecoinPricesResponse } from "./getStablecoinPrices";
import storeCharts, { craftChartsResponse, storeChartsPart2 } from "./storeCharts";
import storePeggedPrices from "./storePeggedPrices";

run().catch(console.error).then(() => process.exit(0))

async function run() {
  await initCache(CacheType.CRON)

  await Promise.all([
    storeRates(),
    storeConfig(),
    storePeggedPrices(),
  ])
  // this also pulls data from ddb and sets to cache
  await storeCharts()
  const allStablecoinsData = await storeStablecoins({ peggedPrices: cache.peggedPrices })
  const allChainsSet: Set<string> = new Set()
  const assetChainMap: {
    [asset: string]: Set<string>
  } = {}
  allStablecoinsData.peggedAssets.forEach((asset: any) => {
    const _chains = asset.chains.map(normalizeChain)
    assetChainMap[asset.id] = new Set(_chains)
    _chains.forEach((chain) => allChainsSet.add(chain))
  })
  const dominanceMap: any = {}
  const chainChartMap: any = {}
  const recentProtocolData: any = {}

  const timeWrapper = {
    storeChartsPart2: () => storeChartsPart2(assetChainMap),
    storePrices,
    storeStablecoinChains,
    storePeggedAssets,
    storeStablecoinDominance,
    storeChainChartData,
  }

  for (const key in timeWrapper) {
    console.time(key)
    await timeWrapper[key]()
    console.timeEnd(key)
  }

  await storeRouteData('stablecoins', allStablecoinsData)
  await storeRouteData('stablecoincharts2/all-dominance-chain-breakdown', { dominanceMap, chainChartMap, })
  await storeRouteData('stablecoincharts2/recent-protocol-data', recentProtocolData)
  await saveCache()

  async function storePeggedAssets() {
    for (const peggedAssetData of allStablecoinsData.peggedAssets) {
      const { id } = peggedAssetData
      try {
        const data = await getStablecoinData(id)
        data.chainBalances = data.chainBalances ?? {}
        for (const [chain, chainData] of Object.entries(data.chainBalances)) {
          const nChain = normalizeChain(chain)
          if (!assetChainMap[id].has(nChain)) {
            peggedAssetData.chains.push(chain)
            assetChainMap[id].add(nChain)
          }
          allChainsSet.add(nChain);
          (chainData as any).tokens = removeEmptyItems((chainData as any).tokens)
        }
        data.tokens = removeEmptyItems(data.tokens)
        await storeRouteData('stablecoin/' + id, data)
      } catch (e) {
        console.error('Error fetching asset data', e)
      }
    }
  }

  async function storeStablecoinDominance() {
    for (const chain of [...allChainsSet]) {
      try {
        const data = await craftChainDominanceResponse(chain)
        dominanceMap[getChainDisplayName(chain, true)] = data
        await storeRouteData('stablecoindominance/' + chain, data)
      } catch (e) {
        console.error('Error fetching chain data', e)
      }
    }
  }

  async function storeChainChartData() {
    const doublecountedIds = peggedAssets.map((stable)=> stable.doublecounted === true ? stable.id : null).filter(Boolean)
    const frontendKey = 'all-llama-app'
    const allData = await getChainData('all')
    await storeRouteData('stablecoincharts2/all', allData)
    await storeRouteData('stablecoincharts/all' , allData.aggregated)
    const allDataShortened: any = {
      breakdown: {},
      aggregated: allData.aggregated
    }
    for (const [id, value] of Object.entries(allData.breakdown)) {
      allDataShortened.breakdown[id] = (value as any)
    }
    await storeRouteData('stablecoincharts2/' + frontendKey, allDataShortened)

    for (const chain of [...allChainsSet]) {
      try {
        const data = await getChainData(chain)
        chainChartMap[getChainDisplayName(chain, true)] = data.aggregated
        await storeRouteData('stablecoincharts2/' + chain, data)
        await storeRouteData('stablecoincharts/' + chain, data.aggregated)
      } catch (e) {
        console.error('Error fetching chain data', e)
      }
    }

    async function getChainData(chain: string) {
      let startTimestamp = undefined
      chain = chain === frontendKey ? 'all' : chain
      const aggregated = removeEmptyItems(await craftChartsResponse({ chain, startTimestamp, assetChainMap}))
      const breakdown: any = {}

      for (const [peggedAsset, chainMap] of Object.entries(assetChainMap)) {
        if (chain !== 'all' && !(chainMap as any).has(chain)) continue
        const allPeggedAssetsData = await craftChartsResponse({ chain, peggedID: peggedAsset, startTimestamp, assetChainMap })
        if (chain === 'all') recentProtocolData[peggedAsset] = allPeggedAssetsData.slice(-32)
        breakdown[peggedAsset] = removeEmptyItems(allPeggedAssetsData)
      }

      return { aggregated, breakdown, doublecountedIds }
    }
  }
}

async function storeConfig() {
  let configJSON: any = Object.fromEntries(
    peggedAssets.map((pegged) => [sluggifyPegged(pegged), pegged.id])
  )
  await storeRouteData('config', configJSON)
}

async function storeRates() {
  await storeRouteData('rates', await rates.craftRatesResponse())
}

async function storePrices() {
  await storeRouteData('stablecoinprices', craftStablecoinPricesResponse())
}

async function storeStablecoinChains() {
  await storeRouteData('stablecoinchains', craftStablecoinChainsResponse())
}

// filter out empty items from array but retain the last item as is
function removeEmptyItems(array: any[] = []) {
  if (array.length < 2) return array
  const last = array[array.length - 1]
  let items = array.slice(0, array.length - 1)
  items = items.map(removeEmpty).filter((item: any) => item)
  items.push(last)
  return items
}

function removeEmpty(item: any) {
  if (!item) return item
  if (typeof item === 'object') {
    const { date, ...rest } = item
    for (const key in rest) {
      rest[key] = removeEmpty(rest[key])
      if (!rest[key])
        delete rest[key]
    }
    if (Object.keys(rest).length === 0)
      return null
    return { date, ...rest }
  } else if (typeof item === 'number') {
    return Math.round(item)
  }
  return item
}
