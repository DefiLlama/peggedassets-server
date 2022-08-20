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
    issued: ["0x765de816845861e75a25fca122bb6898b8b1282a"],
  },
  ethereum: {
    bridgedFromCelo: [
      // "0xEccD71699e091382B17C17d98f568d7aCa0b72ed", appears no long accessible?
      "0xd8F3208c045DD69D27938346275165998359D8fF", // low supply, but their discord stated this is the Optics address
      "0x9b9E2De4cB4ca479943F36DfFc72c7253bb1f66a", // moss
      "0xad3E3Fc59dff318BecEaAb7D00EB4F68b1EcF195", // wrapped
    ],
  },
  polygon: {
    bridgedFromCelo: ["0x9fa22bdA93a0eCEF300928C0358003b63647c5d8"], // 0 supply, but appears to have same owner as PoS CELO
  },
  near: {
    bridgedFromCelo: [""], // cannot find any contract addresses for near
  },
  solana: {
    bridgedFromCelo: ["EwxNF8g9UfmsJVcZFTpL9Hx5MCkoQFoJi6XNWzKf1j8e"], // allbridge
  },
  klaytn: {
    bridgedFromCelo: ["0x08745bee17026ed2e0e39a98f81189b9e14ab1b3"], // orbit
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
      chainContracts.ethereum.bridgedFromCelo
    ),
  },
  /* has 0 supply
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    celo: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromCelo
    ),
  },
  */
  solana: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    celo: solanaMintedOrBridged(chainContracts.solana.bridgedFromCelo)
  },
  klaytn: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    celo: bridgedSupply("klaytn", 18, chainContracts.klaytn.bridgedFromCelo),
  },
};

export default adapter;
