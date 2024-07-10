import fetch from "node-fetch";

let prices: any

export async function fetchPrices(peggedPrices?: any): Promise<any> {
  if (prices) return prices
  if (peggedPrices) {
    prices = peggedPrices
  } else {
    prices = await fetch(
      "https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/peggedPrices.json"
    )
      .then((res: any) => res.json())
      .catch(() => {
        console.error("Could not fetch pegged prices");
      });
  }
  return prices ?? {}
}