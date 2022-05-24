import type { BalancesAndBridgedBalances, ChainBlocks } from "../peggedAsset.type";
const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "./generalUtil";
import { getTokenSupply as solanaGetTokenSupply } from "../llama-helper/solana";
import { totalSupply as terraGetTotalSupply } from "../llama-helper/terra"; // NOTE this is NOT currently exported
const axios = require("axios");
const retry = require("async-retry");

export async function bridgedSupply(
  chain: string,
  decimals: number,
  addresses: string[]
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as BalancesAndBridgedBalances;
    for (let address of addresses) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: address,
          block: _chainBlocks[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", totalSupply / 10 ** decimals, address, true);
    }
    return balances;
  };
}

export async function supplyInEthereumBridge(
  target: string,
  owner: string,
  decimals: number
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as BalancesAndBridgedBalances;
    const bridged = (
      await sdk.api.erc20.balanceOf({
        target: target,
        owner: owner,
        block: _ethBlock,
      })
    ).output;
    sumSingleBalance(balances, "peggedUSD", bridged / 10 ** decimals, owner, true);
    return balances;
  };
}

export async function solanaMintedOrBridged(targets: string[]) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as BalancesAndBridgedBalances;
    for (let target of targets) {
      const totalSupply = await solanaGetTokenSupply(target);
      sumSingleBalance(balances, "peggedUSD", totalSupply, target, true);
    }
    return balances;
  };
}

export async function terraSupply(addresses: string[], decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as BalancesAndBridgedBalances;
    for (let address of addresses) {
      const totalSupply = await terraGetTotalSupply(
        address,
        _chainBlocks["terra"]
      );
      sumSingleBalance(balances, "peggedUSD", totalSupply / 10 ** decimals, address, true);
    }
    return balances;
  };
}

export async function osmosisSupply(token: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as BalancesAndBridgedBalances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(`https://api-osmosis.imperator.co/tokens/v2/${token}`)
    );
    const totalSupply = res.data[0].liquidity;
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}
