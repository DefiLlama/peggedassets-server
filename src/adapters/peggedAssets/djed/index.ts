import {
    PeggedIssuanceAdapter,
    ChainBlocks,
    Balances
  } from "../peggedAsset.type";
  import { sumSingleBalance } from "../helper/generalUtil";
  import { getTotalSupply } from "../helper/cardano";
  
  const assetIDs = {
    cardano: {
      issued: ["8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344"],
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