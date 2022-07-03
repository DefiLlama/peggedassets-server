import { successResponse, wrap, IResponse } from "./utils/shared";
import { getHistoricalValues } from "./utils/shared/dynamodb";
import { dailyPeggedPrices } from "./peggedAssets/utils/getLastRecord";

export async function craftStablecoinPricesResponse() {
  const historicalPeggedPrices = await getHistoricalValues(dailyPeggedPrices());
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
  return successResponse(chainData, 10 * 60); // 10 mins cache
};

export default wrap(handler);
