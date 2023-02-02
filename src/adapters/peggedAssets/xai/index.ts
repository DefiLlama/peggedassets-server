const sdk = require("@defillama/sdk");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";

const chainContracts = {
  ethereum: {
    issued: ["0xd7C9F0e536dC865Ae858b0C0453Fe76D13c3bEAc"],
    silos: [
      "0xc8cd77d4cd9511f2822f24ad14fe9e3c97c57836",
      "0xfccc27aabd0ab7a0b2ad2b7760037b1eab61616b",
      "0x92e7e77163ffed918421e3cb6e0a22f2fe8b37fa",
      "0x6543ee07Cf5Dd7Ad17AeECF22ba75860ef3bBAAa",
      "0x629b9e70a7d32c718318d691dda5da585e468b82",
      "0xd953cc57d906e1f2d7d6c8c50a369ff64096ddc5",
      "0xC413DD03555F3eB29D834B482d386b2999dc2EB0",
      "0xa104f14aeeb9b7246367d6a6e1f4e2c61a70e5d3",
      "0xf39f64d85ad89200e3b06c67f679c45798bf6a5b",
      "0xdff2aea378e41632e45306a6de26a7e0fd93ab07", // Silo treasury
    ],
  },
};

async function ethereumMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.ethereum.issued[0],
        block: _ethBlock,
        chain: "ethereum",
      })
    ).output;
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupply / 10 ** 18,
      "issued",
      false
    );
    return balances;
  };
}

// Will use this in the future once bridging is relevant
async function bridgedFromEthereum(
  chain: string,
  decimals: number,
  address: string
) {
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

async function ethereumUnreleased() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let address of chainContracts.ethereum.silos) {
      const reserve = (
        await sdk.api.erc20.balanceOf({
          target: chainContracts.ethereum.issued[0],
          owner: address,
          block: _chainBlocks?.["ethereum"],
          chain: "ethereum",
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", reserve / 10 ** 18);
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: ethereumMinted(),
    unreleased: ethereumUnreleased(),
  },
};

export default adapter;
