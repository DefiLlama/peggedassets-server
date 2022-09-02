import type {
  Balances,
  ChainBlocks,
  PeggedAssetType,
} from "../peggedAsset.type";
const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "./generalUtil";
import { getTokenSupply as solanaGetTokenSupply } from "../llama-helper/solana";
import { totalSupply as terraGetTotalSupply } from "../llama-helper/terra"; // NOTE this is NOT currently exported
const axios = require("axios");
const retry = require("async-retry");

type BridgeAndReserveAddressPair = [string, string[]];

export async function bridgedSupply(
  chain: string,
  decimals: number,
  addresses: string[],
  bridgeName?: string,
  bridgedFromChain?: string,
  pegType?: PeggedAssetType
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    let assetPegType = pegType ? pegType : ("peggedUSD" as PeggedAssetType);
    for (let address of addresses) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: address,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      bridgeName
        ? sumSingleBalance(
            balances,
            assetPegType,
            totalSupply / 10 ** decimals,
            bridgeName,
            false,
            bridgedFromChain
          )
        : sumSingleBalance(
            balances,
            assetPegType,
            totalSupply / 10 ** decimals,
            address,
            true
          );
    }
    return balances;
  };
}

export async function bridgedSupplySubtractReserve(
  chain: string,
  decimals: number,
  bridgeAndReserveAddresses: BridgeAndReserveAddressPair,
  bridgeName?: string,
  bridgedFromChain?: string,
  pegType?: PeggedAssetType
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    let assetPegType = pegType ? pegType : ("peggedUSD" as PeggedAssetType);
    let sum = 0;
    const bridgeAddress = bridgeAndReserveAddresses[0];
    const reserveAddresses = bridgeAndReserveAddresses[1];
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: bridgeAddress,
        block: _chainBlocks?.[chain],
        chain: chain,
      })
    ).output;
    sum += totalSupply;
    for (let reserve of reserveAddresses) {
      const totalReserve = reserve
        ? (
            await sdk.api.erc20.balanceOf({
              target: bridgeAddress,
              owner: reserve,
              block: _chainBlocks?.[chain],
              chain: chain,
            })
          ).output
        : 0;
      sum -= totalReserve;
    }
    bridgeName
      ? sumSingleBalance(
          balances,
          assetPegType,
          sum / 10 ** decimals,
          bridgeName,
          false,
          bridgedFromChain
        )
      : sumSingleBalance(
          balances,
          assetPegType,
          sum / 10 ** decimals,
          bridgeAddress,
          true
        );
    return balances;
  };
}

export async function supplyInEthereumBridge(
  target: string,
  owner: string,
  decimals: number,
  pegType?: PeggedAssetType
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    let assetPegType = pegType ? pegType : ("peggedUSD" as PeggedAssetType);
    const bridged = (
      await sdk.api.erc20.balanceOf({
        target: target,
        owner: owner,
        block: _ethBlock,
      })
    ).output;
    sumSingleBalance(
      balances,
      assetPegType,
      bridged / 10 ** decimals,
      owner,
      true
    );
    return balances;
  };
}

export async function solanaMintedOrBridged(targets: string[], pegType?: PeggedAssetType) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks,
  ) {
    let balances = {} as Balances;
    let assetPegType = pegType ? pegType : ("peggedUSD" as PeggedAssetType);
    for (let target of targets) {
      const totalSupply = await solanaGetTokenSupply(target);
      sumSingleBalance(balances, assetPegType, totalSupply, target, true);
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
    let balances = {} as Balances;
    for (let address of addresses) {
      const totalSupply = await terraGetTotalSupply(
        address,
        _chainBlocks?.["terra"]
      );
      sumSingleBalance(
        balances,
        "peggedUSD",
        totalSupply / 10 ** decimals,
        address,
        true
      );
    }
    return balances;
  };
}

export async function osmosisSupply(token: string, bridgeName: string, bridgedFrom: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(`https://api-osmosis.imperator.co/tokens/v2/${token}`)
    );
    const totalSupply = res.data[0].liquidity;
    sumSingleBalance(balances, "peggedUSD", totalSupply, bridgeName, false, bridgedFrom);
    return balances;
  };
}
