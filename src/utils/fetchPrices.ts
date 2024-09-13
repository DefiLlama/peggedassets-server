import axios from "axios";

let prices: any

export async function fetchPrices(peggedPrices?: any): Promise<any> {
  if (prices) return prices
  if (peggedPrices) {
    prices = peggedPrices
  } else {
    prices = await axios(
      "https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/peggedPrices.json"
    )
      .then((res: any) => res.data)
      .catch(() => {
        console.error("Could not fetch pegged prices");
      });
  }
  return prices ?? {}
}