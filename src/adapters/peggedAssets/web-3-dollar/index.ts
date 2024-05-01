const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
  ChainContracts,
} from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  ethereum: {
    issued: "0x0d86883FAf4FfD7aEb116390af37746F45b6f378",
  },
  base: {
    bridgedFromETH: "0xEFb97aaF77993922aC4be4Da8Fbc9A2425322677",
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

async function bridgedFromEthereum(
  chain: string,
  decimals: number,
  address: string
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: address,
        block: _chainBlocks?.[chain],
        chain: chain,
      })
    ).output;
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupply / 10 ** decimals,
      address,
      true
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
  },
  base: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedFromEthereum(
      "base",
      18,
      chainContracts.base.bridgedFromETH
    ),
  },
};

export default adapter;
