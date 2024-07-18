import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
const sdk = require("@defillama/sdk");

const chainContracts = {
    scroll: {
        issued: "0x9F24de635C78C5Df77F9EA9aA3C6D71FfcabEc8f",
    },
};

async function scrollMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "function vaultInfo(address vault) external view returns (tuple( uint128 conjureLimit ,  uint128 totalConjured))",
        target: chainContracts.scroll.issued,
        params: ["0x3bdfe67009FEbf4bc65378F1C07E7FfEF5339407"],
        block: _ethBlock,
        chain: "scroll",
      })
    ).output;
    return { peggedUSD: totalSupply[1] / 10 ** 18 };
  };
}

const adapter: PeggedIssuanceAdapter = {
  scroll: {
    minted: scrollMinted(),
  },
};

export default adapter;
