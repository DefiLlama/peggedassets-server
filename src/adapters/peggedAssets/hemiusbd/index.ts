import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
const sdk = require("@defillama/sdk");

type Chain = "hemi"

const chainContracts: Partial<Record<Chain, { hemiusbd: string }>> = {
  hemi: {
    hemiusbd: "0x71E7c8F2B7D7F6c99E375023916CB3ed9ffC4621"
  }
};

async function minted(chain: Chain) {
  return async function (
    // @ts-ignore
    timestamp: number,
    block: number,
    // @ts-ignore
    chainBlocks: ChainBlocks
  ) {
    const chainInfo = chainContracts[chain]!;

    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainInfo.hemiusbd,
        block,
        chain,
      })
    ).output;

    return { peggedUSD: totalSupply / 10 ** 18 };
  };
}


const adapter: PeggedIssuanceAdapter = Object.keys(chainContracts).reduce(
  (acc, item) => ({
    ...acc,
    [item]: {
      minted: minted(item as Chain)
    },
  }),
  {}
);

export default adapter;
