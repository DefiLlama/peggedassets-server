import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
const axios = require("axios");

// BYC amounts in the Circuit API are expressed in BYC mojos (1 BYC = 1000 mojos)
const MOJOS_PER_BYC = 1000;
const CIRCUIT_API = "https://api.circuitdao.com";

async function bycMinted() {
  return async function (
    api: any,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const { data } = await axios.get(`${CIRCUIT_API}/protocol/stats`);
    const stats = data?.stats;
    if (!Array.isArray(stats) || stats.length === 0) {
      throw new Error("No stats data available from Circuit API");
    }
    // api is a ChainApi object; fall back to current time if timestamp is unavailable.
    const timestamp: number = api?.timestamp ?? Math.round(Date.now() / 1000);
    // Use the latest sample at or before the requested timestamp.
    // If the asset had not launched yet, report zero.
    const entry = stats.reduce(
      (latest: any, current: any) =>
        current.timestamp <= timestamp && current.timestamp > latest.timestamp
          ? current
          : latest,
      { timestamp: -Infinity, byc_in_circulation: 0 }
    );
    return { peggedUSD: (entry.byc_in_circulation ?? 0) / MOJOS_PER_BYC };
  };
}

const adapter: PeggedIssuanceAdapter = {
  chia: {
    minted: bycMinted(),
    unreleased: async () => ({}),
  },
};

export default adapter;
