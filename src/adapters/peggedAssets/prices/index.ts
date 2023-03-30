import { PriceSource } from "../../../peggedData/types";
const axios = require("axios");
import fetch from "node-fetch";
import { executeAndIgnoreErrors } from "../../../peggedAssets/storePeggedAssets/errorDb";
import { getCurrentUnixTimestamp } from "../../../utils/date";

const PRICES_API = "https://coins.llama.fi/prices";

export type GetCoingeckoLog = () => Promise<any>;

const locks = [] as ((value: unknown) => void)[];
function getCoingeckoLock() {
  return new Promise((resolve) => {
    locks.push(resolve);
  });
}
function releaseCoingeckoLock() {
  const firstLock = locks.shift();
  if (firstLock !== undefined) {
    firstLock(null);
  }
}

setInterval(() => {
  releaseCoingeckoLock();
}, 7000);

function storePriceError(tokenID: string) {
  executeAndIgnoreErrors("INSERT INTO `errors` VALUES (?, ?, ?)", [
    getCurrentUnixTimestamp(),
    `prices-${tokenID}`,
    `Token has pricing method but it failed.`,
  ]);
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
          storePriceError(token);
          return null;
        }
      } catch (e) {
        console.error(token, e);
        continue;
      }
    }
    console.error(`Could not get DefiLlama price for token ${token}`);
    storePriceError(token);
    return null;
  }
  if (priceSource === "coingecko") {
    // only use as last resort
    for (let i = 0; i < 3; i++) {
      try {
        await getCoingeckoLock();
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`
        );
        const price = res?.data?.[token]?.usd;
        if (price) {
          return price;
        } else {
          console.error(`Could not get Coingecko price for token ${token}`);
          storePriceError(token);
          return null;
        }
      } catch (e) {
        console.error(token, e);
        continue;
      }
    }
    console.error(`Could not get Coingecko price for token ${token}`);
    storePriceError(token);
    return null;
  }
  console.error(
    `no priceSource method given or failed to get price for ${token}`
  );
  return null;
}
