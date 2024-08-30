const sdk = require("@defillama/sdk");
import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");
import { addChainExports } from "../helper/getSupply";
import { sumSingleBalance } from '../helper/generalUtil';


async function injectiveBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const issuance = await retry(async (_bail: any) =>
      axios.get("https://injective-nuxt-api.vercel.app/api/tokens")
    );

    const targetDenom = "ibc/93EAE5F9D6C14BFAC8DD1AFDBE95501055A7B22C5D8FA8C986C31D6EFADCA8A9";
    const targetToken = issuance?.data?.supply?.find(
      (token: any) => token.denom === targetDenom
    );

    const circulatingSupply = targetToken ? targetToken.amount / 1e18 : 0;
    let balances = {}
    sumSingleBalance(balances, "peggedUSD", circulatingSupply, "issued", false);
    return balances;
  };
}

async function nobleBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const issuance = await retry(async (_bail: any) =>
      axios.get("https://ondo.finance/api/v1/assets")
    );

    const tokens = issuance?.data?.assets[0].tvlUsd.noble;
    const circulatingSupply = tokens / issuance?.data?.assets[0].priceUsd;

    let balances = {};
    sumSingleBalance(balances, "peggedUSD", circulatingSupply, "issued", false);
    return balances;
  };
}

const chainContracts = {
  ethereum: {
    issued: [
      "0x96F6eF951840721AdBF46Ac996b59E0235CB985C", // USDY
      "0xe86845788d6e3E5C2393ADe1a051AE617D974C09", // USDYc
    ],
  },
  mantle: {
    issued: "0x5bE26527e817998A7206475496fDE1E68957c5A6",
    unreleased: ["0x94FEC56BBEcEaCC71c9e61623ACE9F8e1B1cf473"],
  },
  sui: {
    issued: [
      "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY",
    ],
  },
  solana: {
    issued: ["A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6"],
  },
  aptos: {
    issued: [
      "0xcfea864b32833f157f042618bd845145256b1bf4c0da34a7013b76e42daa53cc",
    ],
  },
  arbitrum: {
    issued: ["0x35e050d3C0eC2d29D269a8EcEa763a183bDF9A9D"]
  },
};

// Use `addChainExports` to generate the final adapter with combined logic
const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
  noble: {
    minted: nobleBridged()
  },
  injective: {
    noble: injectiveBridged(),
  },
};

export default adapter;

