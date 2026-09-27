import { chains } from "@defillama/sdk";
import { sumSingleBalance } from "../helper/generalUtil";
import { osmosisSupply } from "../helper/getSupply";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,  ChainContracts,
} from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  osmosis: {
    bridgedFromKujira: [
      "ibc/44492EAB24B72E3FB59B9FA619A22337FB74F95D8808FE6BC78CC0E6C18DC2EC",
    ],
  },
};

const USK_DENOM = "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk";

// bank total supply of the USK token factory denom on Kujira
async function kujiraMinted(decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const amount = await chains.cosmos.totalSupply({ chain: "kujira", denom: USK_DENOM });
    const supply = Number(amount) / 10 ** decimals;
    sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  kujira: {
    minted: kujiraMinted(6),
  },
  osmosis: {
    kujira: osmosisSupply(
      chainContracts.osmosis.bridgedFromKujira,
      6,
      "Kujira"
    ),
  },
};

export default adapter;
