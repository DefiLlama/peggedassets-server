import { successResponse, wrap, IResponse } from "./utils/shared";
import { getHistoricalValues } from "./utils/shared/dynamodb";
import { getLastRecord, dailyPeggedPrices, hourlyPeggedPrices } from "./peggedAssets/utils/getLastRecord";
import { secondsInHour } from "./utils/date";

export async function craftStablecoinPricesResponse() {
  const historicalPeggedPrices = await getHistoricalValues(dailyPeggedPrices());

  const lastPrices = await getLastRecord(hourlyPeggedPrices())

  const lastDailyItem = historicalPeggedPrices[historicalPeggedPrices.length - 1]
  if (lastPrices !== undefined && lastPrices.SK > lastDailyItem.SK && (lastDailyItem.SK + secondsInHour * 25) > lastPrices.SK) {
    lastPrices.SK = lastDailyItem.SK
    historicalPeggedPrices[historicalPeggedPrices.length - 1] = lastPrices
  }

  let response = historicalPeggedPrices
    ?.map((item) =>
      typeof item === "object"
        ? {
            date: item.SK,
            prices: item.prices,
          }
        : { prices: undefined }
    )
    .filter((item) => item.prices !== undefined);

  return response;
}

const handler = async (
  _event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  const chainData = await craftStablecoinPricesResponse();
  return successResponse(chainData, 30 * 60); // 30 mins cache
};

export default wrap(handler);
