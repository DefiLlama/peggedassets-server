const sdk = require("@defillama/sdk");
import { addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts = {
    solana: {
        issued: ['8fr7WGTVFszfyNWRMXj6fRjZZAnDwmXwEpCrtzmUkdih']
    }
}

// Use `addChainExports` to generate the final adapter with combined logic
const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts),
};

export default adapter;
