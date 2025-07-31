const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";
import { getTotalSupply as tezosGetTotalSupply } from "../helper/tezos";


const chainContracts: ChainContracts = {
  tezos: {
    issued: ["KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW"],
  },
};

async function tezosMinted(tokenID: string) {
  return async function () {
    let balances = {} as Balances;
    const totalSupply = await tezosGetTotalSupply(tokenID);
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  tezos: {
    minted: tezosMinted(chainContracts.tezos.issued[0]),
  },
};

export default adapter;
