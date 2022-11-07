const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

async function pusdMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://leaf-api.pando.im/api/cats"
        )
    );
    const ret = res.data
    let sum = 0.0;
    for (let ix = 0; ix < ret.data.collaterals.length; ix++) {
      const collateral = ret.data.collaterals[ix];
      sum += parseFloat(collateral.art) * parseFloat(collateral.rate);
    }
    sumSingleBalance(balances, "peggedUSD", sum, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  mixin: {
    minted: async () => ({}), // pusdMinted(), Pando was hacked, de-listing until API works/reserves verified
    unreleased: async () => ({}),
  },
};

export default adapter;
