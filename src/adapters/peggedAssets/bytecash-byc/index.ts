import { sumSingleBalance } from "../helper/generalUtil";
import {
  Balances,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

// BYC amounts in the Circuit API are expressed in BYC mojos (1 BYC = 1000 mojos)
const MOJOS_PER_BYC = 1000;
const CIRCUIT_API = "https://api.circuitdao.com";

async function bycMinted() {
  return async function (api: any) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(`${CIRCUIT_API}/protocol/stats`)
    );
    const stats = res.data?.stats;
    if (!Array.isArray(stats) || stats.length === 0) {
      throw new Error("No stats data available from Circuit API");
    }
    // Use the latest sample at or before the requested timestamp.
    // If the asset had not launched yet, report zero.
    const timestamp: number = api?.timestamp ?? Math.round(Date.now() / 1000);
    const entry = stats.reduce(
      (latest: any, current: any) =>
        current.timestamp <= timestamp && current.timestamp > latest.timestamp
          ? current
          : latest,
      { timestamp: -Infinity, byc_in_circulation: 0 }
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      (entry.byc_in_circulation ?? 0) / MOJOS_PER_BYC,
      "issued",
      false
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  chia: {
    minted: bycMinted(),
  },
};

export default adapter;
