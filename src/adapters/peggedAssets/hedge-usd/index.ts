import { PeggedIssuanceAdapter } from "../peggedAsset.type";
import { solanaMintedOrBridged } from "../helper/getSupply";

const adapter: PeggedIssuanceAdapter = {
  solana: {
    minted: solanaMintedOrBridged(["9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6"]),
    unreleased: async () => ({}),
  },
};

export default adapter;