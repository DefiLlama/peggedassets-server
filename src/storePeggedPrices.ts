import dynamodb from "./utils/shared/dynamodb";
import peggedAssets from "./peggedData/peggedDataTesting";
import getCurrentPeggedPrice from "./adapters/peggedAssets/prices";
const { getCurrentBlocks } = require("@defillama/sdk/build/computeTVL/blocks");
import { wrapScheduledLambda } from "./utils/shared/wrap";
import { store } from "./utils/s3";
import getTVLOfRecordClosestToTimestamp from "./utils/shared/getRecordClosestToTimestamp";
import {
  getDay,
  getTimestampAtStartOfDay,
  secondsInDay,
  secondsInHour,
} from "./utils/date";
import {
  dailyPeggedPrices,
  hourlyPeggedPrices,
} from "./peggedAssets/utils/getLastRecord";
import { bridgeInfo } from "./peggedData/bridgeData";

type Prices = {
  [coinGeckoId: string]: number | null;
};

const timeout = (prom: any, time: number) =>
  Promise.race([prom, new Promise((_r, rej) => setTimeout(rej, time))]).catch(
    (err) => {
      console.error(`Could not get blocks`, err);
    }
  );

const handler = async (_event: any) => {
  let prices = {} as Prices;
  const { timestamp, chainBlocks } = await timeout(getCurrentBlocks(), 60000);
  for (let i = 0; i < 5; i++) {
    try {
      let pricePromises = peggedAssets.map(async (pegged) => {
        const price = await getCurrentPeggedPrice(
          pegged.gecko_id,
          chainBlocks,
          pegged.priceSource
        );
        if (typeof price !== "number") {
          if (price) {
            throw new Error(`price is NaN. Instead it is ${typeof price}`);
          }
        }
        prices[pegged.gecko_id] = price;
      });
      await Promise.all(pricePromises);
      await store("peggedPrices.json", JSON.stringify(prices));
      const recordWithinLastAlmostHour = await getTVLOfRecordClosestToTimestamp(
        hourlyPeggedPrices(),
        timestamp,
        (secondsInHour * 9) / 10
      );
      if (!recordWithinLastAlmostHour.SK) {
        await dynamodb.put({
          PK: hourlyPeggedPrices(),
          SK: timestamp,
          prices: prices,
        });
      }
    } catch (e) {
      if (i >= 5) {
        throw e;
      } else {
        console.error(e);
        continue;
      }
    }
  }

  await store("bridgeInfo.json", JSON.stringify(bridgeInfo));

  const closestDailyRecord = await getTVLOfRecordClosestToTimestamp(
    dailyPeggedPrices(),
    timestamp,
    secondsInDay * 1.5
  );
  if (getDay(closestDailyRecord?.SK) !== getDay(timestamp)) {
    // First write of the day
    await dynamodb.put({
      PK: dailyPeggedPrices(),
      SK: getTimestampAtStartOfDay(timestamp),
      prices: prices,
    });
  }
};

export default wrapScheduledLambda(handler);
