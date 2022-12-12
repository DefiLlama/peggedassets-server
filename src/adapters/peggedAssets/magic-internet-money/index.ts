const sdk = require("@defillama/sdk");
import { sumMultipleBalanceFunctions, sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
  bridgedSupplySubtractReserve,
} from "../helper/getSupply";
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
  ethereum: {
    issued: ["0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3"],
    reserves: [
      "0x30b9de623c209a42ba8d5ca76384ead740be9529", // new cauldron
      "0xf5bce5077908a1b7370b9ae04adc565ebd643966", // bentobox
      "0xd96f48665a1410c0cd669a88898eca36b9fc2cce", // degenbox
      "0x5f0dee98360d8200b20812e174d139a1a633edd2", // multisig
    ],
    multichain: ["0xbbc4a8d076f4b1888fec42581b6fc58d242cf2d5"], // multichain bridge contract, has significant amount more than is minted on other chains
  },
  polygon: {
    bridgedFromETH: ["0x49a0400587A7F65072c87c4910449fDcC5c47242"], // multichain/abracadabra
  },
  avax: {
    bridgedFromETH: ["0x130966628846BFd36ff31a822705796e8cb8C18D"], // multichain/abracadabra
    reserves: [
      "0xae64a325027c3c14cf6abc7818aa3b9c07f5c799", // new gnosis
      "0x27c215c8b6e39f54c42ac04eb651211e9a566090", // multisig
      "0xae4d3a42e46399827bd094b4426e2f79cca543ca", // gnosis
      "0xf4f46382c2be1603dc817551ff9a7b333ed1d18f", // bentobox
      "0x1fc83f75499b7620d53757f0b01e2ae626aae530", // degenbox
    ],
  },
  arbitrum: {
    bridgedFromETH: ["0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a"], // multichain/abracadabra
    reserves: [
      "0x74c764d41b77dbbb4fe771dab1939b00b146894a", // bentobox
      "0xf46bb6dda9709c49efb918201d97f6474eac5aea", // multisig
    ],
  },
  fantom: {
    bridgedFromETH: ["0x82f0b8b456c1a451378467398982d4834b6829c1"], // multichain/abracadabra
    reserves: [
      "0xb4ad8b57bd6963912c80fcbb6baea99988543c1c", // multisig
      "0xf5bce5077908a1b7370b9ae04adc565ebd643966", // bentobox
      "0x74a0bca2eeedf8883cb91e37e9ff49430f20a616", // degenbox
    ],
  },
  bsc: {
    bridgedFromETH: ["0xfe19f0b51438fd612f6fd59c1dbb3ea319f433ba"], // multichain/abracadabra
    reserves: [
      "0x090185f2135308bad17527004364ebcc2d37e5f6", // degenbox
      "0x9d9bc38bf4a128530ea45a7d27d0ccb9c2ebfaf6", // multisig
    ],
  },
  moonriver: {
    bridgedFromETH: ["0x0cae51e1032e8461f4806e26332c030e34de3adb"], // multichain
    reserves: ["0xd4a7febd52efda82d6f8ace24908ae0aa5b4f956"], // multisig
  },
  boba: {
    bridgedFromETH: ["0x218c3c3D49d0E7B37aff0D8bB079de36Ae61A4c0"], // multichain
  },
  metis: {
    bridgedFromETH: ["0x44Dd7C98885cD3086E723B8554a90c9cC4089C4C"], // multichain
  },
  solana: {
    bridgedFromETH: [
      "HRQke5DKdDo3jV7wnomyiM8AA3EzkVnxMDdo2FQ5XUe1", // wormhole, 0 supply?
      "CYEFQXzQM6E5P8ZrXgS7XMSwU3CiqHMMyACX4zuaA2Z4", // allbridge, no longer available in bridge?
    ],
  },
  terra: {
    bridgedFromETH: ["terra15a9dr3a2a2lj5fclrw35xxg9yuxg0d908wpf2y"], // wormhole
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedUSD",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

async function chainUnreleased(
  chain: string,
  decimals: number,
  target: string,
  reserves: string[]
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;

    for (let reserve of reserves) {
      const balance = (
        await sdk.api.erc20.balanceOf({
          target: target,
          owner: reserve,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", balance / 10 ** decimals);
    }

    return balances;
  };
}

async function ethereumUnreleased(
  chain: string,
  decimals: number,
  reserves: string[]
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;

    let bridgedTotalFunction = await sumMultipleBalanceFunctions(
      [
        bridgedSupply("polygon", 18, chainContracts.polygon.bridgedFromETH),
        bridgedSupplySubtractReserve("avax", 18, [
          chainContracts.avax.bridgedFromETH[0],
          chainContracts.avax.reserves,
        ]),
        bridgedSupplySubtractReserve("arbitrum", 18, [
          chainContracts.arbitrum.bridgedFromETH[0],
          chainContracts.arbitrum.reserves,
        ]),
        bridgedSupplySubtractReserve("fantom", 18, [
          chainContracts.fantom.bridgedFromETH[0],
          chainContracts.fantom.reserves,
        ]),
        bridgedSupplySubtractReserve("bsc", 18, [
          chainContracts.bsc.bridgedFromETH[0],
          chainContracts.bsc.reserves,
        ]),
        bridgedSupplySubtractReserve("moonriver", 18, [
          chainContracts.moonriver.bridgedFromETH[0],
          chainContracts.moonriver.reserves,
        ]),
        bridgedSupply("boba", 18, chainContracts.boba.bridgedFromETH),
        bridgedSupply("metis", 18, chainContracts.metis.bridgedFromETH),
      ],
      "peggedUSD"
    );

    balances = await bridgedTotalFunction(_timestamp, _ethBlock, _chainBlocks);

    balances["peggedUSD"] = -balances["peggedUSD"];

    for (let reserve of reserves) {
      const balance = (
        await sdk.api.erc20.balanceOf({
          target: chainContracts.ethereum.issued[0],
          owner: reserve,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", balance / 10 ** decimals);
    }

    const bridged = (
      await sdk.api.erc20.balanceOf({
        target: chainContracts.ethereum.issued[0],
        owner: chainContracts.ethereum.multichain[0],
        block: _chainBlocks?.[chain],
        chain: chain,
      })
    ).output;
    sumSingleBalance(balances, "peggedUSD", bridged / 10 ** decimals);

    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: ethereumUnreleased(
      "ethereum",
      18,
      chainContracts.ethereum.reserves
    ),
  },
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromETH
    ),
  },
  avalanche: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupplySubtractReserve("avax", 18, [
      chainContracts.avax.bridgedFromETH[0],
      chainContracts.avax.reserves,
    ]),
  },
  arbitrum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupplySubtractReserve("arbitrum", 18, [
      chainContracts.arbitrum.bridgedFromETH[0],
      chainContracts.arbitrum.reserves,
    ]),
  },
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupplySubtractReserve("fantom", 18, [
      chainContracts.fantom.bridgedFromETH[0],
      chainContracts.fantom.reserves,
    ]),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupplySubtractReserve("bsc", 18, [
      chainContracts.bsc.bridgedFromETH[0],
      chainContracts.bsc.reserves,
    ]),
  },
  moonriver: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupplySubtractReserve("moonriver", 18, [
      chainContracts.moonriver.bridgedFromETH[0],
      chainContracts.moonriver.reserves,
    ]),
  },
  boba: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("boba", 18, chainContracts.boba.bridgedFromETH),
  },
  metis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("metis", 18, chainContracts.metis.bridgedFromETH),
  },
  /* This appears not to be accessible anymore, so not adding it.
  terra: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: terraSupply(chainContracts.terra.bridgedFromETH, 8),
  },
  */
};

export default adapter;
