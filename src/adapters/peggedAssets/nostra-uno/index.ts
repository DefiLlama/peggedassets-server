const sdk = require("@defillama/sdk");
import { call } from "../helper/starknet";
import { sumSingleBalance } from "../helper/generalUtil";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,  ChainContracts,
} from "../peggedAsset.type";
import { starknetTotalSupplyAbi, starknetBalanceOfAbi } from "./abi";

export const chainContracts: ChainContracts = {
  starknet: {
    issued: [
      "0x719b5092403233201aa822ce928bd4b551d0cdb071a724edd7dc5e5f57b7f34",
    ],
    unreleased: [
      "0x07daadaa043b22429020efb9ac16bcc5f6a9b6ed3305de48e65a0ad5dcb76759",
    ],
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
      let totalSupply;
      if (chain === "starknet") {
        totalSupply = await call(
          {
            target: issued,
            abi: starknetTotalSupplyAbi,
            params: [],
          },
          _chainBlocks?.[chain]
        );
      } else {
        totalSupply = (
          await sdk.api.abi.call({
            abi: "erc20:totalSupply",
            target: issued,
            block: _chainBlocks?.[chain],
            chain: chain,
          })
        ).output;
      }

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

async function chainUnreleased(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      let unreleased;
      if (chain === "starknet") {
        unreleased = (
          await Promise.all(
            chainContracts[chain].unreleased.map(async (unreleased) => {
              return await call({
                target: issued,
                abi: starknetBalanceOfAbi,
                params: [unreleased],
              });
            })
          )
        ).reduce((acc, balance) => {
          return acc.add(balance);
        });
      } else {
        unreleased = 0;
      }

      sumSingleBalance(
        balances,
        "peggedUSD",
        unreleased / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  starknet: {
    minted: chainMinted("starknet", 18),
    unreleased: chainUnreleased("starknet", 18),
  },
};

export default adapter;
