import { addChainExports } from "../helper/getSupply";
import { getTotalSupply as stellarGetTotalSupply } from "../helper/stellar";
import {
    Balances,
    PeggedIssuanceAdapter,
  } from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";

const chainContracts = {
    ethereum: {
      issued: ["0x40caa7912437002ee2c8415d43e7f575c733674c"],
    },
};

async function stellarMinted(assetID: string) {
    return async function () {
      let balances = {} as Balances;
      const totalSupply = await stellarGetTotalSupply(assetID);
      sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
      return balances;
    };
}

const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts),
    stellar: {
      minted: stellarMinted("C1USD-GDCDFF6ZZP3HVODSVJYAN6IRNGWGPLVFKH23RY2OFHFGGVCGBXSDPKTU"),
    },
};

export default adapter;