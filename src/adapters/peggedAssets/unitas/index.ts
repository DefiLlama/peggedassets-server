import {PeggedIssuanceAdapter} from "../peggedAsset.type";
import {addChainExports, solanaMintedOrBridged} from "../helper/getSupply";

const chainContracts = {
    bsc: {
        bridgedFromETH: "0xeA953eA6634d55dAC6697C436B1e81A679Db5882",
    },
}

const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts),

    solana: {
        issued: solanaMintedOrBridged(["9ckR7pPPvyPadACDTzLwK2ZAEeUJ3qGSnzPs8bVaHrSy",]),
    },
};

export default adapter;