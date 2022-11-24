import {
  PeggedIssuanceAdapter,
  ChainBlocks,
  Balances
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
import { getTotalSupply } from "../helper/cardano";

const assetIDs = {
  cardano: {
    issued: ["f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344"],
  },
};

async function getCardanoSupply() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
  const supply = await getTotalSupply(assetIDs.cardano.issued[0])
  sumSingleBalance(
    balances,
    "peggedUSD",
    supply,
    "issued",
    false
  );
  return balances
  }
}

const adapter: PeggedIssuanceAdapter = {
  cardano: {
    minted: getCardanoSupply(),
    unreleased: async () => ({}),
  },
};

export default adapter;
