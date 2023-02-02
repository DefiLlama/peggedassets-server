import {
  PeggedIssuanceAdapter,
  ChainBlocks,
  Balances
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
import { getTotalSupply, getTokenBalance } from "../helper/cardano";

const assetIDs = {
  cardano: {
    issued: ["8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344"],
  },
};

async function getCardanoSupply() {
  let balances = {} as Balances;
  let supply = await getTotalSupply(assetIDs.cardano.issued[0])
  const lockedBalance = (await getTokenBalance('8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344', 'addr1z8297ay4dlcdngmat86080adn8f8jlvveammehrunpx60aqm5kjdmrpmng059yellupyvwgay2v0lz6663swmds7hp0qnm8ly0')) / 1e6
  supply -= lockedBalance
  sumSingleBalance(
    balances,
    "peggedUSD",
    supply,
    "issued",
    false
  );

  return balances
}

const adapter: PeggedIssuanceAdapter = {
  cardano: {
    minted: getCardanoSupply,
    unreleased: async () => ({}),
  },
};

export default adapter;