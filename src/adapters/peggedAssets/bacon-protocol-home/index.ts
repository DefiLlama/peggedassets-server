const sdk = require("@defillama/sdk");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
    ethereum: {
        issued: "0xb8919522331C59f5C16bDfAA6A121a6E03A91F62",
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
    return { peggedUSD: totalSupply / 10 ** 6 };
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: ethereumMinted(),
    unreleased: async () => ({}),
  },
};

export default adapter;