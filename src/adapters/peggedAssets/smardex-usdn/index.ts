const sdk = require("@defillama/sdk");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
    ethereum: {
      issued: "0xde17a000ba631c5d7c2bd9fb692efea52d90dee2",
    },
};

async function usdnMinted() {
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

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: usdnMinted(),
  },
};

export default adapter;
