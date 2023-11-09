import { sumSingleBalance } from "../helper/generalUtil";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

// There appears to be no explorer API that can give total supply; this endpoint was provided by dev.
async function osmosisMinted(decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://lcd.osmosis.zone/osmosis/superfluid/v1beta1/supply?denom=factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt"
        )
    );
    const cdtInfo = res?.data?.amount;
    const supply = cdtInfo?.amount / 10 ** decimals;
    sumSingleBalance(balances, "peggedVAR", supply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  osmosis: {
    minted: osmosisMinted(6),
    unreleased: async () => ({}),
  },
};

export default adapter;
