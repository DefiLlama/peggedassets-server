import { getTetherTransparency, sumSingleBalance } from "../helper/generalUtil";

import {
  Balances,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

async function usdtApiMinted(key: string) {
  // would be better to replace with different api or on-chain calls
  return async function () {
    let balances = {} as Balances;
    const res = await getTetherTransparency();
    const issuance = res.data.mxnt;
    const totalSupply = parseInt(issuance[key]);
    sumSingleBalance(balances, "peggedMXN", totalSupply, "issued", false);
    return balances;
  };
}

async function usdtApiUnreleased(key: string) {
  return async function () {
    let balances = {} as Balances;
    const res = await getTetherTransparency();
    const issuance = res.data.mxnt;
    const totalSupply = parseInt(issuance[key]);
    sumSingleBalance(balances, "peggedMXN", totalSupply);
    return balances;
  };
}


const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: usdtApiMinted("totaltokens_eth"),
    unreleased: usdtApiUnreleased("reserve_balance_eth"),
  },
};

export default adapter;

