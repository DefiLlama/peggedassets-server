const sdk = require("@defillama/sdk");
import fetch from "node-fetch";
import { sumSingleBalance } from "../helper/generalUtil";
import { solanaMintedOrBridged } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x820802Fa8a99901F52e39acD21177b0BE6EE2974"],
  },
  polygon: {
    issued: ["0x820802Fa8a99901F52e39acD21177b0BE6EE2974"],
  },
  arbitrum: {
    issued: ["0xcF985abA4647a432E60efcEeB8054BBd64244305"],
  },
  avax: {
    issued: ["0x820802Fa8a99901F52e39acD21177b0BE6EE2974"],
  },
  solana: {
    issued: ["2VhjJ9WxaGC3EZFwJG9BDUs9KxKCAjQY4vgd1qxgYWVg"],
  },
  optimism: {
    issued: ["0x820802Fa8a99901F52e39acD21177b0BE6EE2974"],
  },
};

async function concordiumMinted(apiEndpoint: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;

    try {
      const res = await fetch(apiEndpoint);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch data from Concordium API. Status: ${res.status}`
        );
      }

      const totalSupply = parseFloat(await res.text());
      const formattedTotalSupply = Number(totalSupply.toFixed(decimals));
      sumSingleBalance(
        balances,
        "peggedEUR",
        formattedTotalSupply,
        apiEndpoint,
        true
      );
    } catch (error) {
      console.error(`Error fetching data from Concordium API: ${error}`);
    }

    return balances;
  };
}

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
  ethereum: {
    minted: chainMinted("ethereum", 6),
  },
  polygon: {
    minted: chainMinted("polygon", 6),
  },
  arbitrum: {
    minted: chainMinted("arbitrum", 6),
  },
  avalanche: {
    minted: chainMinted("avax", 6),
  },
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued, "peggedEUR"),
  },
  optimism: {
    minted: chainMinted("optimism", 6),
  },
  concordium: {
    minted: concordiumMinted("https://www.euroe.com/api/totalsupply/CCD", 6),
  },
};

export default adapter;
