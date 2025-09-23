const sdk = require("@defillama/sdk");
const axios = require("axios");
const retry = require("async-retry");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";

const chainContracts = {
  ethereum: {
    issued: "0xaf6186b3521b60e27396b5d23b48abc34bf585c5",
  },
};

const GUSD_DECIMALS = 6; // GUSD uses 6 decimals

async function ethereumMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    
    // Get total supply from chain (this is the total minted amount)
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.ethereum.issued,
        block: _chainBlocks?.ethereum,
        chain: "ethereum",
      })
    ).output;
    
    const totalSupplyNum = Number(totalSupply) / 10 ** GUSD_DECIMALS;
    
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupplyNum,
      "issued",
      false
    );
    
    return balances;
  };
}

async function ethereumUnreleased() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    
    try {
      // Get total supply from chain
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: chainContracts.ethereum.issued,
          block: _chainBlocks?.ethereum,
          chain: "ethereum",
        })
      ).output;
      
      // Get circulating amount from Gate.com API
      const res = await retry(
        async (_bail: any) =>
          await axios.get("https://www.gate.com/apim/v3/earn/staking/product?coin=GUSD")
      );
      
      const circulating = parseFloat(res?.data?.data?.hold_amount_total || 0);
      const totalSupplyNum = Number(totalSupply) / 10 ** GUSD_DECIMALS;
      
      // Calculate unreleased as the difference between total supply and circulating
      const unreleased = totalSupplyNum - circulating;
      
      if (unreleased > 0) {
        sumSingleBalance(
          balances,
          "peggedUSD",
          unreleased,
          "unreleased",
          false
        );
      }
    } catch (error) {
      console.error(`[GUSD] Error in unreleased calculation:`, error);
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