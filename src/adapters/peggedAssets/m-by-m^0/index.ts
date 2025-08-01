import { addChainExports, solanaMintedOrBridged } from "../helper/getSupply";
import { cosmosSupply } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

const M_TOKEN_ADDRESS = "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b";

/**
 * M token is the native token of M^0 protocol on Ethereum, backed by U.S. Treasuries.
 * Some M tokens are bridged to Noble (Cosmos chain) and held in custody to back USDN
 * (Noble Dollar) stablecoin at a 1:1 ratio. The bridged M tokens are not circulating
 * but serve as collateral for USDN supply.
 */

/**
 * Gets USDN supply on Noble as bridged M tokens
 * This represents M tokens that are held in custody to back USDN
 */
async function nobleUSDNAsBridgedM() {
  return cosmosSupply(
    "noble",
    ['uusdn'],
    6,
    'ethereum',
    'peggedUSD'
  );
}

const chainContracts = {
  ethereum: {
    issued: [M_TOKEN_ADDRESS],
  },
  arbitrum: {
    bridgedFromETH: [M_TOKEN_ADDRESS],
  },
  optimism: {
    bridgedFromETH: [M_TOKEN_ADDRESS],
  },
  plume_mainnet: {
    bridgedFromETH: [M_TOKEN_ADDRESS],
  },
  hyperliquid: {
    bridgedFromETH: [M_TOKEN_ADDRESS],
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, {}, { decimals: 6 }),
  solana: {
    ethereum: solanaMintedOrBridged(["mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo"]),
  },
  noble: {
    ethereum: nobleUSDNAsBridgedM(),
  },
};

export default adapter;