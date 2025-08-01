const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
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
          "https://mainnet-idx.algonode.cloud/v2/assets/2768603795"
        )
    );
    const supply = supplyRes.data.asset.params.total;

    const reserveRes = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://mainnet-idx.algonode.cloud/v2/accounts/3PJ3E3D6XI7YWMJAUX6WDCHWZ4GC2WHTAQIWJBYVJ326LM2I6NSMSLGCDY"
        )
    );

    const reserveAccount = reserveRes.data.account.assets.filter(
        (asset: any) => asset["asset-id"] === 2768603795
    );
    const reserves = reserveAccount[0].amount;

    const balance = (supply - reserves) / 10 ** 6;

    sumSingleBalance(balances, "peggedUSD", balance, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  algorand: {
    minted: algorandMinted(),
  },
};

export default adapter;
