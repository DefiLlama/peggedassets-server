const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import * as sui from "../helper/sui";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
  ChainContracts,
} from "../peggedAsset.type";
import { solanaMintedOrBridged } from "../helper/getSupply";

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409"],
    busdcollateral: ["0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"], // binance-peg collaterals
  },
  bsc: {
    issued: ["0xc5f0f7b66764f6ec8c8dff7ba683102295e16409"],
  },
  solana: {
    issued: ["9zNQRsGLjNKwCUU5Gq5LR8beUCPzQMVMqKAi3SSZh54u"]
  }
};

async function suiMinted(): Promise<Balances> {
  let balances = {} as Balances;
  const supply = await sui.getTokenSupply(
    "0xf16e6b723f242ec745dfd7634ad072c42d5c1d9ac9d62a39c381303eaa57693a::fdusd::FDUSD"
  );
  sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
  return balances;
}

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedUSD",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

async function binancePegCollaterals(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const reserve = (
      await sdk.api.erc20.balanceOf({
        target: chainContracts[chain].issued[0],
        owner: chainContracts[chain].busdcollateral[0],
        block: _chainBlocks?.[chain],
        chain: chain,
      })
    ).output;
    sumSingleBalance(
      balances,
      "peggedUSD",
      reserve / 10 ** decimals,
      "issued",
      false
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: binancePegCollaterals("ethereum", 18),
  },
  bsc: {
    minted: chainMinted("bsc", 18),
  },
  sui: {
    minted: suiMinted,
  },
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued),
  }
};

export default adapter;
