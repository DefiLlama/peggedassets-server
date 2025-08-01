import { solanaMintedOrBridged, addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter, ChainContracts } from "../peggedAsset.type";

const chainContracts: ChainContracts = {
    ethereum: {
        issued: ["0xE868084cf08F3c3db11f4B73a95473762d9463f7"],
    },
    solana: {
        issued: ["YUYAiJo8KVbnc6Fb6h3MnH2VGND4uGWDH4iLnw7DLEu"],
    },
};

const adapterSolana: PeggedIssuanceAdapter = {
    solana: {
        minted: solanaMintedOrBridged(chainContracts.solana.issued),
    },
};

const adapterOthers = addChainExports(chainContracts);

const adapter = { ...adapterOthers, ...adapterSolana };

export default adapter;