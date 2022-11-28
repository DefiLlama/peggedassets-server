import dynamodb from "./utils/shared/dynamodb";
import peggedAssets from "./peggedData/peggedData";
import getCurrentPeggedPrice from "./adapters/peggedAssets/prices";
import { getCurrentBlocks } from "./peggedAssets/storePeggedAssets/blocks";
import { wrapScheduledLambda } from "./utils/shared/wrap";
import { store } from "./utils/s3";
import getTVLOfRecordClosestToTimestamp from "./utils/shared/getRecordClosestToTimestamp";
import { getDay, getTimestampAtStartOfDay, secondsInDay } from "./utils/date";
import {
  dailyPeggedPrices,
  hourlyPeggedPrices,
} from "./peggedAssets/utils/getLastRecord";
import { bridgeInfo } from "./peggedData/bridgeData";
import { executeAndIgnoreErrors } from "./peggedAssets/storePeggedAssets/errorDb";
import { getCurrentUnixTimestamp } from "./utils/date";

type Prices = {
  [coinGeckoId: string]: number | null;
};

const timeout = (prom: any, time: number) =>
  Promise.race([prom, new Promise((_r, rej) => setTimeout(rej, time))]).catch(
    async (err) => {
      console.error(`Could not get blocks`, err);
      await executeAndIgnoreErrors("INSERT INTO `errors` VALUES (?, ?, ?)", [
        getCurrentUnixTimestamp(),
        "prices-getBlocks",
        String(err),
      ]);
    }
  );

const handler = async (_event: any) => {
  // store hourly prices in db
  let prices = {} as Prices;
  const { timestamp } = await timeout(getCurrentBlocks(), 60000);
  for (let i = 0; i < 5; i++) {
    try {
      let pricePromises = peggedAssets.map(async (pegged) => {
        const price = await getCurrentPeggedPrice(
          pegged.gecko_id,
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
      await dynamodb.put({
        PK: hourlyPeggedPrices(),
        SK: timestamp,
        prices: prices,
      });
      break;
    } catch (e) {
      if (i >= 5) {
        await executeAndIgnoreErrors("INSERT INTO `errors` VALUES (?, ?, ?)", [
          getCurrentUnixTimestamp(),
          "prices-storePeggedPrices",
          String(e),
        ]);
        throw e;
      } else {
        console.error(e);
        continue;
      }
    }
  }

  // store bridge info (name, links) in s3
  await store("bridgeInfo.json", JSON.stringify(bridgeInfo));

  // store daily prices in db
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

  // store price history in s3
  const historicalPriceItems = await dynamodb.query({
    ExpressionAttributeValues: {
      ":pk": `dailyPeggedPrices`,
    },
    KeyConditionExpression: "PK = :pk",
  });
  if (
    historicalPriceItems.Items === undefined ||
    historicalPriceItems.Items.length < 1
  ) {
  } else {
    const historicalPrices = historicalPriceItems.Items;
    const filenameFull = `prices/full`;
    await store(filenameFull, JSON.stringify(historicalPrices), true, false);
  }
};

export default wrapScheduledLambda(handler);
