const sdk = require("@defillama/sdk");
import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts = {
  ethereum: {
    issued: "0x02814F435dD04e254Be7ae69F61FCa19881a780D",
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

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: ethereumMinted(),
    unreleased: async () => ({}),
  },
};

export default adapter;
