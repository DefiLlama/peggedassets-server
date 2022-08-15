const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply, solanaMintedOrBridged } from "../helper/getSupply";
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
  celo: {
    issued: ["0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73"],
  },
  ethereum: {
    bridgedFromCelo: [
      "0x977453366b8d205f5c9266b6ba271e850a814a50", // Optics
    ],
  },
  polygon: {
    bridgedFromCelo: ["0x2f0173dFE97a7Dc670D5A10b35C4263cfEcFa853"], // Optics
  },
  solana: {
    bridgedFromCelo: ["7g166TuBmnoHKvS2PEkZx6kREZtbfjUxCHGWjCqoDXZv"], // allbridge
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
        "peggedEUR",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  celo: {
    minted: chainMinted("celo", 18),
    unreleased: async () => ({}),
  },
  ethereum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    celo: bridgedSupply(
      "ethereum",
      18,
      chainContracts.ethereum.bridgedFromCelo,
      "optics",
      "Celo",
      "peggedEUR"
    ),
  },
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    celo: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromCelo,
      "optics",
      "Celo",
      "peggedEUR"
    ),
  },
  solana: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    celo: solanaMintedOrBridged(
      chainContracts.solana.bridgedFromCelo,
      "peggedEUR"
    ),
  },
};

export default adapter;
