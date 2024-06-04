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
import { cache } from "../cache";

export default async function handler() {
  const prices = await getPrices(peggedAssets)
  cache.peggedPrices = prices
  if (!cache.historicalPrices) cache.historicalPrices = []

  // store bridge info (name, links) in s3
  await store("bridgeInfo.json", JSON.stringify(bridgeInfo))

  const hourTimestamp = getCurrentUnixTimestamp()
  const dayTimestamp = getTimestampAtStartOfDay(hourTimestamp)

  // store hourly prices in db
  await dynamodb.put({ PK: hourlyPeggedPrices, SK: hourTimestamp, prices: prices, })
  await dynamodb.put({ PK: dailyPeggedPrices, SK: dayTimestamp, prices: prices, })

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