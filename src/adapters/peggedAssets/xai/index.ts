const sdk = require("@defillama/sdk");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
    ethereum: {
        issued: "0xd7C9F0e536dC865Ae858b0C0453Fe76D13c3bEAc",
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

// Will use this in the future once bridging is relevant
async function bridgedFromEthereum(chain: string, decimals: number, address: string) {
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
};

export default adapter;