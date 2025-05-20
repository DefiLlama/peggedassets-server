import { solanaMintedOrBridged } from "../helper/getSupply";
import { PeggedIssuanceAdapter} from "../peggedAsset.type";


const chainContracts = {
    ethereum: {
        issued: "0xE868084cf08F3c3db11f4B73a95473762d9463f7", 
    },
    solana: {
        bridgedFromETH:["YUYAiJo8KVbnc6Fb6h3MnH2VGND4uGWDH4iLnw7DLEu"], 
    },
};

const adapterSolana: PeggedIssuanceAdapter = {
    solana: {
        ethereum: solanaMintedOrBridged(chainContracts.solana.bridgedFromETH, "peggedUSD"),
    },
};

import { addChainExports } from "../helper/getSupply";

const adapterOthers = addChainExports(chainContracts, undefined);

const adapter = { ...adapterOthers, ...adapterSolana };

export default adapter;