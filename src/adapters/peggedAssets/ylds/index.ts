import { addChainExports, cosmosSupply, solanaMintedOrBridged } from "../helper/getSupply";
import { Balances, ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
import { getTotalSupply as stellarGetTotalSupply } from "../helper/stellar";
import { sumSingleBalance } from "../helper/generalUtil";

function provenanceSupply() {
    return cosmosSupply("provenance", ['uylds.fcc'], 6, '', 'peggedUSD');
}

async function stellarMinted(assetID: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await stellarGetTotalSupply(assetID);
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

const solanawYLDSContract = ['8fr7WGTVFszfyNWRMXj6fRjZZAnDwmXwEpCrtzmUkdih']
const stellarYLDSAsset = 'YLDS:GAC7MOPTQLQUM3KC24AW4GHS3RLF72LPEZO54AH7EZ6TSMGRB5SOAVH3'

const chainContracts = {
    sui: {
        issued: ['0x08b5e9f5caa91bdeb119ce6fb044d44a533fd856bcecaa74fc705852d709f200::ylds::YLDS']
    }
}

// Use `addChainExports` to generate the final adapter with combined logic
const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts),
    provenance: {
        minted: provenanceSupply(),
    },
    stellar: {
        minted: stellarMinted(stellarYLDSAsset)
    },
    solana: {
        provenance: solanaMintedOrBridged(solanawYLDSContract)
    }
};

export default adapter;
