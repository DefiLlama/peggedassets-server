import { PriceSource } from "../../../peggedData/types";
const axios = require("axios");

const PRICES_API = "https://coins.llama.fi/prices";

export async function getPrices(assets: any[]) {
  const mapping = {} as any;
  function getTokenAddress(token: any) {
    if (token.priceSource === "coingecko") {
      return 'coingecko:' + token.gecko_id;
    }
    let id = token.address
    if (id)
      return id.startsWith("0x") ? 'ethereum:' + id : id;
    return 'coingecko:' + token.gecko_id;
  }
  assets.forEach((token) => {
    mapping[getTokenAddress(token)] = token.gecko_id;
  })
  const tokens = Object.keys(mapping)
  const finalRes = {} as any;
  const chunks = []
  const chunkSize = 50
  for (let i = 0; i < tokens.length; i += chunkSize) {
    chunks.push(tokens.slice(i, i + chunkSize))
  }

  for (const chunk of chunks) {
    const { data: res } = await axios(PRICES_API + "/current/" + chunk.join(","))
    Object.entries(res.coins).map(([key, value]: [any, any]) => {
      finalRes[mapping[key]] = value.price;
    })
  }
  finalRes["terrausd"] = 0
  return finalRes
}

export default async function getCurrentPeggedPrice(
  token: string,
  priceSource: PriceSource
): Promise<number | null> {
  if (token === "terrausd") return 0
  if (priceSource === "defillama" || priceSource === "coingecko") {
    for (let i = 0; i < 5; i++) {
      try {
        const key = "coingecko:" + token;
        const { data: res } = await axios(PRICES_API + "/current/" + key)
        const price = res?.coins?.[key]?.price;
        if (price) {
          return price;
        } else {
          console.error(`Could not get DefiLlama price for token ${token}`);
          return null;
        }
      } catch (e) {
        console.error(token, e);
        continue;
      }
    }
    console.error(`Could not get DefiLlama price for token ${token}`);
    return null;
  }
  console.error(
    `no priceSource method given or failed to get price for ${token}`
  );
  return null;
}
