const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { getTokenBalance as solanaGetTokenBalance } from "../helper/solana";
import { getTokenSupply as solanaGetTokenSupply } from "../llama-helper/solana";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  polygon: {
    issued: ["0xa3fa99a148fa48d14ed51d610c367c61876997f1"],
    burned: ["0x000000000000000000000000000000000000dead"],
    anyMAI: [
      "0x95dd59343a893637be1c3228060ee6afbf6f0730",
      "0x25864a712c80d33ba1ad7c23cffa18b46f2fc00c",
    ],
  },
  bsc: {
    // off of API by 350k
    bridgedFromPolygon: ["0x3f56e0c36d275367b8c502090edf38289b3dea0d"],
    anyMAI: ["0xc412eCccaa35621cFCbAdA4ce203e3Ef78c4114a"],
  },
  avax: {
    // not able to view celer holders
    // nothing matches API
    bridgedFromPolygon: [
      "0x3b55e45fd6bd7d4724f5c47e0d1bcaedd059263e", // multichain
      "0x5c49b268c9841AFF1Cc3B0a418ff5c3442eE3F3b", // celer
    ],
    anyMAI: ["0x3Cf6A36876BDecadEab420AfF93171439AbF9CA2"],
  },
  solana: {
    bridgedFromPolygon: ["9mWRABuz2x6koTPCWiCPM49WUbcrNqGTHBV9T9k7y1o7"],
    reserveAddress: ["CYEFQXzQM6E5P8ZrXgS7XMSwU3CiqHMMyACX4zuaA2Z4"],
  },
  arbitrum: {
    // matches API
    bridgedFromPolygon: ["0x3f56e0c36d275367b8c502090edf38289b3dea0d"],
    anyMAI: [
      "0x99415856B37bE9E75C0153615C7954f9DDb97A6E",
      "0xc76a3cbefe490ae4450b2fcc2c38666aa99f7aa0",
    ],
  },
  moonriver: {
    // much lower than API
    bridgedFromPolygon: [
      "0x7f5a79576620c046a293f54ffcdbd8f2468174f1", // multichain
      "0xFb2019DfD635a03cfFF624D210AEe6AF2B00fC2C", // celer
    ],
    anyMAI: [
      "0x4a0474E3262d4DB3306Cea4F207B5d66eC8E0AA9",
      "0xaab1688899a833d0b6e0226afcd9a4c1128a5a77",
      "0xca8a932e5aa63961d975afa005d34ef73c59bb45",
    ],
  },
  harmony: {
    // matches API
    bridgedFromPolygon: ["0x3f56e0c36d275367b8c502090edf38289b3dea0d"], // celer
    anyMAI: [
      "0x3405A1bd46B85c5C029483FbECf2F3E611026e45",
      "0x0000000000000000000000000000000000000001",
    ],
  },
  iotex: {
    bridgedFromPolygon: ["0x3f56e0c36d275367b8c502090edf38289b3dea0d"],
    anyMAI: ["0xabd380327fe66724ffda91a87c772fb8d00be488"],
  },
  aurora: {
    bridgedFromPolygon: ["0xdfa46478f9e5ea86d57387849598dbfb2e964b02"],
    anyMAI: ["0xc9baa8cfdde8e328787e29b4b078abf2dadc2055"],
  },
  xdai: {
    // matches API
    bridgedFromPolygon: ["0x3f56e0c36d275367b8c502090edf38289b3dea0d"],
    anyMAI: ["0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055"],
  },
  boba: {
    bridgedFromPolygon: ["0x3f56e0c36d275367b8c502090edf38289b3dea0d"], // supply is 0
  },
  celo: {
    bridgedFromPolygon: ["0xb9c8f0d3254007ee4b98970b94544e473cd610ec"],
    anyMAI: ["0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50"],
  },
  fantom: {
    // does not match API
    bridgedFromPolygon: ["0xfb98b335551a418cd0737375a2ea0ded62ea213b"],
    burned: [
      "0x0000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000001",
    ],
  },
  cronos: {
    // matches API
    bridgedFromPolygon: ["0x2ae35c8e3d4bd57e8898ff7cd2bbff87166ef8cb"],
    anyMAI: ["0xc931f61b1534eb21d8c11b24f3f5ab2471d4ab50"],
  },
  metis: {
    bridgedFromPolygon: ["0xdfa46478f9e5ea86d57387849598dbfb2e964b02"],
    anyMAI: ["0x2C78f1b70Ccf63CDEe49F9233e9fAa99D43AA07e"],
  },
  milkomeda: {
    bridgedFromPolygon: ["0xB9C8F0d3254007eE4b98970b94544e473Cd610EC"],
    anyMAI: ["0x9610b01AAa57Ec026001F7Ec5CFace51BfEA0bA6"],
  },
  optimism: {
    // matches API
    bridgedFromPolygon: ["0xdFA46478F9e5EA86d57387849598dbFB2e964b02"],
    anyMAI: ["0x65e66a61d0a8f1e686c2d6083ad611a10d84d97a"],
  },
};

/* 
sxnetwork address: 0xF9AbB1Ef0dAb68cEdf1acbD6859510B0af4ca1d5
*/

async function polygonMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.polygon.issued[0],
        block: _chainBlocks[chain],
        chain: chain,
      })
    ).output;
    const reserve = (
      await sdk.api.erc20.balanceOf({
        target: chainContracts.polygon.issued[0],
        owner: chainContracts.polygon.anyMAI[0],
        block: _chainBlocks[chain],
        chain: chain,
      })
    ).output;
    const burned = (
      await sdk.api.erc20.balanceOf({
        target: chainContracts.polygon.issued[0],
        owner: chainContracts.polygon.burned[0],
        block: _chainBlocks[chain],
        chain: chain,
      })
    ).output;
    sumSingleBalance(
      balances,
      "peggedUSD",
      (totalSupply - reserve - burned) / 10 ** decimals,
      "issued",
      false
    );
    return balances;
  };
}

async function solanaMAISupply(target: string, reserve: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await solanaGetTokenSupply(target);
    const reserveBalance = await solanaGetTokenBalance(target, reserve);
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupply - reserveBalance,
      target,
      true
    );
    return balances;
  };
}

async function bridgedMAISupply(
  chain: string,
  decimals: number,
  address: string,
  addressesToSubtract?: string[],
  bridgeSource?: string,
  bridgedFromChain?: string
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: address,
        block: _chainBlocks[chain],
        chain: chain,
      })
    ).output;
    bridgeSource
      ? sumSingleBalance(
          balances,
          "peggedUSD",
          totalSupply / 10 ** decimals,
          bridgeSource,
          false,
          bridgedFromChain
        )
      : sumSingleBalance(
          balances,
          "peggedUSD",
          totalSupply / 10 ** decimals,
          address,
          true
        );
    if (addressesToSubtract) {
      for (let owner of addressesToSubtract) {
        const reserve = (
          await sdk.api.erc20.balanceOf({
            target: address,
            owner: owner,
            block: _chainBlocks[chain],
            chain: chain,
          })
        ).output;
        if (typeof balances["peggedUSD"] === "number") {
          balances["peggedUSD"] -= reserve / 10 ** decimals;
        }
      }
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  polygon: {
    minted: polygonMinted("polygon", 18),
    unreleased: async () => ({}),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "bsc",
      18,
      chainContracts.bsc.bridgedFromPolygon[0],
      chainContracts.bsc.anyMAI
    ),
  },
  solana: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: solanaMAISupply(
      chainContracts.solana.bridgedFromPolygon[0],
      chainContracts.solana.reserveAddress[0]
    ),
  },
  avalanche: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "avax",
      18,
      chainContracts.avax.bridgedFromPolygon[0],
      chainContracts.avax.anyMAI
    ),
  },
  arbitrum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromPolygon[0],
      chainContracts.arbitrum.anyMAI
    ),
  },
  moonriver: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "moonriver",
      18,
      chainContracts.moonriver.bridgedFromPolygon[0],
      chainContracts.moonriver.anyMAI
    ),
  },
  harmony: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "harmony",
      18,
      chainContracts.harmony.bridgedFromPolygon[0],
      chainContracts.harmony.anyMAI
    ),
  },
  iotex: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "iotex",
      18,
      chainContracts.iotex.bridgedFromPolygon[0],
      chainContracts.iotex.anyMAI
    ),
  },
  aurora: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "aurora",
      18,
      chainContracts.aurora.bridgedFromPolygon[0],
      chainContracts.aurora.anyMAI
    ),
  },
  xdai: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "xdai",
      18,
      chainContracts.xdai.bridgedFromPolygon[0],
      chainContracts.xdai.anyMAI
    ),
  },
  /*
  boba: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply("boba", 18, chainContracts.boba.bridgedFromPolygon[0], chainContracts.boba.anyMAI),
  },
  */
  celo: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "celo",
      18,
      chainContracts.celo.bridgedFromPolygon[0],
      chainContracts.celo.anyMAI
    ),
  },
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "fantom",
      18,
      chainContracts.fantom.bridgedFromPolygon[0],
      chainContracts.fantom.burned
    ),
  },
  metis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "metis",
      18,
      chainContracts.metis.bridgedFromPolygon[0],
      chainContracts.metis.anyMAI
    ),
  },
  cronos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "cronos",
      18,
      chainContracts.cronos.bridgedFromPolygon[0],
      chainContracts.cronos.anyMAI
    ),
  },
  milkomeda: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "milkomeda",
      18,
      chainContracts.milkomeda.bridgedFromPolygon[0],
      chainContracts.milkomeda.anyMAI
    ),
  },
  optimism: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    polygon: bridgedMAISupply(
      "optimism",
      18,
      chainContracts.optimism.bridgedFromPolygon[0],
      chainContracts.optimism.anyMAI
    ),
  },
};

export default adapter;
