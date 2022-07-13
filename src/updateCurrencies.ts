import { successResponse, wrap, IResponse } from "./utils/shared";
import fetch from "node-fetch";
import { store } from "./utils/s3";

export async function updateCurrencies() {
  const currencies = await fetch(
    "https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/currencies.json"
  )
    .then((res: any) => res.json())
    .catch(() => {
      console.error("Could not fetch currencies");
    });

  const currentDate = new Date(Date.now() * 1000);
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  const currentDateFormatted = `${currentDate.getUTCFullYear()}-${month}-${currentDate.getUTCDate()}`;
  const url = `https://openexchangerates.org/api/historical/${currentDateFormatted}.json?app_id=292b4223032e4b719b10c38f95fb1c90`;

  const response = await fetch(url).then((res) => res.json());
  const date = response.timestamp;
  const rates = response.rates;

  if (!currencies[date]) {
    currencies[date] = rates;
  }
  await store(`currencies.json`, JSON.stringify(currencies), true, false);

  return;
}

const handler = async (
  _event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  await updateCurrencies();
  return successResponse({}, 10 * 60); // 10 mins cache
};

export default wrap(handler);
