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

const locks = [] as ((value: unknown) => void)[];
function getCoingeckoLock() {
  return new Promise((resolve) => {
    locks.push(resolve);
  });
}

function releaseCoingeckoLock() {
  const firstLock = locks.shift();
  if (firstLock !== undefined) {
    firstLock(null);
  }
}

setInterval(() => {
  releaseCoingeckoLock();
}, 2000);

const chainContracts: ChainContracts = {
  tron: {
    issued: ["TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT"],
    reserves: [
      "TL5x9MtSnDy537FXKx53yAaHRRNdg9TkkA", // 86% of this is held by Tron Foundation.
      "TPyjyZfsYaXStgz2NmAraF1uZcMtkgNan5", // Tron Foundation.
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
      await getCoingeckoLock();
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
