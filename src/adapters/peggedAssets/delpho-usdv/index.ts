import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
const sdk = require("@defillama/sdk");

const CONFIG_PROVIDER = "0xeC884577055e1f32f2579CAB9f348F4918Cd757f";

async function hyperliquidMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    chainBlocks: ChainBlocks
  ) {
    const usdvAddress = (
      await sdk.api.abi.call({
        abi: "address:delphoStable",
        target: CONFIG_PROVIDER,
        chain: "hyperliquid",
        block: chainBlocks["hyperliquid"],
      })
    ).output;

    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: usdvAddress,
        chain: "hyperliquid",
        block: chainBlocks["hyperliquid"],
      })
    ).output;

    return { peggedUSD: totalSupply / 10 ** 6 };
  };
}

const adapter: PeggedIssuanceAdapter = {
  hyperliquid: {
    minted: hyperliquidMinted(),
    unreleased: async () => ({}),
  },
};

export default adapter;