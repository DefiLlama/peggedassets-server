import { successResponse, wrap, IResponse } from "./utils/shared";
import { getHistoricalValues } from "./utils/shared/dynamodb";
import { historicalRates } from "./peggedAssets/utils/getLastRecord";
import { secondsInWeek } from "./utils/date";

export async function craftRatesResponse() {
  const historicalPeggedPrices = await getHistoricalValues(historicalRates());

  let response = historicalPeggedPrices
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

  return response;
}

const handler = async (
  _event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  const chainData = await craftRatesResponse();
  return successResponse(chainData, 10 * 60); // 10 mins cache
};

export default wrap(handler);
