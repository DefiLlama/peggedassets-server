import peggedAssets from "../../src/peggedData/peggedData";
import * as rates from "../../src/getRates";
import sluggifyPegged from "../../src/peggedAssets/utils/sluggifyPegged";
import { storeRouteData } from "../file-cache";
import storePeggedPrices from "./storePeggedPrices";
import storeCharts from "./storeCharts";
import storeStablecoins from "./getStableCoins";
import { craftStablecoinPricesResponse } from "./getStablecoinPrices";
import { craftStablecoinChainsResponse } from "./getStablecoinChains";
import { cache, initCache, saveCache } from "../cache";
import { getCurrentUnixTimestamp } from "../../src/utils/date";
import { sendMessage } from "../../src/utils/discord";

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
  await storeStablecoins()
  await storePrices()
  await storeStablecoinChains()

  await saveCache()

  await alertOutdated()

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
}

async function alertOutdated() {
  const now = getCurrentUnixTimestamp();
  const outdated = (
    peggedAssets.map((asset) => {
      if (asset.delisted) return null;
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