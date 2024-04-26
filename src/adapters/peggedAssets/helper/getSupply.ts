import type {
  Balances,
  ChainBlocks,
  PeggedAssetType,  ChainContracts,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "./generalUtil";
import { getTokenSupply as solanaGetTokenSupply } from "../llama-helper/solana";
import { totalSupply as terraGetTotalSupply } from "../llama-helper/terra"; // NOTE this is NOT currently exported
import { ChainApi } from "@defillama/sdk";
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

export async function solanaMintedOrBridged(
  targets: string[],
  pegType?: PeggedAssetType
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
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

export async function osmosisLiquidity(
  token: string,
  bridgeName: string,
  bridgedFrom: string
) {
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
    const totalLiquidity = res.data[0].liquidity;
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalLiquidity,
      bridgeName,
      false,
      bridgedFrom
    );
    return balances;
  };
}

export async function cosmosSupply(
  chain: string,
  tokens: string[],
  decimals: number,
  bridgedFromChain: string
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let token of tokens) {
      const res = await retry(
        async (_bail: any) =>
          await axios.get(
            `https://rest.cosmos.directory/${chain}/cosmos/bank/v1beta1/supply/by_denom?denom=${token}`
          )
      );
      sumSingleBalance(
        balances,
        "peggedUSD",
        parseInt(res.data.amount.amount) / 10 ** decimals,
        token,
        false,
        bridgedFromChain
      );
    }
    return balances;
  };
}

export async function osmosisSupply(
  tokens: string[],
  decimals: number,
  bridgedFromChain: string
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let token of tokens) {
      const res = await retry(
        async (_bail: any) =>
          await axios.get(
            `https://lcd.osmosis.zone/osmosis/superfluid/v1beta1/supply?denom=${token}`
          )
      );
      sumSingleBalance(
        balances,
        "peggedUSD",
        parseInt(res.data.amount.amount) / 10 ** decimals,
        token,
        false,
        bridgedFromChain
      );
    }
    return balances;
  };
}

export async function kujiraSupply(
  tokens: string[],
  decimals: number,
  bridgedFromChain: string
) {
  return cosmosSupply("kujira", tokens, decimals, bridgedFromChain);
}

// const dummyFn = () => ({})

export function addChainExports(config: any, adapter: any = {}, {
  decmials = 18, pegType,
}: {
  decmials?: number
  pegType?: string
} = {}): PeggedIssuanceAdapter {
  Object.entries(config).forEach(([chain, chainConfig]: [string, any]) => {
    if (!adapter[chain])
      adapter[chain] = {};
    if (pegType) chainConfig.pegType = pegType;

    const cExports = adapter[chain]
    Object.keys(chainConfig).forEach((key) => {
      switch (key) {
        case "issued":
          if (!cExports.minted)
            cExports.minted = getIssued(chainConfig)
          break;
        case "unreleased":
          if (!cExports.unreleased)
            cExports.unreleased = getUnreleased(chainConfig)
          break;
        case "bridgedFromETH":
          if (!Array.isArray(chainConfig.bridgedFromETH)) chainConfig.bridgedFromETH = [chainConfig.bridgedFromETH]
          if (!cExports.ethereum)
            cExports.ethereum = bridgedSupply(chain, decmials, chainConfig.bridgedFromETH)
          break;
        default: console.log(`Ignored: Unknown key ${key} in ${chain} config for addChainExports`)
      }
    })
    // if (!cExports.minted) cExports.minted = dummyFn
    // if (!cExports.unreleased) cExports.unreleased = dummyFn;
  })
  return adapter
}

function getIssued({
  issued, pegType = "peggedUSD", issuedABI = "erc20:totalSupply",
}: { issued: string[] | string, pegType: PeggedAssetType, issuedABI: string }) {
  return async (api: ChainApi) => {
    const balances = {} as Balances;
    if (typeof issued === "string") issued = [issued];
    const supplies = await api.multiCall({ abi: issuedABI, calls: issued })
    const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: issued })
    issued.forEach((_address, i) => {
      sumSingleBalance(balances, pegType, supplies[i] / 10 ** decimals[i], 'issued', false);
    })

    return balances;
  }
}

function getUnreleased({
  issued, pegType = "peggedUSD", unreleased,
}: { issued: string[] | string, pegType: PeggedAssetType, issuedABI: string, unreleased: string[] | string, }) {
  return async (api: ChainApi) => {
    const balances = {} as Balances;
    if (typeof issued === "string") issued = [issued];
    if (typeof unreleased === "string") unreleased = [unreleased]
    const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: issued })
    for (let i = 0; i < issued.length; i++) {
      const totalSupply = await api.multiCall({ abi: 'erc20:balanceOf', target: issued[i], calls: unreleased })
      for (const supply of totalSupply)
        sumSingleBalance(balances, pegType, supply / 10 ** decimals[i]);
    }

    return balances;
  }
}
