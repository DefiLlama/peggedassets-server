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
    // Find the entry whose timestamp is closest to the requested timestamp.
    // Falls back to the latest entry for future timestamps.
    const entry = stats.reduce((closest: any, current: any) =>
      Math.abs(current.timestamp - timestamp) < Math.abs(closest.timestamp - timestamp)
        ? current
        : closest
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
