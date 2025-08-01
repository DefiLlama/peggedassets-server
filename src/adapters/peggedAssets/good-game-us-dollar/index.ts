const sdk = require("@defillama/sdk");
import { PeggedIssuanceAdapter } from "../peggedAsset.type";
import {
  bridgedSupply,
  solanaMintedOrBridged,
} from "../helper/getSupply";
import {
  sumSingleBalance,
} from "../helper/generalUtil";
import {
  ChainBlocks,
  Balances,
} from "../peggedAsset.type";

const chainContracts: { [chain: string]: string[] } = {
  polygon: ["0xFFFFFF9936BD58a008855b0812B44D2c8dffE2aA"],
  bsc: ["0xFFFFFF9936BD58a008855b0812B44D2c8dffE2aA"],
  solana: ["GGUSDyBUPFg5RrgWwqEqhXoha85iYGs6cL57SyK4G2Y7"],
};

const decimals = 6;

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain]) {
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
  polygon: {
    minted: chainMinted("polygon", decimals),
  },
  bsc: {
    polygon: bridgedSupply("bsc", decimals, chainContracts.bsc),
  },
  solana: {
    polygon: solanaMintedOrBridged(chainContracts.solana),
  }
};

export default adapter;


