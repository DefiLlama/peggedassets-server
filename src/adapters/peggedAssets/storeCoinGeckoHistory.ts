import { DAY, getTimestampAtStartOfDayUTC, getDay } from "../../utils/date";
import dynamodb from "../../utils/shared/dynamodb";
import fetch from "node-fetch";
import { PeggedAssetIssuance } from "../../types";
import {
  hourlyPeggedBalances,
  dailyPeggedBalances,
} from "../../peggedAssets/utils/getLastRecord";
import peggedAssets from "../../peggedData/peggedData";

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

const storeAtTimestampLoop = (
  index: number,
  startTimestamp: number,
  timestamp: number
): void => {
  const peggedAsset = peggedAssets[index].gecko_id;
  const id = peggedAssets[index].id;

  let peggedBalances = {} as PeggedAssetIssuance;
  peggedBalances.totalCirculating = {};
  peggedBalances.totalCirculating.unreleased = { peggedUSD: 0 };
  let date = new Date(timestamp * 1000);

  let url = `https://api.coingecko.com/api/v3/coins/${peggedAsset}/history?date=`;
  let dateFormatted = `${date.getUTCDate()}-${
    date.getUTCMonth() + 1
  }-${date.getUTCFullYear()}`;

  makeCoingeckoCall(url + dateFormatted, 4, getCoingeckoLock).then((res) => {
    if (startTimestamp < timestamp) {
      const mcap = res.market_data.market_cap.usd;
      if (typeof mcap !== "number") {
        throw new Error(
          `mcap at timestamp ${timestamp} is NaN. Instead it is ${typeof mcap}.`
        );
      }
      const circulating = { peggedUSD: mcap };
      peggedBalances.totalCirculating.circulating = circulating;

      const hourlyPK = dailyPeggedBalances(id);
      dynamodb.put({
        PK: hourlyPK,
        SK: timestamp,
        ...peggedBalances,
      });
      console.log(timestamp);
      storeAtTimestampLoop(index, startTimestamp, timestamp - DAY);
    } else {
      process.exit(0);
    }
  });
};

const storeMarketCapHistory = (
  index: number,
  startTimestamp: number,
  endTimestamp: number
) => {
  let timestampDay = getTimestampAtStartOfDayUTC(endTimestamp);
  storeAtTimestampLoop(index, startTimestamp, timestampDay);
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

// npx ts-node storeCoinGeckoHistory index#

const peggedAssetIndex = Number(process.argv[2]);
const startTimestamp = 1636588800; // I'd rather just fill it in here for now.
const endTimestamp = 1652227200;

storeMarketCapHistory(peggedAssetIndex, startTimestamp, endTimestamp);
