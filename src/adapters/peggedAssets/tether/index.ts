const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
  supplyInEthereumBridge,
  solanaMintedOrBridged,
  terraSupply,
  osmosisSupply,
  getApi,
} from "../helper/getSupply";
import { getTokenBalance as solanaGetTokenBalance } from "../helper/solana";
import {
  getTotalSupply as ontologyGetTotalSupply,
  getBalance as ontologyGetBalance,
} from "../helper/ontology";
import { getTotalSupply as kavaGetTotalSupply } from "../helper/kava";
import { getTotalBridged as pnGetTotalBridged } from "../helper/polynetwork";
import { getTotalSupply as aptosGetTotalSupply } from "../helper/aptos";
import { call as nearCall } from "../helper/near";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
  PeggedAssetType,
} from "../peggedAsset.type";
import {
  getTokenBalance as tronGetTokenBalance,
  getTotalSupply as tronGetTotalSupply, // NOTE THIS DEPENDENCY
} from "../helper/tron";
import { sumMultipleBalanceFunctions } from "../helper/generalUtil";
import { mixinSupply } from "../helper/mixin";
import { chainContracts } from "./config";
import { ChainApi } from "@defillama/sdk";
const axios = require("axios");
const retry = require("async-retry");

// If you are trying to test the adapter locally and it failed, try to comment out the lines related with dogechain and fuse
// any bridgeOnETH contracts are not used and are just for info purposes

/*
Tezos is using USDT's API for now but could probably be easily moved to other API.

Omni is using USDT's API, it seems there may now be multiple addresses of USDT, so explorer queries need to be updated.

EOS can't find suitable API, using USDT's API for now.
pNetwork has USDT, USDC, DAI bridge to EOS, but so far unable to understand the EOS API.

Statemine is using USDT's API.

Liquid has 10M unreleased in USDT API, but seems no way to find account holding it.
Using USDT API for now.

SLP explorer is broken, seems difficult to directly query, maybe no working API.
Token ID is 9fc89d6b7d5be2eac0b3787c5b8236bca5de641b5bafafc8f450727b63615c11
Using USDT's API for now.

Cronos: they have not provided any proof the circulating USDT is real USDT.

Don't know how to count the 2 Saber wrapped USDT on Solana.

Conflux: cfx:acf2rcsh8payyxpg6xj7b0ztswwh81ute60tsw35j7 from shuttleflow, don't know where from
0xfe97E85d13ABD9c1c33384E796F10B73905637cE celer
Flow: A.231cc0dbbcffc4b7.ceUSDT celer, check for others.

Don't know if every multichain contract has been found and included or not.

Velas: amount on chain does not match amount in multichain bridge, so it has not been added yet.

Caduceus: 0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c is multichain, don't have provider or API yet.
*/

async function chainMinted(chain: string, decimals: number) {
  return async function (_api: ChainApi) {
    const api = await getApi(chain, _api)
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = await api.call({ abi: "erc20:totalSupply", target: issued, })
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

async function chainUnreleased(chain: string, decimals: number, owner: string) {
  return async function (_api: ChainApi) {
    const api = await getApi(chain, _api)
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const reserve = await api.call({ target: issued, params: owner, abi: "erc20:balanceOf", })
      sumSingleBalance(balances, "peggedUSD", reserve / 10 ** decimals);
    }
    return balances;
  };
}

async function bscBridgedFromTron(
  bscUSDTAddress: string,
  ethUSDTAddress: string
) {
  return async function (_api: ChainApi) {
    const api = await getApi('bsc', _api)
    let balances = {} as Balances;
    const totalSupply = await api.call({
      abi: "erc20:totalSupply",
      target: bscUSDTAddress,
    }) / 10 ** 18;
    const bridgedFromETH =
      (
        await sdk.api.erc20.balanceOf({
          target: chainContracts.ethereum.issued[0],
          owner: ethUSDTAddress,
        })
      ).output /
      10 ** 6;
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupply - bridgedFromETH,
      "bsc",
      false,
      "Tron"
    );
    return balances;
  };
}

async function solanaUnreleased() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const unreleased = await solanaGetTokenBalance(
      chainContracts["solana"].issued[0],
      chainContracts["solana"].unreleased[0]
    );
    sumSingleBalance(balances, "peggedUSD", unreleased);
    return balances;
  };
}

async function liquidMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://blockstream.info/liquid/api/asset/ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2"
        )
    );
    const issued = res.data.chain_stats.issued_amount;
    const burned = res.data.chain_stats.burned_amount;
    sumSingleBalance(
      balances,
      "peggedUSD",
      (issued - burned) / 10 ** 8,
      "issued",
      false
    );
    return balances;
  };
}

async function tonMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://toncenter.com/api/v3/jetton/masters?address=EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs&limit=128&offset=0"
        )
    );
    const issued = res.data.jetton_masters[0].total_supply;
    sumSingleBalance(
      balances,
      "peggedUSD",
      (issued) / 10 ** 6,
      "issued",
      false
    );
    return balances;
  };
}

async function algorandMinted() {
  // I gave up on trying to use the SDK for this
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supplyRes = await retry(
      async (_bail: any) =>
        await axios.get("https://mainnet-idx.algonode.cloud/v2/assets/312769")
    );
    const supply = supplyRes.data.asset.params.total;
    const reserveRes = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://mainnet-idx.algonode.cloud/v2/accounts/XIU7HGGAJ3QOTATPDSIIHPFVKMICXKHMOR2FJKHTVLII4FAOA3CYZQDLG4"
        )
    );
    const reserveAccount = reserveRes.data.account.assets.filter(
      (asset: any) => asset["asset-id"] === 312769
    );
    const reserves = reserveAccount[0].amount;
    const balance = (supply - reserves) / 10 ** 6;
    sumSingleBalance(balances, "peggedUSD", balance, "issued", false);
    return balances;
  };
}

async function omniMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const options = {
      method: "post",
      url: "https://api.omniexplorer.info/v1/properties/listbyecosystem",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "ecosystem=1",
    };
    const res = await retry(async (_bail: any) => await axios(options));
    const totalSupply = parseInt(res.data.properties[6].totaltokens);
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

async function omniUnreleased() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const options = {
      method: "post",
      url: "https://api.omniexplorer.info/v1/address/addr",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "addr=1NTMakcgVwQpMdGxRQnFKyb3G1FAJysSfz",
    };
    const res = await retry(async (_bail: any) => await axios(options));
    const account = res.data.balance.filter((obj: any) => obj.id === "31");
    const balance = parseInt(account[0].value);
    sumSingleBalance(balances, "peggedUSD", balance / 10 ** 8);
    return balances;
  };
}

async function tronMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await tronGetTotalSupply(
      chainContracts["tron"].issued[0]
    );
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

async function tronUnreleased() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const unreleased = await tronGetTokenBalance(
      chainContracts["tron"].issued[0],
      chainContracts["tron"].unreleased[0]
    );
    sumSingleBalance(balances, "peggedUSD", unreleased);
    return balances;
  };
}

async function usdtApiMinted(key: string) {
  // would be better to replace with different api or on-chain calls
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios("https://app.tether.to/transparency.json")
    );
    const issuance = res.data.data.usdt;
    const totalSupply = parseInt(issuance[key]);
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

async function usdtApiUnreleased(key: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios("https://app.tether.to/transparency.json")
    );
    const issuance = res.data.data.usdt;
    const totalSupply = parseInt(issuance[key]);
    sumSingleBalance(balances, "peggedUSD", totalSupply);
    return balances;
  };
}

async function reinetworkBridged(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          `https://scan.rei.network/api?module=token&action=getToken&contractaddress=${address}`
        )
    );
    const totalSupply = parseInt(res.data.result.totalSupply) / 10 ** decimals;
    sumSingleBalance(balances, "peggedUSD", totalSupply, address, true);
    return balances;
  };
}

async function ontologyBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const polyUSDTAddress = chainContracts.ontology.bridgedFromETH[0];
    const polyUSDTReserveAddress = chainContracts.ontology.unreleased[0];
    const polyNetworkSupply = await ontologyGetTotalSupply(
      polyUSDTAddress,
      "oep4"
    );
    const polyNetworkReserve = await ontologyGetBalance(
      polyUSDTAddress,
      "oep4",
      polyUSDTReserveAddress
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      polyNetworkSupply - polyNetworkReserve,
      polyUSDTAddress,
      true
    );

    const celerUSDTAddress = chainContracts.ontology.bridgedFromETH[1];
    const celerSupply = await ontologyGetTotalSupply(celerUSDTAddress, "orc20");
    sumSingleBalance(
      balances,
      "peggedUSD",
      celerSupply,
      celerUSDTAddress,
      true
    );
    return balances;
  };
}

async function nearBridged(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supply = await nearCall(address, "ft_total_supply");
    sumSingleBalance(
      balances,
      "peggedUSD",
      supply / 10 ** decimals,
      address,
      true
    );
    return balances;
  };
}

async function nearMint(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const mintedAmount = await nearCall(address, "ft_total_supply");
    sumSingleBalance(
      balances,
      "peggedUSD",
      mintedAmount / 10 ** decimals,
      address,
      false
    );
    return balances;
  };
}

async function suiBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await axios.get(
      `https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/sui/usdt`
    );
    const totalSupply = parseInt(
      res.data.find((t: any) => t.coin === "USDT_ETH").cumulative_balance
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupply,
      "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c",
      true
    );
    return balances;
  };
}

async function polyNetworkBridged(
  chainID: number,
  chainName: string,
  assetName: string
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await pnGetTotalBridged(chainID, chainName, assetName);
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupply,
      "polynetwork",
      false,
      "Ethereum"
    );
    return balances;
  };
}

async function kavaBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (const contract of chainContracts.kava.bridgedFromETH) {
      const totalSupply = await kavaGetTotalSupply(contract);
      sumSingleBalance(balances, "peggedUSD", totalSupply, contract, true);
    }
    return balances;
  };
}

async function kavaMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await kavaGetTotalSupply(
      chainContracts["kava"].issued[0]
    );
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

async function aptosBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const contractStargate =
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa";
    const typeStargate =
      "0x1::coin::CoinInfo<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT>";
    const totalSupplyStargate = await aptosGetTotalSupply(
      contractStargate,
      typeStargate
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupplyStargate,
      contractStargate,
      true
    );
    const contractPortal =
      "0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852";
    const typePortal =
      "0x1::coin::CoinInfo<0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852::coin::T>";
    const totalSupplyPortal = await aptosGetTotalSupply(
      contractPortal,
      typePortal
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupplyPortal,
      contractPortal,
      true
    );
    return balances;
  };
}

async function injectiveETHBridged(_api: ChainApi) {
  const bridgeName = 'peggy'
  const bscApi = await getApi('ethereum', _api)
  let balances = {} as Balances;
  let assetPegType = "peggedUSD" as PeggedAssetType
  const bscBal = await bscApi.call({  abi: 'erc20:balanceOf', target: '0xdAC17F958D2ee523a2206206994597C13D831ec7', params: '0xF955C57f9EA9Dc8781965FEaE0b6A2acE2BAD6f3'})
  sumSingleBalance(balances, assetPegType, bscBal/ 1e6, bridgeName, false, 'ethereum')
  return balances;
}

async function stacksBSCBridged(_api: ChainApi) {
  const bridgeName = 'alex'
  const bscApi = await getApi('bsc', _api)
  let balances = {} as Balances;
  let assetPegType = "peggedUSD" as PeggedAssetType
  const bscBal = await bscApi.call({  abi: 'erc20:balanceOf', target: '0x55d398326f99059fF775485246999027B3197955', params: '0x7ceC01355aC0791dE5b887e80fd20e391BCB103a'})
  sumSingleBalance(balances, assetPegType, bscBal/ 1e18, bridgeName, false, 'bsc')
  // const ethApi = await getApi('ethereum', _api)
  // const ethBal = await ethApi.call({  abi: 'erc20:balanceOf', target: '0x55d398326f99059fF775485246999027B3197955', params: '0x7ceC01355aC0791dE5b887e80fd20e391BCB103a'})
  // sumSingleBalance(balances, assetPegType, ethBal/ 1e6, bridgeName, false, 'ethereum')
  return balances;
}

async function elrondBridged(tokenID: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          `https://gateway.elrond.com/network/esdt/supply/${tokenID}`
        )
    );
    const supply = res?.data?.data?.supply / 10 ** decimals;
    sumSingleBalance(
      balances,
      "peggedUSD",
      supply,
      "adastra",
      false,
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 6),
    unreleased: chainUnreleased(
      "ethereum",
      6,
      chainContracts.ethereum.unreleased[0]
    ),
    bsc: bridgedSupply("ethereum", 18, chainContracts.ethereum.bridgedFromBSC),
    solana: bridgedSupply(
      "ethereum",
      6,
      chainContracts.ethereum.bridgedFromSol
    ),
  },
  /*
  osmosis: {
    ethereum: osmosisSupply("usdt", "Axelar", "Kava"),
  },
  */
  polygon: {
    ethereum: bridgedSupply(
      "polygon",
      6,
      chainContracts.polygon.bridgedFromETH
    ),
    solana: bridgedSupply("polygon", 6, chainContracts.polygon.bridgedFromSol),
  },
  bsc: {
    ethereum: sumMultipleBalanceFunctions(
      [
        supplyInEthereumBridge(
          chainContracts.ethereum.issued[0],
          chainContracts.bsc.bridgeOnETH[0],
          6
        ),
        bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromETH),
      ],
      "peggedUSD"
    ),
    avax: bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromAvax),
    solana: bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromSol),
    tron: bscBridgedFromTron(
      chainContracts.bsc.bridgedFromETHAndTron[0],
      chainContracts.bsc.bridgeOnETH[0]
    ),
  },
  avax: {
    minted: chainMinted("avax", 6),
    unreleased: chainUnreleased("avax", 6, chainContracts.avax.unreleased[0]),
    ethereum: bridgedSupply("avax", 6, chainContracts.avax.bridgedFromETH),
    solana: bridgedSupply("avax", 6, chainContracts.avax.bridgedFromSol),
    bsc: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromBSC),
  },
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued),
    unreleased: solanaUnreleased(),
    ethereum: solanaMintedOrBridged(chainContracts.solana.bridgedFromETH),
    polygon: solanaMintedOrBridged(chainContracts.solana.bridgedFromPolygon),
    bsc: solanaMintedOrBridged(chainContracts.solana.bridgedFromBSC),
    heco: solanaMintedOrBridged(chainContracts.solana.bridgedFromHeco),
    avax: solanaMintedOrBridged(chainContracts.solana.bridgedFromAvax),
  },
  arbitrum: {
    ethereum: bridgedSupply(
      "arbitrum",
      6,
      chainContracts.arbitrum.bridgedFromETH
    ),
  },
  optimism: {
    ethereum: bridgedSupply(
      "optimism",
      6,
      chainContracts.optimism.bridgedFromETH
    ),
  },
  boba: {
    ethereum: bridgedSupply("boba", 6, chainContracts.boba.bridgedFromETH),
  },
  metis: {
    ethereum: bridgedSupply("metis", 6, chainContracts.metis.bridgedFromETH),
  },
  moonbeam: {
    ethereum: bridgedSupply(
      "moonbeam",
      6,
      chainContracts.moonbeam.bridgedFromETH
    ),
  },
  kcc: {
    ethereum: bridgedSupply("kcc", 18, chainContracts.kcc.bridgedFromETH),
  },
  moonriver: {
    ethereum: bridgedSupply(
      "moonriver",
      6,
      chainContracts.moonriver.bridgedFromETH
    ),
  },
  harmony: {
    /* hacked, trading at $0.06
    ethereum: bridgedSupply(
      "harmony",
      6,
      chainContracts.harmony.bridgedFromETH
    ),
    */
  },
  sui: {
    ethereum: suiBridged(),
  },
  syscoin: {
    ethereum: bridgedSupply(
      "syscoin",
      6,
      chainContracts.syscoin.bridgedFromETH
    ),
  },
  heco: {
    ethereum: bridgedSupply("heco", 18, chainContracts.heco.bridgedFromETH),
  },
  okexchain: {
    ethereum: bridgedSupply(
      "okexchain",
      18,
      chainContracts.okexchain.bridgedFromETH
    ),
  },
  iotex: {
    ethereum: bridgedSupply("iotex", 6, chainContracts.iotex.bridgedFromETH),
  },
  tomochain: {
    ethereum: bridgedSupply(
      "tomochain",
      6,
      chainContracts.tomochain.bridgedFromETH
    ),
  },
  kardia: {
    ethereum: bridgedSupply("kardia", 6, chainContracts.kardia.bridgedFromETH),
  },
  fuse: {
    ethereum: bridgedSupply("fuse", 6, chainContracts.fuse.bridgedFromETH),
  },
  meter: {
    ethereum: bridgedSupply("meter", 6, chainContracts.meter.bridgedFromETH),
  },
  milkomeda: {
    ethereum: bridgedSupply(
      "milkomeda",
      6,
      chainContracts.milkomeda.bridgedFromETH
    ),
  },
  omni: {
    minted: usdtApiMinted("totaltokens_omni"),
    unreleased: sumMultipleBalanceFunctions(
      [
        usdtApiUnreleased("reserve_balance_omni"),
        usdtApiUnreleased("quarantined_omni"),
      ],
      "peggedUSD"
    ),
  },
  tron: {
    minted: tronMinted(),
    unreleased: tronUnreleased(),
  },
  aurora: {
    near: bridgedSupply("aurora", 6, chainContracts.aurora.bridgedFromNear),
  },
  telos: {
    ethereum: bridgedSupply("telos", 6, chainContracts.telos.bridgedFromETH),
  },
  algorand: {
    minted: algorandMinted(),
  },
  liquidchain: {
    minted: liquidMinted(),
    unreleased: usdtApiUnreleased("reserve_balance_liq"),
  },
  bittorrent: {
    ethereum: bridgedSupply(
      "bittorrent",
      6,
      chainContracts.bittorrent.bridgedFromETH
    ),
    bsc: bridgedSupply(
      "bittorrent",
      18,
      chainContracts.bittorrent.bridgedFromBSC
    ),
    tron: bridgedSupply(
      "bittorrent",
      6,
      chainContracts.bittorrent.bridgedFromTron
    ),
  },
  crab: {
    ethereum: bridgedSupply("crab", 6, chainContracts.crab.bridgedFromETH),
  },
  eos: {
    minted: usdtApiMinted("totaltokens_eos"),
    unreleased: usdtApiUnreleased("reserve_balance_eos"),
  },
  /* not currently included, no chain available to display for this
  slp: {
    minted: usdtApiMinted("totaltokens_slp"),
    unreleased: usdtApiUnreleased("reserve_balance_slp"),
  },
  */
  evmos: {
    ethereum: bridgedSupply("evmos", 6, chainContracts.evmos.bridgedFromETH),
  },
  oasis: {
    ethereum: sumMultipleBalanceFunctions(
      [
        bridgedSupply("oasis", 6, [chainContracts.oasis.bridgedFromETH[0]]),
        bridgedSupply(
          "oasis",
          6,
          [chainContracts.oasis.bridgedFromETH[1]],
          "celer",
          "Ethereum"
        ),
      ],
      "peggedUSD"
    ),
    solana: bridgedSupply("oasis", 6, chainContracts.oasis.bridgedFromSol),
    bsc: bridgedSupply("oasis", 18, chainContracts.oasis.bridgedFromBSC),
    polygon: bridgedSupply("oasis", 6, chainContracts.oasis.bridgedFromPolygon),
    avax: bridgedSupply("oasis", 6, chainContracts.oasis.bridgedFromAvax),
  },
  terra: {
    ethereum: terraSupply(chainContracts.terra.bridgedFromETH, 6),
    solana: terraSupply(chainContracts.terra.bridgedFromSol, 6),
    bsc: terraSupply(chainContracts.terra.bridgedFromBSC, 6),
    avax: terraSupply(chainContracts.terra.bridgedFromAvax, 6),
  },
  statemine: {
    minted: usdtApiMinted("totaltokens_statemine"),
    unreleased: usdtApiUnreleased("reserve_balance_statemine"),
  },
  astar: {
    ethereum: bridgedSupply("astar", 6, chainContracts.astar.bridgedFromETH),
  },
  xdai: {
    ethereum: bridgedSupply("xdai", 6, chainContracts.xdai.bridgedFromETH),
  },
  theta: {
    ethereum: bridgedSupply("theta", 6, chainContracts.theta.bridgedFromETH),
  },
  rsk: {
    ethereum: bridgedSupply("rsk", 18, chainContracts.rsk.bridgedFromETH),
  },
  reinetwork: {
    ethereum: reinetworkBridged(chainContracts.reinetwork.bridgedFromETH[0], 6),
  },
  loopring: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.loopring.bridgeOnETH[0],
      6
    ),
  },
  zksync: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.zksync.bridgeOnETH[0],
      6
    ),
  },
  era: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.era.bridgeOnETH[0],
      6
    ),
  },
  shiden: {
    ethereum: bridgedSupply("shiden", 6, chainContracts.shiden.bridgedFromETH),
  },
  fantom: {
    ethereum: bridgedSupply("fantom", 6, chainContracts.fantom.bridgedFromETH),
  },
  celo: {
    minted: usdtApiMinted("totaltokens_celo"),
    unreleased: usdtApiUnreleased("reserve_balance_celo"),
    ethereum: sumMultipleBalanceFunctions(
      [
        bridgedSupply("celo", 6, chainContracts.celo.bridgedFromETH6Decimals),
        bridgedSupply("celo", 18, chainContracts.celo.bridgedFromETH18Decimals),
      ],
      "peggedUSD"
    ),
  },
  kava: {
    minted: kavaMinted(),
    unreleased: chainUnreleased("kava", 6, chainContracts.kava.unreleased[0]),
    ethereum: kavaBridged(),
  },
  ontology: {
    //ethereum: ontologyBridged(),
  },
  sx: {
    ethereum: bridgedSupply("sx", 6, chainContracts.sx.bridgedFromETH),
  },
  ethereumclassic: {
    ethereum: bridgedSupply(
      "ethereumclassic",
      6,
      chainContracts.ethereumclassic.bridgedFromETH
    ),
  },
  tezos: {
    minted: usdtApiMinted("totaltokens_tezos"),
    unreleased: usdtApiUnreleased("reserve_balance_tezos"),
  },
  near: {
    minted: nearMint(chainContracts.near.issued[0], 6),
    ethereum: nearBridged(chainContracts.near.bridgedFromETH[0], 6),
  },
  wan: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.wan.bridgeOnETH[0],
      6
    ),
  },
  defichain: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.defichain.bridgeOnETH[0],
      6
    ),
  },
  klaytn: {
    ethereum: bridgedSupply("klaytn", 6, chainContracts.klaytn.bridgedFromETH),
  },
  canto: {
    ethereum: bridgedSupply("canto", 6, chainContracts.canto.bridgedFromETH),
  },
  everscale: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.everscale.bridgeOnETH[0],
      6
    ),
  },
  dogechain: {
    ethereum: bridgedSupply(
      "dogechain",
      6,
      chainContracts.dogechain.bridgedFromETH
    ),
  },
  neo: {
    ethereum: polyNetworkBridged(4, "Neo", "pnUSDT"),
  },
  zilliqa: {
    ethereum: polyNetworkBridged(18, "Zilliqa", "zUSDT"),
  },
  arbitrum_nova: {
    ethereum: bridgedSupply(
      "arbitrum_nova",
      6,
      chainContracts.arbitrum_nova.bridgedFromETH
    ),
  },
  aptos: {
    ethereum: aptosBridged(),
  },
  mixin: {
    ethereum: mixinSupply(chainContracts.mixin.ethAssetIds, "Ethereum"),
    tron: mixinSupply(chainContracts.mixin.tronAssetIds, "Tron"),
    polygon: mixinSupply(chainContracts.mixin.polygonAssetIds, "Polygon"),
    bsc: mixinSupply(chainContracts.mixin.BSCAssetIds, "BSC"),
    eos: mixinSupply(chainContracts.mixin.EOSAssetIds, "EOS"),
  },
  thundercore: {
    ethereum: bridgedSupply(
      "thundercore",
      6,
      chainContracts.thundercore.bridgeFromETH
    ),
  },
  osmosis: {
    ethereum: osmosisSupply(chainContracts.osmosis.bridgedFromETH, 6, "Axelar"),
    kava: osmosisSupply(chainContracts.osmosis.bridgedFromKava, 6, "Kava"),
  },
  waves: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.waves.bridgeOnETH[0],
      6
    ),
  },
  starknet: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.starknet.bridgeOnETH[0],
      6
    ),
  },
  mode: {
    ethereum: bridgedSupply("mode", 6, chainContracts.mode.bridgedFromETH),
  },
  manta: {
    ethereum: bridgedSupply("manta", 6, chainContracts.manta.bridgedFromETH),
  },
  pulse: {
    ethereum: bridgedSupply("pulse", 6, chainContracts.pulse.bridgedFromETH),
  },
  ton: {
    minted: tonMinted(),
    unreleased: usdtApiUnreleased("reserve_balance_ton"),
  },
  scroll: {
    ethereum: bridgedSupply("scroll", 6, chainContracts.scroll.bridgedFromETH),
  },
  taiko: {
    ethereum: bridgedSupply("taiko", 6, chainContracts.taiko.bridgedFromETH),
  },
  mantle: {
    ethereum: bridgedSupply("mantle", 6, chainContracts.mantle.bridgedFromETH),
  },
  linea: {
    ethereum: bridgedSupply("linea", 6, chainContracts.linea.bridgedFromETH),
  },
  stacks: {
    bsc: stacksBSCBridged,
  },
  injective: {
    ethereum: injectiveETHBridged,
  },
  elrond: { // both amounts end up as USDT-f8c08c
    ethereum: elrondBridged("ETHUSDT-9c73c6", 6),
    bsc: elrondBridged("BSCUSDT-059796", 18),
  },
};

export default adapter;

