const axios = require("axios");

export async function craftRatesResponse() {
  const rates = await (
    await axios.get(
      `https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/rates/2mo`
    )
  )?.data;

  return rates;
}
