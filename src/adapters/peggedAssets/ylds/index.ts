import { addChainExports, bridgedSupply, cosmosSupply, solanaMintedOrBridged } from "../helper/getSupply";
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
    console.log("stellar", balances)
    return balances;
  };
}

const chainContracts = {
    stellar: {
        issued: ['YLDS:GAC7MOPTQLQUM3KC24AW4GHS3RLF72LPEZO54AH7EZ6TSMGRB5SOAVH3']
    }
}

// Use `addChainExports` to generate the final adapter with combined logic
const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts),
    provenance: { minted: provenanceSupply() },
    stellar: { minted: stellarMinted(chainContracts.stellar.issued[0]) },
};

export default adapter;
