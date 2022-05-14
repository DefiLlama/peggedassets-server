const sdk = require("@defillama/sdk");
import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts = {
  ethereum: {
    issued: "0x853d955acef822db058eb8505911ed77f175b99e",
  },
  bsc: {
    bridgedFromETH: "0x90c97f71e18723b0cf0dfa30ee176ab653e89f40",
  },
};

async function ethereumMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.ethereum.issued,
        block: _ethBlock,
        chain: "ethereum",
      })
    ).output;
    return { peggedUSD: totalSupply / 10 ** 18 };
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
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: address,
        block: _chainBlocks[chain],
        chain: chain,
      })
    ).output;
    return { peggedUSD: totalSupply / 10 ** decimals };
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: ethereumMinted(),
    unreleased: async () => ({}),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedFromEthereum("bsc", 18, chainContracts.bsc.bridgedFromETH),
  },
};

export default adapter;
