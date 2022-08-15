const sdk = require("@defillama/sdk");
import { Chain } from "@defillama/sdk/build/general";
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import BigNumber from "bignumber.js";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  fantom: {
    issued: ["0xad84341756bf337f5a0164515b1f6f993d194e1f"],
    unreleased: [
      // the fUSD situation is not very transparent. the following 2 are the largest holders of fUSD.
      // some discussion on the 0x431e8 wallet can be found - https://twitter.com/bantg/status/1453322161540718594
      "0x431e81e5dfb5a24541b5ff8762bdef3f32f96354", // alleged fantom foundation EOA, could be Andre Cronje or yearn x abracadra
      "0x9c8aef3a8792094aede3cd67f52296e21c801b81", // could be foundation gnosis safe. rather inactive
    ],
  },
};

async function chainMinted(chain: Chain, decimals: number) {
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
        new BigNumber(totalSupply).div(10 ** decimals).toNumber()
      );
    }
    return balances;
  };
}

async function chainUnreleased(
  chain: Chain,
  decimals: number,
  owners: string[]
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      for (let owner of owners) {
        const reserve = (
          await sdk.api.erc20.balanceOf({
            target: issued,
            owner: owner,
            block: _chainBlocks?.[chain],
            chain: chain,
          })
        ).output;
        sumSingleBalance(
          balances,
          "peggedUSD",
          new BigNumber(reserve).div(10 ** decimals).toNumber()
        );
      }
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  fantom: {
    minted: chainMinted("fantom", 18),
    unreleased: chainUnreleased("fantom", 18, chainContracts.fantom.unreleased),
  },
};

export default adapter;
