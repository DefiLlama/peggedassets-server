const sdk = require("@defillama/sdk");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
    ethereum: {
        issued: "0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c",
    },
    core: {
        issued: "0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c",
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

async function coreMinted() {
  return async function (
      _timestamp: number,
      _ethBlock: number,
      _chainBlocks: ChainBlocks
  ) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: chainContracts.core.issued,
          block: _ethBlock,
          chain: "core",
        })
      ).output;
      return { peggedUSD: totalSupply / 10 ** 18 };
    };
  }


const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: ethereumMinted(),
  },
  core: {
    minted: coreMinted(),
  },
};

export default adapter;