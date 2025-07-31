// GMO ZUSD
// Stellar param from GMO API

const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  Balances,
  ChainBlocks,
  ChainContracts,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xc56c2b7e71b54d38aab6d52e94a04cbfa8f604fa"],
  },
  optimism: {
    bridgedFromETH: ["0x6e4cc0ab2b4d2edafa6723cfa1582229f1dd1be1"],
  },
  arbitrum: {
    bridgedFromETH: ["0x6e4cc0ab2b4d2edafa6723cfa1582229f1dd1be1"],
  },
};

async function gmoAPIChainMinted(chain: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const issuance = await retry(
      async (_bail: any) =>
        await axios.get("https://stablecoin.z.com/token/totalSupply")
    );
    const gyenData = issuance.data.data.filter(
      (obj: any) => obj.symbol === "ZUSD"
    );
    const filteredChainsData = await gyenData[0].chains.filter(
      (obj: any) => obj.chain === chain
    );
    const supply = parseInt(filteredChainsData[0].uiamount ?? 0);
    sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    return balances;
  };
}

import { addChainExports } from "../helper/getSupply";
const evmAdapters = addChainExports(chainContracts, undefined, {decimals: 6});

const adapter: PeggedIssuanceAdapter = {
  ...evmAdapters,
  stellar: {
    minted: gmoAPIChainMinted("XLM"),
  },
  solana: {
    minted: gmoAPIChainMinted("SOLANA"),
  },
};

export default adapter;
