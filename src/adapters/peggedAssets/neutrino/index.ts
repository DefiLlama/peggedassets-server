const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    bridgedFromWaves: ["0x674c6ad92fd080e4004b2312b45f796a192d27a0"],
  },
  polygon: {
    bridgedFromWaves: ["0x013f9c3fac3e2759d7e90aca4f9540f75194a0d7"],
  },
  bsc: {
    bridgedFromWaves: ["0x03ab98f5dc94996F8C33E15cD4468794d12d41f9"],
  },
};

async function wavesMinted() {
  // Subtracting USDN in reserve wallet from total USDN minted gives ~960M.
  // Their API gives the amount circulating as ~860M. Using their API for now.
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios("https://api.neutrino.at/circulating-supply/USDN")
    );
    const totalCirculating = parseInt(res.data);
    sumSingleBalance(balances, "peggedUSD", totalCirculating, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  waves: {
    minted: wavesMinted(),
    unreleased: async () => ({}),
  },
  ethereum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    waves: bridgedSupply(
      "ethereum",
      18,
      chainContracts.ethereum.bridgedFromWaves
    ),
  },
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    waves: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromWaves
    ),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    waves: bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromWaves),
  },
};

export default adapter;
