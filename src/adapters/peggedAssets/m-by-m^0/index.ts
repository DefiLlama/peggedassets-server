import { ChainApi } from "@defillama/sdk";
import { addChainExports, getApi, solanaMintedOrBridged } from "../helper/getSupply";
import { cosmosSupply } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";

const M_TOKEN_ADDRESS = "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b";
const CTUSD_ADDRESS = "0x8D82c4E3c936C7B5724A382a9c5a4E6Eb7aB6d5D";

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

/**
 * ctUSD on Citrea is fully backed 1:1 by M held in custody.
 * Since ctUSD is counted on Citrea, we subtract its totalSupply from M on
 * Ethereum to avoid double-counting the same T-bill backing.
 */
async function ctUSDBackingOffset() {
  return async function (_api: ChainApi) {
    const citreaApi = await getApi("citrea", _api);
    const balances = {} as Balances;
    const supply = await citreaApi.call({ abi: "erc20:totalSupply", target: CTUSD_ADDRESS });
    sumSingleBalance(balances, "peggedUSD", Number(supply) / 1e6);
    return balances;
  };
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
  monad: {
    bridgedFromETH: [M_TOKEN_ADDRESS],
  },
};

const baseAdapter = addChainExports(chainContracts, {}, { decimals: 6 });

const adapter: PeggedIssuanceAdapter = {
  ...baseAdapter,
  ethereum: {
    ...baseAdapter.ethereum,
    unreleased: ctUSDBackingOffset(),
  },
  solana: {
    ethereum: solanaMintedOrBridged(["mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo"]),
  },
  noble: {
    ethereum: nobleUSDNAsBridgedM(),
  },
};

export default adapter;