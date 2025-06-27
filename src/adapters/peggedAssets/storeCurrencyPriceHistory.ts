import fs from "fs";
import { getTimestampAtStartOfDay } from "../../utils/date";
import axios from "axios";

function fetchJson(url: string) {
  return axios(url).then((res) => res.data);
}

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
    const res = await getWithRetries(url, 4);
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

export async function getWithRetries(
  url: string,
  coingeckoMaxRetries: number
) {
  for (let j = 0; j < coingeckoMaxRetries; j++) {
    try {
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
