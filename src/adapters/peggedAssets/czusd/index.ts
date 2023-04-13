const sdk = require("@defillama/sdk");
import {
    ChainBlocks,
    PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
    bsc: {
        issued: "0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70",
    },
};

async function bscMinted() {
    return async function (
        _timestamp: number,
        _ethBlock: number,
        _chainBlocks: ChainBlocks
    ) {
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.bsc.issued,
        block: _chainBlocks?.['bsc'],
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
  }
};

export default adapter;