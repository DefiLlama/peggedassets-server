import {
  PeggedIssuanceAdapter,
  ChainBlocks,
  Balances,  ChainContracts,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
import { getTotalSupply } from "../helper/cardano";

const assetIDs = {
  cardano: {
    issued: [
      "cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc678652656465656d61626c65",
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
