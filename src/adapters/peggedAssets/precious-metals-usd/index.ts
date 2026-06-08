import { PeggedIssuanceAdapter } from "../peggedAsset.type";
import { addChainExports } from "../helper/getSupply";

const chainContracts = {
    ethereum: {
        issued: [
            "0xc0c17dd08263c16f6b64e772fb9b723bf1344ddf" // pmUSD contract
        ], 
        unreleased: []
    }
}

const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts, undefined)
}

export default adapter;

