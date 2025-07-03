import { addChainExports, solanaMintedOrBridged } from "../helper/getSupply";
import { ChainApi } from "@defillama/sdk";
import { cosmosSupply } from "../helper/getSupply";
import { PeggedIssuanceAdapter, Balances, ChainBlocks } from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";

const M_TOKEN_ADDRESS = "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b";

/**
 * M token is the native token of M^0 protocol on Ethereum, backed by U.S. Treasuries.
 * Some M tokens are bridged to Noble (Cosmos chain) and held in custody to back USDN
 * (Noble Dollar) stablecoin at a 1:1 ratio. The bridged M tokens are not circulating
 * but serve as collateral for USDN supply.
 */

/**
 * Gets the circulating M token supply by subtracting USDN supply from total M supply
 * This reflects that M tokens backing USDN are held in custody and not circulating
 */
async function ethereumCirculatingM() {
  return async function (api: ChainApi) {
    let balances = {} as Balances;
    
    // Get total M token supply and decimals on Ethereum
    const [totalMSupply, decimals] = await Promise.all([
      api.call({ 
        abi: "erc20:totalSupply", 
        target: M_TOKEN_ADDRESS 
      }),
      api.call({
        abi: "erc20:decimals",
        target: M_TOKEN_ADDRESS
      })
    ]);
    
    // Get USDN supply on Noble (which equals the M tokens held in custody)
    const usdnSupplyFunction = cosmosSupply(
      "noble",
      ['uusdn'],
      6,
      '',
      'peggedUSD'
    );
    
    // Call the USDN supply function with required parameters
    const usdnSupply = await usdnSupplyFunction(
      Math.floor(Date.now() / 1000), // timestamp
      0, // ethBlock (not used for cosmos)
      {} as ChainBlocks // chainBlocks
    );
    
    // Calculate circulating M supply = total M supply - USDN supply
    const usdnAmount = typeof usdnSupply.peggedUSD === 'string' 
      ? parseFloat(usdnSupply.peggedUSD) 
      : (usdnSupply.peggedUSD as number) || 0;
    
    const totalMSupplyFormatted = totalMSupply / 10 ** decimals;
    const circulatingMSupply = totalMSupplyFormatted - usdnAmount;
    
    // Debug logging
    console.log('DEBUG M Token Calculation:');
    console.log('  Total M Supply (Ethereum):', totalMSupplyFormatted);
    console.log('  Decimals (Ethereum):', decimals);
    console.log('  USDN Supply (Noble):', usdnAmount);
    console.log('  Circulating M Supply:', circulatingMSupply);
    console.log('  USDN Supply Raw:', usdnSupply.peggedUSD);
    
    sumSingleBalance(balances, "peggedUSD", circulatingMSupply, "issued", false);
    return balances;
  };
}

/**
 * Gets USDN supply on Noble as bridged M tokens
 * This represents M tokens that are held in custody to back USDN
 */
function nobleUSDNAsBridgedM() {
  return cosmosSupply(
    "noble",
    ['uusdn'],
    6,
    '',
    'peggedUSD'
  );
}

// Use addChainExports for chains that can follow the standard pattern
const chainContracts = {
  arbitrum: {
    bridgedFromEthereum: [M_TOKEN_ADDRESS],
  },
  optimism: {
    bridgedFromEthereum: [M_TOKEN_ADDRESS],
  },
  plume_mainnet: {
    bridgedFromEthereum: [M_TOKEN_ADDRESS],
  },
  hyperliquid: {
    bridgedFromEthereum: [M_TOKEN_ADDRESS],
  },
};

// Create the adapter using addChainExports for standard chains
const adapter = addChainExports(chainContracts, {}, { decimals: 6 });

// Add custom ethereum function for circulating supply calculation
adapter.ethereum = {
  minted: ethereumCirculatingM(),
  unreleased: async () => ({}), // no unreleased tokens
};

adapter.solana = {
  ethereum: solanaMintedOrBridged(["mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo"])
};

adapter.noble = {
  bridgedFromEthereum: nobleUSDNAsBridgedM(),
};

export default adapter;