const sdk = require("@defillama/sdk");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
    optimism: {
        issued: "0xc5b001dc33727f8f26880b184090d3e252470d45",
    },
};

async function optimismMinted() {
return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
) {
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.optimism.issued,
        block: _ethBlock,
        chain: "optimism",
      })
    ).output;
    return { ernUSD: totalSupply / 10 ** 18 };
  };
}

const adapter: PeggedIssuanceAdapter = {
  optimism: {
    minted: optimismMinted(),
    unreleased: async () => ({}),
  },
};

export default adapter;