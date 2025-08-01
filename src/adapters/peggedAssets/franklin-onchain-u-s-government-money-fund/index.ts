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
  },
  ethereum: {
    issued: ["0x3DDc84940Ab509C11B20B76B466933f40b750dc9"]
  },
  solana: {
    issued: ["5Tu84fKBpe9vfXeotjvfvWdWbAjy3hqsExvuHgFqFxA1"]
  },
  aptos: {
    issued: ["0x7b5e9cac3433e9202f28527f707c89e1e47b19de2c33e4db9521a63ad219b739"]
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
