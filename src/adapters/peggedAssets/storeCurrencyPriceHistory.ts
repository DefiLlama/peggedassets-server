import fetch from "node-fetch";
import fs from "fs";
import { getTimestampAtStartOfDay } from "../../utils/date";

export type GetCoingeckoLog = () => Promise<any>;

function fetchJson(url: string) {
  return fetch(url).then((res) => res.json());
}

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
// Rate limit is 50 calls/min for coingecko's API
// So we'll release one every 1.2 seconds to match it
setInterval(() => {
  releaseCoingeckoLock();
}, 2000);
const maxCoingeckoRetries = 5;

const storePriceHistory = async (timestamp: number) => {
  let result = {} as any;
  // 1596254400
  while (timestamp > 1596254400) {
    timestamp -= 86400;

    let date = new Date(timestamp * 1000);

    const month = ("0" + (date.getMonth() + 1)).slice(-2);

    let dateFormatted = `${date.getUTCFullYear()}-${month}-${date.getUTCDate()}`;
    console.log(dateFormatted);

    let url = `https://openexchangerates.org/api/historical/${dateFormatted}.json?app_id=292b4223032e4b719b10c38f95fb1c90`;
    const res = await makeCoingeckoCall(url, 4, getCoingeckoLock);
    const time = getTimestampAtStartOfDay(res.timestamp);
    const rates = res.rates;

    result[time] = rates;
  }
  fs.writeFile("historicalRates.txt", JSON.stringify(result), function (err) {
    if (err) {
      console.log(err);
    }
  });
  console.log("done");
};

export async function makeCoingeckoCall(
  url: string,
  coingeckoMaxRetries: number,
  getCoingeckoLock: GetCoingeckoLog
) {
  for (let j = 0; j < coingeckoMaxRetries; j++) {
    try {
      await getCoingeckoLock();
      const values = await fetchJson(url);
      return values;
    } catch (e) {
      if (j >= coingeckoMaxRetries - 1) {
        throw e;
      }
    }
  }
}

const timestamp = 1657584000; // I'd rather just fill it in here for now.

storePriceHistory(timestamp);
