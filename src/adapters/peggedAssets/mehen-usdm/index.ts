import {
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
import { getTotalSupply } from "../helper/cardano";

const assetIDs = {
  cardano: {
    issued: [
      "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d",
    ],
  },
};

async function getCardanoSupply() {
  let balances = {} as Balances;
  const supply = await getTotalSupply(assetIDs.cardano.issued[0]);
  sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
  return balances;
}

const adapter: PeggedIssuanceAdapter = {
  cardano: {
    minted: getCardanoSupply,
    unreleased: async () => ({}),
  },
};

export default adapter;
