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

const adapter: PeggedIssuanceAdapter = {
  noble: {
    minted: nobleSupply(),
    unreleased: async () => ({}), // no unreleased tokens
  },
};

export default adapter;