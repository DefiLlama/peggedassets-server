const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
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
  ethereum: {
    issued: ["0x15f74458aE0bFdAA1a96CA1aa779D715Cc1Eefe4"],
  },
  arbitrum: {
    issued: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
  },
  optimism: {
    issued: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
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
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
  },
  arbitrum: {
    minted: chainMinted("arbitrum", 18),
    unreleased: async () => ({}),
  },
  optimism: {
    minted: chainMinted("optimism", 18),
    unreleased: async () => ({}),
  }
};

export default adapter;
