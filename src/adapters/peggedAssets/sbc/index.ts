import { addChainExports } from "../helper/getSupply";
import { getTotalSupply as stellarGetTotalSupply } from "../helper/stellar";
import {
    Balances,
    PeggedIssuanceAdapter,
  } from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";

const chainContracts = {
    ethereum: {
      issued: ["0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16"],
    },
    ethereumclassic: {
        issued: ["0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798"],
    },
    arbitrum: {
        issued: ["0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798"],
    },
    avax: {
        issued: ["0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16"],
    },
    base: {
        issued: ["0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798"],
    }, 
    celo: {
        issued: ["0xDE093684c796204224BC081f937aa059D903c52a"],
    }, 
    optimism: {
        issued: ["0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16"],
    }, 
    polygon: {
        issued: ["0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798"],
    }, 
    solana: {
        issued: ["DBAzBUXaLj1qANCseUPZz4sp9F8d2sc78C4vKjhbTGMA"],
    }
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
      minted: stellarMinted("SBC-GCQCNWT22JDLENQAVIE6DRJGHWAQ6EX2H5ABGPV55EJUPPZM5UA7KHZR"),
    },
  };

  export default adapter;