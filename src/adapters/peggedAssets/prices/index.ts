import { PriceSource } from "../../../peggedData/types";
const axios = require("axios");
import fetch from "node-fetch";

const PRICES_API = "https://coins.llama.fi/prices";

export type GetCoingeckoLog = () => Promise<any>;


export async function getPrices(assets: any[]) {
  const mapping = {} as any;
  function getTokenAddress(token: any) {
    let id = token.address
    if (id) 
      return id.startsWith("0x") ? 'ethereum:'+id : id; 
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
    const res = await fetch(PRICES_API + "/current/" + chunk.join(",")).then(
      (r) => r.json() as any
    );
    Object.entries(res.coins).map(([key, value]: [any, any]) => {
      finalRes[mapping[key]] = value.price;
    })
  }
  return finalRes
}

export default async function getCurrentPeggedPrice(
  token: string,
  priceSource: PriceSource
): Promise<number | null> {
  if (priceSource === "defillama") {
    for (let i = 0; i < 5; i++) {
      try {
        const key = "coingecko:" + token;
        const res = await fetch(PRICES_API + "/current/" + key).then(
          (r) => r.json() as any
        );
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
  if (priceSource === "coingecko") {
    // only use as last resort
    for (let i = 0; i < 3; i++) {
      try {
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`
        );
        const price = res?.data?.[token]?.usd;
        if (price) {
          return price;
        } else {
          console.error(`Could not get Coingecko price for token ${token}`);
          return null;
        }
      } catch (e) {
        console.error(token, e);
        continue;
      }
    }
    console.error(`Could not get Coingecko price for token ${token}`);
    return null;
  }
  console.error(
    `no priceSource method given or failed to get price for ${token}`
  );
  return null;
}
