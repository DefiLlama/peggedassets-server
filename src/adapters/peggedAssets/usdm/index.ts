const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    issued: string;
    unreleased: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: "0x59d9356e565ab3a36dd77763fc0d87feaf85508c",
    unreleased: [],
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts[chain].issued,
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
    for (let unreleased of chainContracts[chain].unreleased) {
      const unreleasedBalance = (
        await sdk.api.abi.call({
          abi: "erc20:balanceOf",
          target: chainContracts[chain].issued,
          params: [unreleased],
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedUSD",
        unreleasedBalance / 10 ** decimals,
        "unreleased",
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
  };
  
export default adapter;