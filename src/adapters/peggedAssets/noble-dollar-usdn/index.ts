import { cosmosSupply } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

function nobleSupply() {
  return cosmosSupply(
    "noble",           // chain name
    ['uusdn'],         // token denomination 
    6,                 // decimals
    '',                // prefix
    'peggedUSD'        // peg type
  );
}

/**
 * USDN (Noble Dollar) is backed 1:1 by M tokens that are bridged from Ethereum to Noble
 * and held in custody. The backing mechanism works as follows:
 * 
 * 1. M tokens are minted on Ethereum by M^0 Minters
 * 2. To mint USDN, M tokens are bridged from Ethereum to Noble (Cosmos chain)
 * 3. The bridged M tokens are held in custody/escrow on Noble
 * 4. An equal amount of USDN is minted on Noble, backed by the custodied M tokens
 * 5. The M tokens are not circulating but serve as 1:1 collateral for USDN
 * 
 * This adapter tracks the USDN supply on Noble. The backing M tokens are tracked
 * separately in the M token adapter (m-by-m^0), and the USDN supply is subtracted
 * from the total M supply to show the actual circulating M tokens.
 */
const adapter: PeggedIssuanceAdapter = {
  noble: {
    minted: nobleSupply(),
    unreleased: async () => ({}), // no unreleased tokens
  },
};

export default adapter;