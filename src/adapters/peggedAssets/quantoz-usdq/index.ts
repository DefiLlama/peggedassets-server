const sdk = require("@defillama/sdk");
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

async function rippleMinted() {
  return async function () {
    const balances = {} as Balances;

    const NODE_URL = "https://xrplcluster.com";

    // Get the USDQ token info from config
    const usdqToken = chainContracts.ripple.issued[0];// "5553445100000000000000000000000000000000.rDk1xiArDMjDqnrR2yWypwQAKg4mKnQYvs"
    const [currencyCode, issuerAddress] = usdqToken.split('.');

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

      sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    }

    return balances;
  };
}

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xc83e27f270cce0a3a3a29521173a83f402c1768b"],
  },
  polygon: {
    issued: ["0xb291996477504506bf5f583102b5b5ea5d1e40e0"],
  },
  ripple: {
    issued: ["5553445100000000000000000000000000000000.rDk1xiArDMjDqnrR2yWypwQAKg4mKnQYvs"],
  }
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined),
  algorand: {
    minted: algorandMinted(),
  },
  ripple: {
    minted: rippleMinted(),
  },
};

export default adapter;
