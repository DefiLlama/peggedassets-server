import peggedAssets from "../../src/peggedData/peggedData";
import * as rates from "../../src/getRates";
import sluggifyPegged from "../../src/peggedAssets/utils/sluggifyPegged";
import { storeRouteData } from "../file-cache";
import storePeggedPrices from "./storePeggedPrices";
import storeCharts, { craftChartsResponse } from "./storeCharts";
import storeStablecoins from "./getStableCoins";
import { craftStablecoinPricesResponse } from "./getStablecoinPrices";
import { craftStablecoinChainsResponse } from "./getStablecoinChains";
import { cache, initCache, saveCache } from "../cache";
import { getCurrentUnixTimestamp } from "../../src/utils/date";
import { sendMessage } from "../../src/utils/discord";
import { getStablecoinData } from "../routes/getStableCoin";
import { craftChainDominanceResponse } from "../routes/getChainDominance";
import { getChainDisplayName, normalizeChain } from "../../src/utils/normalizeChain";

run().catch(console.error).then(() => process.exit(0))

async function run() {
  await initCache()

  await Promise.all([
    storeRates(),
    storeConfig(),
    storePeggedPrices(),
  ])

  // this also pulls data from ddb and sets to cache
  await storeCharts()
  const allStablecoinsData = await storeStablecoins({ peggedPrices: cache.peggedPrices })
  await storePrices()
  await storeStablecoinChains()
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

  await storePeggedAssets()
  await storeStablecoinDominance()
  await storeChainChartData()

  await storeRouteData('stablecoins', allStablecoinsData)
  await storeRouteData('stablecoincharts2/all-dominance-chain-breakdown', { dominanceMap, chainChartMap, })
  await storeRouteData('stablecoincharts2/recent-protocol-data', recentProtocolData)
  await saveCache()

  await alertOutdated()


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
    const frontendKey = 'all-llama-app'
    const allChartsStartTimestamp = 1617148800 // for /stablecoins page, charts begin on April 1, 2021, to reduce size of page
    const allData = await getChainData('all')
    await storeRouteData('stablecoincharts2/all', allData)
    const allDataShortened: any = {
      breakdown: {},
      aggregated: allData.aggregated.filter((item: any) => item.date >= allChartsStartTimestamp)
    }
    for (const [id, value] of Object.entries(allData.breakdown)) {
      allDataShortened.breakdown[id] = (value as any).filter((item: any) => item.date >= allChartsStartTimestamp)
    }
    await storeRouteData('stablecoincharts2/' + frontendKey, allDataShortened)

    for (const chain of [...allChainsSet]) {
      try {
        const data = await getChainData(chain)
        chainChartMap[getChainDisplayName(chain, true)] = data.aggregated
        await storeRouteData('stablecoincharts2/' + chain, data)
      } catch (e) {
        console.error('Error fetching chain data', e)
      }
    }

    async function getChainData(chain: string) {
      let startTimestamp = chain === frontendKey ? allChartsStartTimestamp : undefined
      chain = chain === frontendKey ? 'all' : chain
      const aggregated = removeEmptyItems(await craftChartsResponse({ chain, startTimestamp, }))
      const breakdown: any = {}

      for (const [peggedAsset, chainMap] of Object.entries(assetChainMap)) {
        if (chain !== 'all' && !(chainMap as any).has(chain))
          continue
        const allPeggedAssetsData = await craftChartsResponse({ chain, peggedID: peggedAsset, startTimestamp })
        if (chain === 'all')
          recentProtocolData[peggedAsset] = allPeggedAssetsData.slice(-32)
        breakdown[peggedAsset] = removeEmptyItems(allPeggedAssetsData)
      }


      return { aggregated, breakdown }
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


async function alertOutdated() {
  const now = getCurrentUnixTimestamp();
  const outdated = (
    peggedAssets.map((asset) => {
      if (asset.delisted || asset.name === 'TerraClassicUSD') return null;
      const last = cache.peggedAssetsData?.[asset.id]?.lastBalance
      if (last?.SK < now - 5 * 3600) {
        return {
          name: asset.name,
          hoursAgo: (now - last?.SK) / 3600,
        };
      }
      return null;
    })
  ).filter((a) => a !== null);

  if (outdated.length > 0) {
    const message = outdated
      .map((a) => `${a!.name} - ${a!.hoursAgo.toFixed(2)} hours ago`)
      .join("\n")
    await sendMessage(message, process.env.OUTDATED_WEBHOOK!);
  }

}


function removeEmptyItems(array: any[] = []) {
  return array.map(removeEmpty).filter((item: any) => item)
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