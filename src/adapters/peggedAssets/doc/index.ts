const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  rsk: {
    issued: ["0xe700691dA7b9851F2F35f8b8182c69c53CcaD9Db"],
  },
  ethereum: {
    bridgedFromRSK: ["0x69f6d4d4813f8e2e618dae7572e04b6d5329e207"],
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedUSD",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  rsk: {
    minted: chainMinted("rsk", 18),
    unreleased: async () => ({}),
  },
  ethereum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    rsk: bridgedSupply("ethereum", 18, chainContracts.ethereum.bridgedFromRSK),
  },
};

export default adapter;
