const sdk = require("@defillama/sdk");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
    bsc: {
        issued: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
    },
};

async function bscMinted() {
return async function (
    _timestamp: number,
    _bscBlock: number,
    _chainBlocks: ChainBlocks
) {
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.bsc.issued,
        block: _bscBlock,
        chain: "bsc",
      })
    ).output;
    return { peggedUSD: totalSupply / 10 ** 18 };
  };
}

const adapter: PeggedIssuanceAdapter = {
  bsc: {
    minted: bscMinted(),
    unreleased: async () => ({}),
  },
};

export default adapter;