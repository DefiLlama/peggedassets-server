const sdk = require("@defillama/sdk");

import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";

const chain = "bsc";

const hydtDecimals = 18;

const hydt = "0x9810512Be701801954449408966c630595D0cD51";

async function bscMinted(chain: string, decimals: number, address: string) {
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
  bsc: {
    minted: bscMinted(chain, hydtDecimals, hydt),
    unreleased: async () => ({}),
  },
};

export default adapter;
