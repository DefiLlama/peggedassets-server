import {PeggedIssuanceAdapter} from "../peggedAsset.type";
import {solanaMintedOrBridged} from "../helper/getSupply";

const adapter: PeggedIssuanceAdapter = {
    solana: {
        minted: async () => ({
            peggedUSD: solanaMintedOrBridged([
                "9ckR7pPPvyPadACDTzLwK2ZAEeUJ3qGSnzPs8bVaHrSy",
            ]),
        })
    },
};

export default adapter;