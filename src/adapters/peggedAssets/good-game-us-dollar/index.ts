import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
import * as sdk from "@defillama/sdk";

const chainContracts = {
  polygon: {
    issued: "0xFFFFFF9936BD58a008855b0812B44D2c8dffE2aA",
    adapter: "0xFFFFFF003605c71C2981d0dED6182b762D25a6E5",
  },
  bsc: {
    bridgedFromPolygon: "0xFFFFFF9936BD58a008855b0812B44D2c8dffE2aA",
  },
};

const decimals = 6; // Assuming the pegged USD token has 6 decimals

async function polygonMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.polygon.issued,
        block: _chainBlocks.polygon,
        chain: "polygon",
      })
    ).output;
    return { peggedUSD: totalSupply / 10 ** decimals };
  };
}

async function balanceOfAddress(chain: string, issued: string, address: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:balanceOf",
        target: issued,
        params: address,
        block: _chainBlocks[chain],
        chain: chain,
      })
    ).output;
    return { peggedUSD: totalSupply / 10 ** decimals };
  };
}

async function bridgedFromPolygon(chain: string, address: string) {
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
  polygon: {
    minted: polygonMinted(),
    unreleased: balanceOfAddress("polygon", chainContracts.polygon.issued, chainContracts.polygon.adapter),
  },
  bsc: {
    bridgedFromPolygon: bridgedFromPolygon("bsc", chainContracts.bsc.bridgedFromPolygon),
  },
};

export default adapter;


