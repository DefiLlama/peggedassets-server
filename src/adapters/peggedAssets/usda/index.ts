import {
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
import { getTotalSupply } from "../helper/cardano";

const assetIDs = {
  cardano: {
    issued: [
      "fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441",
    ],
  },
};

async function getCardanoSupply() {
  let balances: Balances = {};
  const supply = await getTotalSupply(assetIDs.cardano.issued[0]);
  sumSingleBalance(balances, "peggedUSD", supply, "issued", false);

  return balances;
}

const adapter: PeggedIssuanceAdapter = {
  cardano: {
    minted: getCardanoSupply,
  },
};

export default adapter;
