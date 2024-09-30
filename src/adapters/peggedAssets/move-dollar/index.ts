const sdk = require("@defillama/sdk");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

async function modCirculating() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const issuance = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://app.thala.fi/api/coingecko-integration/mod-circulating-supply"
        )
    );
    const tokens = issuance.data.result;
    const balance = Number(tokens);
    return { peggedUSD: balance };
  };
}

const adapter: PeggedIssuanceAdapter = {
  aptos: {
    minted: modCirculating(),
  },
};

export default adapter;	