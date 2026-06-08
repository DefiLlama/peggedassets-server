import { cosmosSupply } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

const iUSDDenom =
  "move/6c69733a9e722f3660afb524f89fce957801fa7e4408b8ef8fe89db9627b570e";

function initiaSupply() {
  return cosmosSupply("initia", [iUSDDenom], 6, "", "peggedUSD");
}

const adapter: PeggedIssuanceAdapter = {
  initia: {
    minted: initiaSupply(),
    unreleased: async () => ({}),
  },
};

export default adapter;
