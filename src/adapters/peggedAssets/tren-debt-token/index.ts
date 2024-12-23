const sdk = require("@defillama/sdk");

import {
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
  arbitrum: {
    minted: "0xD4fe6e1e37dfCf35E9EEb54D4cca149d1c10239f", 
    curvePool: "0x2b2e23b7c1b0de9040011b860cc575650d0817f7", 
  },
  ethereum: {
    bridgedFromArbitrum: "0xe9766D6aed0A73255f95ACC1F263156e746B70ba",
  },
};

async function mintedOnArbitrum() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const totalSupply = (
      await sdk.api.erc20.totalSupply({
        target: chainContracts.arbitrum.minted,
        block: _chainBlocks.arbitrum,
        chain: "arbitrum",
      })
    ).output;
    return { peggedUSD: totalSupply / 10 ** 18 };
  };
}



const adapter: PeggedIssuanceAdapter = {
  arbitrum: {
    minted: mintedOnArbitrum(),
  },
};

export default adapter;
