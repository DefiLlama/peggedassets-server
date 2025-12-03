import {PeggedIssuanceAdapter} from "../peggedAsset.type";
import {addChainExports, solanaMintedOrBridged, bridgedSupply} from "../helper/getSupply";

const chainContracts = {
    bsc: {
        bridgedFromSol: "0xeA953eA6634d55dAC6697C436B1e81A679Db5882",
    },
}

const adapter: PeggedIssuanceAdapter = {
    bsc: {
        solana: bridgedSupply("bsc", 18, [chainContracts.bsc.bridgedFromSol]),
    },

    solana: {
        issued: solanaMintedOrBridged(["9ckR7pPPvyPadACDTzLwK2ZAEeUJ3qGSnzPs8bVaHrSy",]),
    },
};
export default adapter;