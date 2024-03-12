const sdk = require("@defillama/sdk");
import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts: { [key: string]: { issued: string } } = {
  polygon: {
    issued: "0xA0e4c84693266a9d3BBef2f394B33712c76599Ab",
  },
  linea: {
    issued: "",
  },
};

async function chainMinted(chain: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts[chain].issued,
        block: _ethBlock,
        chain: chain,
      })
    ).output;
    console.log(totalSupply / 10 ** 18);
    return { peggedEUR: totalSupply / 10 ** 18 };
  };
}

const adapter: PeggedIssuanceAdapter = {
  polygon: {
    minted: chainMinted("polygon"),
    unreleased: async () => ({}),
  },
};

export default adapter;
