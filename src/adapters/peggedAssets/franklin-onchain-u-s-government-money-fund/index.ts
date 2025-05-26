import { addChainExports } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,  ChainContracts,
} from "../peggedAsset.type";
import { getTotalSupply as stellarGetTotalSupply } from "../helper/stellar";

const chainContracts: ChainContracts = {
  polygon: {
    issued: ["0x408a634b8a8f0de729b48574a3a7ec3fe820b00a"],
  },
  arbitrum: {
    issued: ["0xb9e4765bce2609bc1949592059b17ea72fee6c6a"],
  },
  base: {
    issued: ["0x60cfc2b186a4cf647486e42c42b11cc6d571d1e4"],
  },
  avax: {
    issued: ["0xe08b4c1005603427420e64252a8b120cace4d122"]
  }
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

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
  stellar: {
    minted: stellarMinted("BENJI-GBHNGLLIE3KWGKCHIKMHJ5HVZHYIK7WTBE4QF5PLAKL4CJGSEU7HZIW5"),
  },
};

export default adapter;
