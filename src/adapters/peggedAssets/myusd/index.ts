import {
  PeggedIssuanceAdapter,
  ChainBlocks,
  Balances,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
import { getTotalSupply } from "../helper/cardano";

const assetIDs = {
  cardano: {
    issued: [
      "92776616f1f32c65a173392e4410a3d8c39dcf6ef768c73af164779c4d79555344",
    ],
  },
};

async function getCardanoSupply() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supply = await getTotalSupply(assetIDs.cardano.issued[0]);
    sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  cardano: {
    minted: getCardanoSupply(),
  },
};

export default adapter;
