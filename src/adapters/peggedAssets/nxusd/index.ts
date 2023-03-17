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
  avax: {
    issued: ["0xf14f4ce569cb3679e99d5059909e23b07bd2f387"],
    unreleased: ["0x0b1f9c2211f77ec3fa2719671c5646cf6e59b775"]
  },
  polygon: {
    issued: ["0xf955a6694C6F5629f5Ecd514094B3bd450b59000"],
    unreleased: ["0x7195d3A344106b877F8D5f62CA570Fd25D43D180"]
  }
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
      sumSingleBalance(balances, "peggedUSD", totalSupply / 10 ** decimals, "issued", false);
    }
    return balances;
  };
}

async function chainUnreleased(chain: string, decimals: number, owner: string) {
    return async function (
      _timestamp: number,
      _ethBlock: number,
      _chainBlocks: ChainBlocks
    ) {
      let balances = {} as Balances;
      for (let issued of chainContracts[chain].issued) {
        const reserve = (
          await sdk.api.erc20.balanceOf({
            target: issued,
            owner: owner,
            block: _chainBlocks?.[chain],
            chain: chain,
          })
        ).output;
        sumSingleBalance(balances, "peggedUSD", reserve / 10 ** decimals);
      }
      return balances;
    };
  }

const adapter: PeggedIssuanceAdapter = {
  avalanche: {
    minted: chainMinted("avax", 18),
    unreleased: chainUnreleased(
        "avax",
        18,
        chainContracts.avax.unreleased[0]
      ),
  },
  polygon: {
    minted: chainMinted("polygon", 18),
    unreleased: chainUnreleased(
        "polygon",
        18,
        chainContracts.polygon.unreleased[0]
      ),
  }
};

export default adapter;