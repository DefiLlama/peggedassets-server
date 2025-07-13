import {
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
import { getTotalSupply } from "../helper/cardano";

const assetIDs = {
  cardano: {
    issued: [
      "25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff9355059555344",
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
