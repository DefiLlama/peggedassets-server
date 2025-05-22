import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
const sdk = require("@defillama/sdk");

type Chain =
  | "ethereum"
  | "core"
  | "hemi"
  | "plume"
  | "sonic"
  | "goat"
  | "bsc"
  | "plume_mainnet";

const chainContracts: Partial<Record<Chain, { usbd: string, burner: string, psmList: string[]}>> = {
  ethereum: {
    usbd: "0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c",
    burner: "0xF0DE02A2d05A82222CBB98df3EEA10CAFc8c92C1",
    psmList: [
      "0xEA811C2C400EE846E352D45C849657D920A888fe",
      "0x97bb3167A88FE34B1EC6d7F02560c4F0aa6009E9",
      "0x42Ad6834a6599a0B7a7812F01f8092B580523d67",
      "0x705fd2306bf6E4dec47bF8Aaab378B04024792d4",
    ],
  },
  core: {
    usbd: "0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c",
    burner: "0xBA4197EF8DdDa01E628FA98d0b1E87751628a3B2",
    psmList: [],
  },
  hemi: {
    usbd: "0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c",
    burner: "0xf9240FeEe9d1d6e8614a8d22D6864fFbc3f52235",
    psmList: [],
  },
  bsc: {
    usbd: "0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c",
    burner: "0x93ee18e6d372a2c9bf8c876932e39c4126f80f09",
    psmList: [],
  },
  sonic: {
    usbd: "0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c",
    burner: "0x93EE18e6d372A2C9Bf8c876932E39C4126F80f09",
    psmList: [],
  },
  plume_mainnet: {
    usbd: "0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c",
    burner: "0x71E7c8F2B7D7F6c99E375023916CB3ed9ffC4621",
    psmList: [],
  },
  goat: {
    usbd: "0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c",
    burner: "0x93EE18e6d372A2C9Bf8c876932E39C4126F80f09",
    psmList: [],
  },
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
        target: chainInfo.usbd,
        block,
        chain,
      })
    ).output;

    return { peggedUSD: totalSupply / 10 ** 18 };
  };
}

async function unreleased(chain: Chain) {
  return async function (
    // @ts-ignore
    timestamp: number,
    block: number,
    // @ts-ignore
    chainBlocks: ChainBlocks
  ) {
    const chainInfo = chainContracts[chain]!;

    const burnerBalance = (
      await sdk.api.abi.call({
        abi: "erc20:balanceOf",
        target: chainInfo.usbd,
        block,
        chain,
        params: [chainInfo.burner],
      })
    ).output;

    let psmsBalance = 0;

    for (const psmAddress of chainInfo.psmList) {
      const balance = (
        await sdk.api.abi.call({
          abi: "erc20:balanceOf",
          target: chainInfo.usbd,
          block,
          chain,
          params: [psmAddress],
        })
      ).output;

      psmsBalance += balance / 10 ** 18;
    }

    return { peggedUSD: psmsBalance + burnerBalance / 10 ** 18 };
  };
}

const adapter: PeggedIssuanceAdapter = Object.keys(chainContracts).reduce(
  (acc, item) => ({
    ...acc,
    [item]: {
      minted: minted(item as Chain),
      unreleased: unreleased(item as Chain),
    },
  }),
  {}
);

export default adapter;
