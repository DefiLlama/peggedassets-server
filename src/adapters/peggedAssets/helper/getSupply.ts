import { ChainApi, chains } from "@defillama/sdk";
import * as aptos from "../helper/aptos";
import * as cardano from "../helper/cardano";
import { getTokenSupply as solanaGetTokenSupply, getTokenBalance as solanaGetTokenBalance } from "../helper/solana";
import * as sui from "../helper/sui";
import * as tezos from "../helper/tezos";
import * as stellar from "../helper/stellar";
import { getTotalSupply as tronGetTotalSupply, getTokenBalance as tronGetTokenBalance } from "../helper/tron";
import * as starknet from "../helper/starknet";
import { getZilliqaTokenSupply } from "../helper/zilliqa";
import type {
  Balances,
  ChainBlocks,
  PeggedAssetType,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
import { sumSingleBalance } from "./generalUtil";
const axios = require("axios");
const retry = require("async-retry");
process.env.TAIKO_RPC = 'https://rpc.taiko.xyz'
process.env.REAL_RPC = 'https://tangible-real.gateway.tenderly.co'
process.env.STRATO_RPC = process.env.STRATO_RPC || 'https://noderpc.strato.nexus/rpc'
process.env.ROBINHOOD_RPC = process.env.ROBINHOOD_RPC || 'https://rpc.mainnet.chain.robinhood.com'
process.env.ARC_RPC = process.env.ARC_RPC || 'https://rpc.mainnet.arc.io'
process.env.ARC_RPC_CHAIN_ID = process.env.ARC_RPC_CHAIN_ID || '5042'
process.env.ARC_ARCHIVAL_RPC = process.env.ARC_ARCHIVAL_RPC || 'https://explorer.arc.io/api/eth-rpc'

type BridgeAndReserveAddressPair = [string, string[]];

const tweleveHoursAgo = () => Math.round(Date.now() / 1000) - 12 * 60 * 60;

export async function getApi(chain: string, _api: ChainApi) {
  if (chain === _api.chain) return _api;
  const api = new ChainApi({ chain });
  if (_api.timestamp && _api.timestamp < tweleveHoursAgo()) await api.getBlock()
  return api;
}

export function bridgedSupply(
  chain: string,
  decimals: number,
  addresses: string[],
  bridgeName?: string,
  bridgedFromChain?: string,
  pegType?: PeggedAssetType
): any {
  return async function (_api: ChainApi) {
    const api = await getApi(chain, _api)
    let balances = {} as Balances;
    let assetPegType = pegType ? pegType : ("peggedUSD" as PeggedAssetType);
    const supplies = await api.multiCall({ abi: "erc20:totalSupply", calls: addresses, });
    for (let i = 0; i < supplies.length; i++) {
      bridgeName
        ? sumSingleBalance(balances, assetPegType, supplies[i] / 10 ** decimals, bridgeName, false, bridgedFromChain)
        : sumSingleBalance(balances, assetPegType, supplies[i] / 10 ** decimals, addresses[i], true);
    }
    return balances;
  };
}

export function bridgedSupplySubtractReserve(
  chain: string,
  decimals: number,
  bridgeAndReserveAddresses: BridgeAndReserveAddressPair,
  bridgeName?: string,
  bridgedFromChain?: string,
  pegType?: PeggedAssetType
) {
  return async function (_api: ChainApi) {
    const api = await getApi(chain, _api)
    let balances = {} as Balances;
    let assetPegType = pegType ? pegType : ("peggedUSD" as PeggedAssetType);
    let sum = 0;
    const bridgeAddress = bridgeAndReserveAddresses[0];
    const reserveAddresses = bridgeAndReserveAddresses[1];
    const totalSupply = await api.call({ abi: "erc20:totalSupply", target: bridgeAddress, })
    sum += +totalSupply;
    const tokenBals = await api.multiCall({ abi: 'erc20:balanceOf', calls: reserveAddresses, target: bridgeAddress, })
    tokenBals.forEach((bal) => sum -= +bal);
    bridgeName
      ? sumSingleBalance(balances, assetPegType, sum / 10 ** decimals, bridgeName, false, bridgedFromChain)
      : sumSingleBalance(balances, assetPegType, sum / 10 ** decimals, bridgeAddress, true);
    return balances;
  };
}

export function supplyInEthereumBridge(
  target: string,
  owner: string,
  decimals: number,
  pegType?: PeggedAssetType
) {
  return async function (_api: ChainApi) {
    const api = await getApi('ethereum', _api)
    let balances = {} as Balances;
    let assetPegType = pegType ? pegType : ("peggedUSD" as PeggedAssetType);
    const bridged = await api.call({ abi: 'erc20:balanceOf', target: target, params: owner, })
    sumSingleBalance(balances, assetPegType, bridged / 10 ** decimals, owner, true);
    return balances;
  };
}

export function supplyInArbitrumBridge(
  target: string,
  owner: string,
  decimals: number,
  pegType?: PeggedAssetType
) {
  return async function (_api: ChainApi) {
    const api = await getApi('arbitrum', _api)
    let balances = {} as Balances;
    let assetPegType = pegType ? pegType : ("peggedUSD" as PeggedAssetType);
    const bridged = await api.call({ abi: 'erc20:balanceOf', target: target, params: owner, })
    sumSingleBalance(balances, assetPegType, bridged / 10 ** decimals, owner, true);
    return balances;
  };
}

export function solanaMintedOrBridged(
  targets: string[],
  pegType?: PeggedAssetType
) {
  return async function () {
    let balances = {} as Balances;
    let assetPegType = pegType ? pegType : ("peggedUSD" as PeggedAssetType);
    for (let target of targets) {
      const totalSupply = await solanaGetTokenSupply(target);
      sumSingleBalance(balances, assetPegType, totalSupply, target, true);
    }
    return balances;
  };
}

export function fogoMintedOrBridged(targets: string[], pegType?: PeggedAssetType) {
  return async function () {
    let balances = {} as Balances;
    let assetPegType = pegType ? pegType : ("peggedUSD" as PeggedAssetType);
    for (let target of targets) {
      const totalSupply = await solanaGetTokenSupply(target, "fogo");
      sumSingleBalance(balances, assetPegType, totalSupply, target, true);
    }
    return balances;
  };
}

export function zilliqaMintedOrBridged(
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
      const totalSupply = await getZilliqaTokenSupply(target);
      sumSingleBalance(balances, assetPegType, totalSupply, target, true);
    }
    return balances;
  };
}

export function tonTokenSupply(address: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const { supply } = await chains.ton.getJettonSupply({ address });
    sumSingleBalance(balances, "peggedUSD", Number(supply) / 10 ** 6, address, false);
    return balances;
  };
}

export function terraSupply(_addresses: string[], _decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    return balances;
  };
}

export function osmosisLiquidity(
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

// bank total supply of native denoms on a cosmos-sdk chain. LCD endpoints come from the sdk map
// (`<CHAIN>_LCD` env overrides, `https://rest.cosmos.directory/<chain>` fallback).
export function cosmosSupply(
  chain: string,
  tokens: string[],
  decimals: number,
  bridgedFromChain: string,
  pegType: PeggedAssetType = "peggedUSD"
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let token of tokens) {
      const amount = await chains.cosmos.totalSupply({ chain, denom: token });
      sumSingleBalance(
        balances,
        pegType,
        Number(amount) / 10 ** decimals,
        token,
        false,
        bridgedFromChain
      );
    }
    return balances;
  };
}

export function osmosisSupply(
  tokens: string[],
  decimals: number,
  bridgedFromChain: string
) {
  return cosmosSupply("osmosis", tokens, decimals, bridgedFromChain);
}

export function kujiraSupply(
  tokens: string[],
  decimals: number,
  bridgedFromChain: string
) {
  return cosmosSupply("kujira", tokens, decimals, bridgedFromChain);
}

// const dummyFn = () => ({})

export function addChainExports(config: any, adapter: any = {}, {
  decimals = 18, pegType,
}: {
  decimals?: number
  pegType?: string
} = {}): PeggedIssuanceAdapter {
  Object.entries(config).forEach(([chain, chainConfig]: [string, any]) => {
    if (!adapter[chain])
      adapter[chain] = {};
    if (pegType) chainConfig.pegType = pegType;

    const cExports = adapter[chain]
    Object.keys(chainConfig).forEach((key) => {
      switch (key) {
        case 'bridgeOnETH':
          cExports.ethereum = supplyInEthereumBridge(config.ethereum.issued[0], chainConfig.bridgeOnETH[0], decimals, pegType as any);
          break;
        case 'pegType':
          break;
        case "issued":
          if (!cExports.minted)
            cExports.minted = getIssued(chainConfig)
          break;
        case "cosmosIssued":
          // cosmos LCD supply query: value is a denom (or array of denoms) queried
          // on `chain` via cosmosSupply. decimals comes from the options arg.
          if (!Array.isArray(chainConfig.cosmosIssued)) chainConfig.cosmosIssued = [chainConfig.cosmosIssued]
          if (!cExports.minted)
            cExports.minted = cosmosSupply(chain, chainConfig.cosmosIssued, decimals, "", pegType as any)
          break;
        case "unreleased":
        case "reserves":
          if (!cExports.unreleased)
            cExports.unreleased = getUnreleased(chainConfig)
          break;
        case "bridgedFromETH":
          if (!Array.isArray(chainConfig.bridgedFromETH)) chainConfig.bridgedFromETH = [chainConfig.bridgedFromETH]
          if (!cExports.ethereum) {
            if (chain === 'solana')
              cExports.ethereum = solanaMintedOrBridged(chainConfig[key], pegType as any)
            else
              cExports.ethereum = bridgedSupply(chain, decimals, chainConfig.bridgedFromETH, undefined, "ethereum", pegType as any)
          }
          break;
        default: {
          if (key.startsWith("cosmosBridgedFrom")) {
            // cosmos LCD supply of a denom bridged in from another chain, queried on
            // `chain` and attributed to the source chain (e.g. cosmosBridgedFromAgoric).
            const srcChain = key.slice("cosmosBridgedFrom".length).toLowerCase()
            if (!Array.isArray(chainConfig[key])) chainConfig[key] = [chainConfig[key]]
            if (!cExports[srcChain])
              cExports[srcChain] = cosmosSupply(chain, chainConfig[key], decimals, srcChain, pegType as any)
          } else if (key.startsWith("bridgedFrom")) {
            let srcChain = key.slice("bridgedFrom".length).toLowerCase()
            if (srcChain === "eth") srcChain = "ethereum"
            if (!Array.isArray(chainConfig[key])) chainConfig[key] = [chainConfig[key]]
            if (!cExports[srcChain]) {
              if (chain === 'solana')
                cExports[srcChain] = solanaMintedOrBridged(chainConfig[key], pegType as any)
              else if (chain === 'sui' || chain === 'cardano')
                cExports[srcChain] = getIssued({ issued: chainConfig[key], pegType: pegType as PeggedAssetType })
              else
                cExports[srcChain] = bridgedSupply(chain, decimals, chainConfig[key], undefined, srcChain, pegType as any)
            }
          } else
            console.log(`Ignored: Unknown key ${key} in ${chain} config for addChainExports`)
        }
      }
    })
    // if (!cExports.minted) cExports.minted = dummyFn
    // if (!cExports.unreleased) cExports.unreleased = dummyFn;
  })
  return adapter
}

function getIssued({
  issued, pegType = "peggedUSD", issuedABI = "erc20:totalSupply",
}: { issued: string[] | string, pegType?: PeggedAssetType, issuedABI?: string }) {
  return async (api: ChainApi) => {
    const balances = {} as Balances;
    const issuedList = typeof issued === "string" ? [issued] : issued;
    if (api.chain === "solana") {
      for (const i of issuedList) {
        const supply = await solanaGetTokenSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
      }
      return balances;
    }
    if (api.chain === "sui") {
      for (const i of issuedList) {
        const supply = await sui.getTokenSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
      }
      return balances;
    }
    if (api.chain === "aptos") {
      for (const i of issuedList) {
        const supply = await aptos.getTokenSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
      }
      return balances;
    }
    if (api.chain === 'tezos') {
      for (const i of issuedList) {
        const supply = await tezos.getTotalSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
      }
      return balances;
    }
    if (api.chain === 'stellar') {
      for (const i of issuedList) {
        // a Soroban contract address (starts with 'C', no asset-code separator)
        // must be resolved to its underlying asset first
        const isContract = i.startsWith("C") && !i.includes(":") && !i.includes("-");
        const supply = isContract
          ? await stellar.getTotalSupplyByContract(i)
          : await stellar.getTotalSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
      }
      return balances;
    }
    if (api.chain === 'tron') {
      for (const i of issuedList) {
        const supply = await tronGetTotalSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
      }
      return balances;
    }
    if (api.chain === 'starknet') {
      for (const i of issuedList) {
        const supply = await starknet.getTotalSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
      }
      return balances;
    }

    if (api.chain === 'cardano') {
      for (const i of issuedList) {
        const supply = await cardano.getTotalSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
      }
      return balances;
    }
    if (api.chain === 'ripple') {
      for (const i of issuedList) {
        const supply = await rippleGetTotalSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
      }
      return balances;
    }
    if (api.chain === 'algorand') {
      for (const i of issuedList) {
        const supply = await algorandGetTotalSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
      }
      return balances;
    }
    if (api.chain === 'strato') {
      for (const i of issuedList) {
        const supply = await api.call({ abi: issuedABI, target: i })
        const tokenDecimals = await api.call({ abi: 'erc20:decimals', target: i })
        sumSingleBalance(balances, pegType, supply / 10 ** tokenDecimals, 'issued', false);
      }
      return balances;
    }
    const supplies = await api.multiCall({ abi: issuedABI, calls: issuedList })
    const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: issuedList })
    issuedList.forEach((_address, i) => {
      sumSingleBalance(balances, pegType, supplies[i] / 10 ** decimals[i], 'issued', false);
    })

    return balances;
  }
}

// ripple token format: "<currencyCode>.<issuerAddress>" (currency as 3-char code or 40-char hex);
// the issuer's obligations for that currency, 0 when there are none. `XRPL_RPC` env overrides the nodes.
export async function rippleGetTotalSupply(token: string): Promise<number> {
  return Number(await chains.xrpl.getTokenSupply(token));
}

// asset params (total, decimals, reserve, unit-name, ...) of an Algorand Standard Asset
export async function algorandGetAssetParams(assetId: string | number) {
  return chains.algorand.getAssetInfo({ assetId });
}

// total supply of an Algorand Standard Asset, scaled by its own decimals
export async function algorandGetTotalSupply(assetId: string | number): Promise<number> {
  const params = await algorandGetAssetParams(assetId);
  return Number(params.total) / 10 ** params.decimals;
}

// amount of `assetId` held by `account`, scaled by the asset's decimals (0 when not opted in)
export async function algorandGetBalance(assetId: string | number, account: string): Promise<number> {
  const [params, balance] = await Promise.all([
    algorandGetAssetParams(assetId),
    chains.algorand.getAssetBalance({ address: account, assetId }),
  ]);
  return Number(balance) / 10 ** params.decimals;
}

function getUnreleased({
  issued, pegType = "peggedUSD", unreleased, reserves,
}: { issued: string[] | string, pegType: PeggedAssetType, issuedABI: string, unreleased: string[] | string, reserves: any }) {
  return async (api: ChainApi) => {
    if (!unreleased && reserves) unreleased = reserves;
    const balances = {} as Balances;
    if (typeof issued === "string") issued = [issued];
    if (typeof unreleased === "string") unreleased = [unreleased]

    if (api.chain === 'starknet') return starknet.getUnreleased({ issued, unreleased, balances, sumSingleBalance, pegType})

    if (api.chain === 'algorand') {
      for (const assetId of issued) {
        for (const account of unreleased) {
          const balance = await algorandGetBalance(assetId, account)
          sumSingleBalance(balances, pegType, balance);
        }
      }
      return balances;
    }

    if (api.chain === 'solana') {
      for (const token of issued) {
        for (const account of unreleased) {
          // solanaGetTokenBalance throws when the wallet holds no token account;
          // an empty reserve should contribute 0, but RPC/network failures must
          // still fail the fetch instead of silently undercounting unreleased.
          let balance = 0;
          try { balance = await solanaGetTokenBalance(token, account) } catch (e: any) {
            if (!String(e?.message ?? "").includes("empty token accounts")) throw e;
          }
          sumSingleBalance(balances, pegType, balance);
        }
      }
      return balances;
    }

    if (api.chain === 'tron') {
      for (const token of issued) {
        for (const reserve of unreleased) {
          const balance = await tronGetTokenBalance(token, reserve)
          sumSingleBalance(balances, pegType, balance);
        }
      }
      return balances;
    }

    if (api.chain === 'strato') {
      for (const token of issued) {
        const decimals = await api.call({ abi: 'erc20:decimals', target: token })
        for (const reserve of unreleased) {
          const supply = await api.call({ abi: 'erc20:balanceOf', target: token, params: reserve })
          sumSingleBalance(balances, pegType, supply / 10 ** decimals);
        }
      }
      return balances;
    }

    const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: issued })
    for (let i = 0; i < issued.length; i++) {
      const totalSupply = await api.multiCall({ abi: 'erc20:balanceOf', target: issued[i], calls: unreleased })
      for (const supply of totalSupply)
        sumSingleBalance(balances, pegType, supply / 10 ** decimals[i]);
    }

    return balances;
  }
}
