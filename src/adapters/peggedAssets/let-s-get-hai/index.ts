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
  optimism: {
    issued: ["0x10398abc267496e49106b07dd6be13364d10dc71"],
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
      sumSingleBalance(balances, "peggedUSD", totalSupply / 10 ** decimals);
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
    optimism: {
    minted: chainMinted("optimism", 18),
    unreleased: async () => ({}),
  },
};

export default adapter;