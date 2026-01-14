const sdk = require("@defillama/sdk");
import { addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts = {
    solana: {
        issued: ['3b8X44fLF9ooXaUm3hhSgjpmVs6rZZ3pPoGnGahc3Uu7']
    }
}

// Use `addChainExports` to generate the final adapter with combined logic
const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts, undefined, {
        pegType: 'peggedVAR',
    }),
};

export default adapter;
