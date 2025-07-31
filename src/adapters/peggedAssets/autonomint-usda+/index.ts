const sdk = require("@defillama/sdk");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
    base: {
    issued: "0x4e44fB5c61a89CF44a9080AB987335889FCaA6bd",
    },
    optimism: {
    issued: "0x4e44fB5c61a89CF44a9080AB987335889FCaA6bd",
    },
};

async function baseMinted() {
return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
) {
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.base.issued,
        block: _ethBlock,
        chain: "base",
      })
    ).output;

    console.log("Total Supply:", totalSupply);
    return { peggedUSD: totalSupply / 10 ** 6 };
  };
}

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
    console.log("Total Supply:", totalSupply);
    return { peggedUSD: totalSupply / 10 ** 6 };
  };
}



const adapter: PeggedIssuanceAdapter = {
  base: {
    minted: baseMinted(),
    unreleased: async () => ({}),
  },
  optimism: {
    minted: optimismMinted(),
    unreleased: async () => ({}),
  },
};

export default adapter;