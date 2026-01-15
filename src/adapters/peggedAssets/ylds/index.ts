import { addChainExports, cosmosSupply, solanaMintedOrBridged } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

function provenanceSupply() {
    return cosmosSupply("provenance", ['uylds.fcc'], 6, '', 'peggedUSD');
}

const chainContracts = {
    sui: {
        issued: ['0x08b5e9f5caa91bdeb119ce6fb044d44a533fd856bcecaa74fc705852d709f200::ylds::YLDS']
    }
}

const solanawYLDSContract = ['8fr7WGTVFszfyNWRMXj6fRjZZAnDwmXwEpCrtzmUkdih']

// Use `addChainExports` to generate the final adapter with combined logic
const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts),
    provenance: {
        minted: provenanceSupply(),
    },
    solana: {
        provenance: solanaMintedOrBridged(solanawYLDSContract)
    }
};

export default adapter;
