import dynamodb from "./utils/shared/dynamodb";
import { wrapScheduledLambda } from "./utils/shared/wrap";
import { store } from "./utils/s3";
import fetch from "node-fetch";
import { historicalRates } from "./peggedAssets/utils/getLastRecord";
import { getTimestampAtStartOfDay } from "./utils/date";
import { executeAndIgnoreErrors } from "./peggedAssets/storePeggedAssets/errorDb";
import { getCurrentUnixTimestamp } from "./utils/date";
import { getHistoricalValues } from "./utils/shared/dynamodb";
import { secondsInWeek } from "./utils/date";

const handler = async (_event: any) => {
  // store daily db entry
  for (let i = 0; i < 5; i++) {
    try {
      const currentDate = new Date(Date.now());
      const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
      const day = ("0" + currentDate.getUTCDate()).slice(-2);
      const currentDateFormatted = `${currentDate.getUTCFullYear()}-${month}-${day}`;
      const url = `https://openexchangerates.org/api/historical/${currentDateFormatted}.json?app_id=019357e37fe74858b56d5a9c30e89dd1`;
      const response = await fetch(url).then((res) => res.json());
      const timestamp = response.timestamp;
      const date = getTimestampAtStartOfDay(timestamp);
      const rates = response.rates;

      await dynamodb.put({
        PK: historicalRates(),
        SK: date,
        rates: rates,
      });
    } catch (e) {
      if (i >= 5) {
        throw e;
      } else {
        console.error(e);
        executeAndIgnoreErrors("INSERT INTO `errors` VALUES (?, ?, ?)", [
          getCurrentUnixTimestamp(),
          "storeRates",
          String(e),
        ]);
        continue;
      }
    }
    return;
  }

  // store daily s3 file
  const historicalPeggedRates = await getHistoricalValues(historicalRates());
  const filteredRates = historicalPeggedRates
    ?.map((item) =>
      typeof item === "object" &&
      item.SK > Date.now() / 1000 - 8 * secondsInWeek
        ? {
            date: item.SK,
            rates: item.rates,
          }
        : { rates: undefined }
    )
    .filter((item) => item.rates !== undefined);
  const filename = `rates/2mo`;
  await store(filename, JSON.stringify(filteredRates), true, false);
};

export default wrapScheduledLambda(handler);
