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
  manta: {
    issued: ["0xcd91716ef98798A85E79048B78287B13ae6b99b2"],
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
  manta: {
    minted: chainMinted("manta", 18),
    unreleased: async () => ({}),
  },
};

export default adapter;
