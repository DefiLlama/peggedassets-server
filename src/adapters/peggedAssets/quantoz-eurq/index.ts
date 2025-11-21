import { sumSingleBalance } from "../helper/generalUtil";
import { addChainExports } from "../helper/getSupply";
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
          "https://mainnet-idx.algonode.cloud/v2/assets/2768422954"
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
        (asset: any) => asset["asset-id"] === 2768422954
    );
    const reserves = reserveAccount[0].amount;

    const balance = (supply - reserves) / 10 ** 6;

    sumSingleBalance(balances, "peggedEUR", balance, "issued", false);
    return balances;
  };
}

async function rippleMinted() {
  return async function () {
    const balances = {} as Balances;

    const NODE_URL = "https://xrplcluster.com";

    // Get the EURQ token info from config
    const eurqToken = chainContracts.ripple.issued[0];// "4555525100000000000000000000000000000000.rDk1xiArDMjDqnrR2yWypwQAKg4mKnQYvs"
    const [currencyCode, issuerAddress] = eurqToken.split('.');

    const payload = {
      method: "gateway_balances",
      params: [
        {
          account: issuerAddress,
          ledger_index: "validated",
        },
      ],
    };

    const res = await retry(async (_bail: any) => axios.post(NODE_URL, payload));

    if (res.data.result && res.data.result.obligations && res.data.result.obligations[currencyCode]) {
      const supplyStr = res.data.result.obligations[currencyCode];
      const supply = parseFloat(supplyStr);

      sumSingleBalance(balances, "peggedEUR", supply, "issued", false);
    }

    return balances;
  };
}

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x8df723295214ea6f21026eeeb4382d475f146f9f"],
  },
  polygon: {
    issued: ["0xd571edb2ef29df10fcd6200fd6d0ed2389983db3"],
  },
  ripple: {
    issued: ["4555525100000000000000000000000000000000.rDk1xiArDMjDqnrR2yWypwQAKg4mKnQYvs"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined, { pegType: "peggedEUR" }),
  algorand: {
    minted: algorandMinted(),
  },
  ripple: {
    minted: rippleMinted(),
  },
};

export default adapter;