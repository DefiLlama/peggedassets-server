import { successResponse, wrap, IResponse } from "./utils/shared";
const axios = require("axios");

export async function craftRatesResponse() {
  const rates = await (
    await axios.get(
      `https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/rates/2mo`
    )
  )?.data;

  return rates;
}

const handler = async (
  _event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  const chainData = await craftRatesResponse();
  return successResponse(chainData, 10 * 60); // 10 mins cache
};

export default wrap(handler);
