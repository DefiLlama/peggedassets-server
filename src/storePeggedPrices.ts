import dynamodb from "./utils/shared/dynamodb";
import peggedAssets from "./peggedData/peggedData";
import getCurrentPeggedPrice from "./adapters/peggedAssets/prices";
import { wrapScheduledLambda } from "./utils/shared/wrap";
import { store } from "./utils/s3";
import getTVLOfRecordClosestToTimestamp from "./utils/shared/getRecordClosestToTimestamp";
import { getDay, getTimestampAtStartOfDay, secondsInDay } from "./utils/date";
import {
  dailyPeggedPrices,
  hourlyPeggedPrices,
} from "./peggedAssets/utils/getLastRecord";
import { bridgeInfo } from "./peggedData/bridgeData";
import { getCurrentUnixTimestamp } from "./utils/date";
import * as sdk from '@defillama/sdk'

type Prices = {
  [coinGeckoId: string]: number | null;
};

const handler = async (_event: any) => {
  // store hourly prices in db
  let prices = {} as Prices;
  const timestamp = getCurrentUnixTimestamp();
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
        PK: hourlyPeggedPrices,
        SK: timestamp,
        prices: prices,
      });
      break;
    } catch (e) {
      if (i >= 5) {
        await sdk.elastic.addErrorLog({
          error: e as any,
          metadata: {
            application: "pegged-assets",
            function: "storePeggedPrices",
          }
        })
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
    dailyPeggedPrices,
    timestamp,
    secondsInDay * 1.5
  );
  if (getDay(closestDailyRecord?.SK) !== getDay(timestamp)) {
    // First write of the day
    await dynamodb.put({
      PK: dailyPeggedPrices,
      SK: getTimestampAtStartOfDay(timestamp),
      prices: prices,
    });
  }

  // store price history in s3
  let historicalPrices: any[] = [];
  let lastEval = -1;
  do {
    const res = await dynamodb.query({
      ExpressionAttributeValues: {
        ":pk": dailyPeggedPrices,
        ":sk": lastEval,
      },
      KeyConditionExpression: "PK = :pk AND SK > :sk",
    });
    lastEval = res.LastEvaluatedKey?.SK;
    if (res.Items !== undefined) {
      historicalPrices = historicalPrices.concat(res.Items);
    }
  } while (lastEval !== undefined);
  if (historicalPrices === undefined || historicalPrices.length < 1) {
  } else {
    const filenameFull = `prices/full`;
    await store(filenameFull, JSON.stringify(historicalPrices), true, false);
  }
};

export default wrapScheduledLambda(handler);
