
import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, } from "../peggedAsset.type";
import * as sui from "../helper/sui";

async function suiMinted() {
  return async function (): Promise<Balances> {
    let balances = {} as Balances;
    const { fields: amount } = await sui.getObject('0x80954159a8616660f73468919a2f372dcc9ac366931d50c1e378f0f5e342dfa5');
    const mintedAmount = amount.treasury_cap.fields.total_supply.fields.value;

    sumSingleBalance(balances, "peggedUSD", mintedAmount / 10 ** 6, undefined, true);
    return balances;
  };
}


export default {
  sui: {
    minted: suiMinted(),
  },
}