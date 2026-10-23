import dynamodb, { getHistoricalValues } from "../../src/utils/shared/dynamodb";
import peggedAssets from "../../src/peggedData/peggedData";
import { getPrices } from "../../src/adapters/peggedAssets/prices";
import { store } from "../../src/utils/s3";
import { getTimestampAtStartOfDay } from "../../src/utils/date";
import {
  dailyPeggedPrices,
  hourlyPeggedPrices,
} from "../../src/peggedAssets/utils/getLastRecord";
import { bridgeInfo } from "../../src/peggedData/bridgeData";
import { getCurrentUnixTimestamp } from "../../src/utils/date";
import { sendMessage } from "../../src/utils/discord";
import { isInactive } from "../../src/utils/listingStatus";
import { priceFeedReport } from "../../src/utils/priceFeedReport";
import { hasMarketPrices } from "../../src/utils/pricing";
import { cache } from "../cache";
import getEnv from "../env";
import { cachedSeries } from "../utils/currentPricing";

let priceFeedFailed = false

export default async function handler() {
  const prices = await readPriceFeed()
  priceFeedFailed = prices === null
  cache.peggedPrices = prices ?? {}
  if (!cache.historicalPrices) cache.historicalPrices = []

  // store bridge info (name, links) in s3
  await store("bridgeInfo.json", JSON.stringify(bridgeInfo))

  const hourTimestamp = getCurrentUnixTimestamp()
  const dayTimestamp = getTimestampAtStartOfDay(hourTimestamp)

  // store hourly prices in db
  if (prices) {
    await dynamodb.put({ PK: hourlyPeggedPrices, SK: hourTimestamp, prices: prices, })
    await dynamodb.put({ PK: dailyPeggedPrices, SK: dayTimestamp, prices: prices, })
  }

  const highestSK = cache.historicalPrices.reduce((highest, item) => Math.max(highest, item.SK), -1)
  const newItems = await getHistoricalValues(dailyPeggedPrices, highestSK)
  newItems.forEach(item => {
    if (item?.prices) {
      Object.entries(item.prices).forEach(([key, value]) => {
        if (!value) delete item.prices[key] // remove null values
      })
    }
  })
  cache.historicalPrices.push(...newItems)
}

// the adapter sets these two keys on every answer, so they do not prove the feed answered
const adapterForcedIds = ["m-2", "terrausd"]

async function readPriceFeed(): Promise<Record<string, number> | null> {
  try {
    const prices: Record<string, number> = await getPrices(peggedAssets)
    if (!hasMarketPrices(prices, adapterForcedIds)) throw new Error("the answer prices no listing")
    return prices
  } catch (e) {
    console.error(`price feed failed, this run carries last known prices and stores no price record: ${(e as Error)?.message ?? e}`)
    return null
  }
}

export async function sendPriceFeedReport() {
  const assets = peggedAssets.map((pegged) => ({
    id: pegged.id,
    symbol: pegged.symbol,
    gecko_id: pegged.gecko_id,
    circulating: cache.peggedAssetsData?.[pegged.id]?.lastBalance?.totalCirculating?.circulating?.[pegged.pegType] ?? 0,
    inactive: isInactive(pegged),
  }))
  const report = priceFeedReport(cachedSeries(), priceFeedFailed ? null : cache.peggedPrices ?? {}, assets)
  if (!report) return
  const webhook = getEnv().pricesWebhook
  if (!webhook) {
    console.info(report)
    return
  }
  try {
    await sendMessage(report, webhook, false)
  } catch (e) {
    console.error(`price feed alert not sent to Discord, this run's report is lost: ${(e as Error)?.message ?? e}`)
  }
}
