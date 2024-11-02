import { PeggedIssuanceAdapter } from "../peggedAsset.type";
import { solanaMintedOrBridged } from "../helper/getSupply";

const adapter: PeggedIssuanceAdapter = {
  solana: {
    minted: solanaMintedOrBridged([
      "susdabGDNbhrnCa6ncrYo81u4s9GM8ecK2UwMyZiq4X",
    ]),
  },
};

export default adapter;