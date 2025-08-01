const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";
import {
  getTokenBalance as tronGetTokenBalance,
  getTotalSupply as tronGetTotalSupply, // NOTE THIS DEPENDENCY
} from "../helper/tron";

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
  },
};

export default adapter;
