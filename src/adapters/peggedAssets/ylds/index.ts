const sdk = require("@defillama/sdk");
import { cosmosSupply } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

function provenanceSupply() {
    return cosmosSupply("provenance", ['uylds.fcc'], 6, '', 'peggedUSD');
}

// Use `addChainExports` to generate the final adapter with combined logic
const adapter: PeggedIssuanceAdapter = {
    provenance: {
        minted: provenanceSupply()
    },
};

export default adapter;
