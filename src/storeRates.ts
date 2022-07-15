import dynamodb from "./utils/shared/dynamodb";
import { successResponse, wrap, IResponse } from "./utils/shared";
import fetch from "node-fetch";
import { historicalRates } from "./peggedAssets/utils/getLastRecord";
import { getTimestampAtStartOfDay } from "./utils/date";

export async function storeRates() {
  for (let i = 0; i < 5; i++) {
    try {
      const currentDate = new Date(Date.now());
      const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
      const currentDateFormatted = `${currentDate.getUTCFullYear()}-${month}-${currentDate.getUTCDate()}`;
      const url = `https://openexchangerates.org/api/historical/${currentDateFormatted}.json?app_id=292b4223032e4b719b10c38f95fb1c90`;
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
        continue;
      }
    }
    return;
  }
}

const handler = async (
  _event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  await storeRates();
  return successResponse({}, 10 * 60); // 10 mins cache
};

export default wrap(handler);
