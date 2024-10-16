import type {
  Balances,
  ChainBlocks,
  PeggedAssetType,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
import { sumSingleBalance } from "./generalUtil";
import { getTokenSupply as solanaGetTokenSupply } from "../helper/solana";
import { ChainApi } from "@defillama/sdk";
import * as sui from "../helper/sui";
import * as aptos from "../helper/aptos";
const axios = require("axios");
const retry = require("async-retry");
process.env.TAIKO_RPC = 'https://rpc.taiko.xyz'
process.env.REAL_RPC = 'https://tangible-real.gateway.tenderly.co'

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

export function solanaMintedOrBridged(
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

const cosmosEndpoints: any = {
  crescent: "https://mainnet.crescent.network:1317",
  osmosis: "https://rest.cosmos.directory/osmosis",
  cosmos: "https://cosmoshub-lcd.stakely.io",
  kujira: "https://kuji-api.kleomedes.network",
  comdex: "https://rest.comdex.one",
  terra: "https://terra-classic-lcd.publicnode.com",
  terra2: "https://terra-lcd.publicnode.com",
  umee: "https://umee-api.polkachu.com",
  orai: "https://lcd.orai.io",
  juno: "https://juno.api.m.stavr.tech",
  cronos: "https://rest.mainnet.crypto.org",
  chihuahua: "https://rest.cosmos.directory/chihuahua",
  stargaze: "https://rest.stargaze-apis.com",
  quicksilver: "https://rest.cosmos.directory/quicksilver",
  persistence: "https://rest.cosmos.directory/persistence",
  secret: "https://rpc.ankr.com/http/scrt_cosmos",
  // chihuahua: "https://api.chihuahua.wtf",
  injective: "https://injective-rest.publicnode.com",
  migaloo: "https://migaloo-api.polkachu.com",
  fxcore: "https://fx-rest.functionx.io",
  xpla: "https://dimension-lcd.xpla.dev",
  kava: "https://api2.kava.io",
  neutron: "https://rest-kralum.neutron-1.neutron.org",
  quasar: "https://quasar-api.polkachu.com",
  gravitybridge: "https://gravitychain.io:1317",
  sei: "https://sei-rest.publicnode.com",
  aura: "https://lcd.aura.network",
  archway: "https://api.mainnet.archway.io",
  sifchain: "https://sifchain-api.polkachu.com",
  nolus: "https://pirin-cl.nolus.network:1317",
  nibiru: "https://lcd.nibiru.fi",
  bostrom: "https://lcd.bostrom.cybernode.ai",
  joltify: "https://lcd.joltify.io",
  noble: "https://api.noble.xyz"
};


function getCosmosRPC(chain: string) {
  if (cosmosEndpoints[chain]) return cosmosEndpoints[chain];
  return `https://rest.cosmos.directory/${chain}`;
}

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
      let api = `cosmos/bank/v1beta1/supply/by_denom?denom=${token}`
      if (chain === 'noble')
        api = `cosmos/bank/v1beta1/supply/${token}`
      const res = await retry(
        async (_bail: any) =>
          await axios.get(
            `${getCosmosRPC(chain)}/${api}`
          )
      );
      sumSingleBalance(
        balances,
        pegType,
        parseInt(res.data.amount.amount) / 10 ** decimals,
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

export function kujiraSupply(
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
        case 'bridgeOnETH':
        case 'pegType':
          break;
        case "issued":
          if (!cExports.minted)
            cExports.minted = getIssued(chainConfig)
          break;
        case "unreleased":
        case "reserves":
          if (!cExports.unreleased)
            cExports.unreleased = getUnreleased(chainConfig)
          break;
        case "bridgedFromETH":
          if (!Array.isArray(chainConfig.bridgedFromETH)) chainConfig.bridgedFromETH = [chainConfig.bridgedFromETH]
          if (!cExports.ethereum)
            cExports.ethereum = bridgedSupply(chain, decmials, chainConfig.bridgedFromETH)
          break;
        default: {
          if (key.startsWith("bridgedFrom")) {
            let srcChain = key.slice("bridgedFrom".length).toLowerCase()
            if (srcChain === "ETH") srcChain = "ethereum"
            if (!Array.isArray(chainConfig[key])) chainConfig[key] = [chainConfig[key]]
            if (!cExports[srcChain])
              cExports[srcChain] = bridgedSupply(chain, decmials, chainConfig[key], undefined, srcChain, pegType as any)
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
}: { issued: string[] | string, pegType: PeggedAssetType, issuedABI: string }) {
  return async (api: ChainApi) => {
    const balances = {} as Balances;
    if (api.chain === "solana") {
      for (const i of issued) {
        const supply = await solanaGetTokenSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
        return balances;
      }
    }
    if (api.chain === "sui") {
      for (const i of issued) {
        const supply = await sui.getTokenSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
        return balances;
      }
    }
    if (api.chain === "aptos") {
      for (const i of issued) {
        const supply = await aptos.getTokenSupply(i)
        sumSingleBalance(balances, pegType, supply, 'issued', false);
        return balances;
      }
    }
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
  issued, pegType = "peggedUSD", unreleased, reserves,
}: { issued: string[] | string, pegType: PeggedAssetType, issuedABI: string, unreleased: string[] | string, reserves: any }) {
  return async (api: ChainApi) => {
    if (!unreleased && reserves) unreleased = reserves;
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
