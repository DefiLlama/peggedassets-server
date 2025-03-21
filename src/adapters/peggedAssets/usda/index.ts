import {
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
import { getTotalSupply } from "../helper/cardano";

const assetIDs = {
  cardano: {
    issued: [
      "", // policy id
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
