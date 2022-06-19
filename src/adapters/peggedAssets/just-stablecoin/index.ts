const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import {
  getTokenBalance as tronGetTokenBalance,
  getTotalSupply as tronGetTotalSupply, // NOTE THIS DEPENDENCY
} from "../helper/tron";
const axios = require("axios");
const retry = require("async-retry");

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};
// any bridgeOnETH contracts are not used and are just for info purposes
const chainContracts: ChainContracts = {
  tron: {
    issued: ["TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT"],
    reserves: [
      "TL5x9MtSnDy537FXKx53yAaHRRNdg9TkkA",
      "TKcEU8ekq2ZoFzLSGFYCUY6aocJBX9X31b",
      "TQcia2H2TU3WrFk9sKtdK9qCfkW8XirfPQ",
      "TQwh1ZDBdqMKDtGWEeDdrRUUbtgaVL1Se2",
    ],
  },
};

async function tronMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await tronGetTotalSupply(
      chainContracts["tron"].issued[0]
    );
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);

    for (let owner of chainContracts.tron.reserves) {
      const reserveBalance = await tronGetTokenBalance(
        chainContracts["tron"].issued[0],
        owner
      );
      sumSingleBalance(balances, "peggedUSD", -reserveBalance, "issued", false);
    }

    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  tron: {
    minted: tronMinted(),
    unreleased: async () => ({}),
  },
};

export default adapter;
