const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

async function algorandMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supplyRes = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://mainnet-idx.algonode.cloud/v2/assets/1221682136"
        )
    );
    const supply = supplyRes.data.asset.params.total;

    const reserveRes = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://mainnet-idx.algonode.cloud/v2/accounts/R2LPJRKONXXURMO6F65VHGCXPKAZM4GGDC5KH5VZ2W3ZFIZYQRAQT7GLM4"
        )
    );

    const reserveAccount = reserveRes.data.account.assets.filter(
      (asset: any) => asset["asset-id"] === 1221682136
    );
    const reserves = reserveAccount[0].amount;

    const balance = (supply - reserves) / 10 ** 2;

    sumSingleBalance(balances, "peggedEUR", balance, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  algorand: {
    minted: algorandMinted(),
    unreleased: async () => ({}),
  },
};

export default adapter;
