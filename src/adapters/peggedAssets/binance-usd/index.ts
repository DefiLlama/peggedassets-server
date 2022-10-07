const sdk = require("@defillama/sdk");
import {
  sumMultipleBalanceFunctions,
  sumSingleBalance,
} from "../helper/generalUtil";
import {
  bridgedSupply,
  solanaMintedOrBridged,
  terraSupply,
  supplyInEthereumBridge,
} from "../helper/getSupply";
import { call as nearCall } from "../llama-helper/near";
import { getTotalBridged as pnGetTotalBridged } from "../helper/polynetwork";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x4fabb145d64652a948d72533023f6e7a623c7c53"],
    bridgedFromBSC: ["0x7B4B0B9b024109D182dCF3831222fbdA81369423"], // wormhole
  },
  bsc: {
    bridgeOnETH: ["0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503"],
    bridgedFromETH: [
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      "0x035de3679E692C471072d1A09bEb9298fBB2BD31", // wormhole
    ],
  },
  avax: {
    issued: ["0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39"],
    reserves: ["0x4A13E986a4B8E123721aA1F621E046fe3b74F724"], // owner of the native "issued" contract
    bridgeOnETH: ["0xe78388b4ce79068e89bf8aa7f218ef6b9ab0e9d0"],
    bridgedFromETH: ["0x19860ccb0a68fd4213ab9d8266f7bbf05a8dde98"],
    bridgedFromBSC: ["0xA41a6c7E25DdD361343e8Cb8cFa579bbE5eEdb7a"], // wormhole
  },
  solana: {
    bridgeOnETH: ["0xf92cd566ea4864356c5491c177a430c222d7e678"],
    bridgedFromETH: [
      "33fsBLA8djQm82RpHmE3SuVrPGtZBWNYExsEUeKX1HXX", // wormhole
      "AJ1W9A9N9dEMdVyoDiam2rV44gnBm2csrPDP7xqcapgX", // wormhole
      "6nuaX3ogrr2CaoAPjtaKHAoBNWok32BMcRozuf32s2QF", // allbridge
    ],
    bridgedFromBSC: ["5RpUwQ8wtdPCZHhu6MERp2RGrpobsbZ6MH5dDHkUjs2"], // wormhole
  },
  harmony: {
    bridgeOnETH: ["0xfd53b1b4af84d59b20bf2c20ca89a6beeaa2c628"],
    bridgedFromETH: ["0xe176ebe47d621b984a73036b9da5d834411ef734"],
  },
  iotex: {
    bridgedFromETH: ["0x84abcb2832be606341a50128aeb1db43aa017449"], // don't know if source is eth or bsc
  },
  okexchain: {
    bridgedFromBSC: ["0x332730a4f6e03d9c55829435f10360e13cfa41ff"], // multichain
  },
  moonriver: {
    bridgedFromBSC: [
      "0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818", // multichain
      "0xaBD347F625194D8e56F8e8b5E8562F34B6Df3469", // passport.meter
    ],
  },
  polygon: {
    issued: ["0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39"],
    reserves: ["0x4a13e986a4b8e123721aa1f621e046fe3b74f724"], // owner of native "issued" contract
    bridgedFromBSC: [
      "0x9fb83c0635de2e815fd1c21b3a292277540c2e8d", // multichain
      "0xA8D394fE7380b8cE6145d5f85E6aC22d4E91ACDe", // wormhole
    ],
  },
  fuse: {
    bridgedFromBSC: ["0x6a5f6a8121592becd6747a38d67451b310f7f156"],
  },
  meter: {
    bridgedFromBSC: ["0x24aa189dfaa76c671c279262f94434770f557c35"], // meter.passport
  },
  moonbeam: {
    bridgedFromBSC: [
      "0xa649325aa7c5093d12d6f98eb4378deae68ce23f", // multichain
      "0x7B37d0787A3424A0810E02b24743a45eBd5530B2", // meter.passport
    ],
  },
  milkomeda: {
    bridgedFromBSC: [
      "0x218c3c3d49d0e7b37aff0d8bb079de36ae61a4c0", // multichain
      "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E", // celer
    ],
  },
  elastos: {
    bridgedFromBSC: ["0x9f1d0ed4e041c503bd487e5dc9fc935ab57f9a57"], // glide/shadowtokens
  },
  aurora: {
    bridgedFromBSC: [
      "0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818", // multichain
      "0x3b40D173b5802733108E047CF538Be178646b2e4", // celer
      "0x5C92A4A7f59A9484AFD79DbE251AD2380E589783", // allbridge
    ],
  },
  terra: {
    bridgedFromBSC: ["terra1skjr69exm6v8zellgjpaa2emhwutrk5a6dz7dd"], // wormhole
  },
  oasis: {
    bridgedFromBSC: ["0xf6568FD76f9fcD1f60f73b730F142853c5eF627E"], // wormhole
  },
  shiden: {
    bridgedFromBSC: ["0x65e66a61d0a8f1e686c2d6083ad611a10d84d97a"], // multichain, not 100% sure it's from BSC
  },
  astar: {
    bridgedFromBSC: ["0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E"], // celer
  },
  evmos: {
    bridgedFromBSC: ["0x516e6D96896Aea92cE5e78B0348FD997F13802ad"], // celer
  },
  syscoin: {
    bridgedFromBSC: ["0x375488F097176507e39B9653b88FDc52cDE736Bf"], // multichain
  },
  boba: {
    bridgedFromBSC: ["0x461d52769884ca6235B685EF2040F47d30C94EB5"], // multichain
  },
  metis: {
    bridgedFromBSC: ["0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c"], // multichain
  },
  fantom: {
    bridgedFromBSC: ["0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50"], // address is related to multichain, but name of token is different?
  },
  kcc: {
    bridgedFromBSC: ["0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d"], // multichain
  },
  rsk: {
    bridgedFromBSC: ["0x2bf9b864cdc97b08b6d79ad4663e71b8ab65c45c"], // multichain
  },
  theta: {
    bridgedFromBSC: ["0x7B37d0787A3424A0810E02b24743a45eBd5530B2"], // multichain
  },
  kava: {
    bridgeOnBNB: [
      "bnb1skl4n4vrzx3ty9ujaut8rmkhkmtl4t04ysllfm", // cold wallets on BNB chain
      "bnb10zq89008gmedc6rrwzdfukjk94swynd7dl97w8",
    ],
  },
  loopring: {
    bridgeOnETH: ["0x674bdf20A0F284D710BC40872100128e2d66Bd3f"],
  },
  ethereumclassic: {
    bridgedFromETH: ["0xb12c13e66AdE1F72f71834f2FC5082Db8C091358"], // multichain
  },
  near: {
    bridgedFromETH: [
      "4fabb145d64652a948d72533023f6e7a623c7c53.factory.bridge.near",
    ], // rainbow bridge
  },
  klaytn: {
    bridgedFromBSC: ["0x210bc03f49052169d5588a52c317f71cf2078b85"], // orbit
  },
  dogechain: {
    bridgedFromETH: ["0x332730a4F6E03D9C55829435f10360E13cfA41Ff"], // multichain
  },
};

/*
Celo: don't know which addresses to use, can't find any info.

Cronos: 0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8, not sure whether to add because there is no bridge.

Telos: can't find addresses.

Sora: can't find API query to use.

Theta: address on coingecko seems wrong.

Flow: A.231cc0dbbcffc4b7.ceBUSD, have not added yet.
*/

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

async function kavaMinted(owners: string[]) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let owner of owners) {
      const res = await retry(
        async (_bail: any) =>
          await axios.get(`https://dex.binance.org/api/v1/account/${owner}`)
      );
      const balanceObject = res.data.balances.filter(
        (obj: any) => obj.symbol === "BUSD-BD1"
      );
      const circulating = parseInt(balanceObject[0].free);
      if (typeof circulating !== "number") {
        throw new Error("Binance Chain API for TUSD is broken.");
      }
      sumSingleBalance(balances, "peggedUSD", circulating, owner, true);
    }
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
      "BSC"
    );
    return balances;
  };
}

async function chainUnreleased(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
      const reserve = (
        await sdk.api.erc20.balanceOf({
          target: chainContracts[chain].issued[0],
          owner: chainContracts[chain].reserves[0],
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
    unreleased: async () => ({}),
    bsc: bridgedSupply("ethereum", 18, chainContracts.ethereum.bridgedFromBSC),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH),
  },
  avalanche: {
    minted: chainMinted("avax", 18),
    unreleased: chainUnreleased("avax", 18),
    ethereum: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromETH),
    bsc: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromBSC),
  },
  harmony: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    /* appears to now be unbacked due to hack
    ethereum: bridgedSupply(
      "harmony",
      18,
      chainContracts.harmony.bridgedFromETH
    ),
      */
  },
  iotex: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("iotex", 18, chainContracts.iotex.bridgedFromETH),
  },
  okexchain: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply(
      "okexchain",
      18,
      chainContracts.okexchain.bridgedFromBSC
    ),
  },
  moonriver: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply(
      "moonriver",
      18,
      chainContracts.moonriver.bridgedFromBSC
    ),
  },
  solana: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: solanaMintedOrBridged(chainContracts.solana.bridgedFromETH),
    bsc: solanaMintedOrBridged(chainContracts.solana.bridgedFromBSC),
  },
  polygon: {
    minted: chainMinted("polygon", 18),
    unreleased: chainUnreleased("polygon", 18),
    bsc: bridgedSupply("polygon", 18, chainContracts.polygon.bridgedFromBSC),
  },
  fuse: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("fuse", 18, chainContracts.fuse.bridgedFromBSC),
  },
  meter: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("meter", 18, chainContracts.meter.bridgedFromBSC),
  },
  moonbeam: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("moonbeam", 18, chainContracts.moonbeam.bridgedFromBSC),
  },
  milkomeda: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply(
      "milkomeda",
      18,
      chainContracts.milkomeda.bridgedFromBSC
    ),
  },
  elastos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("elastos", 18, chainContracts.elastos.bridgedFromBSC),
  },
  aurora: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("aurora", 18, chainContracts.aurora.bridgedFromBSC),
  },
  oasis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("oasis", 18, chainContracts.oasis.bridgedFromBSC),
  },
  terra: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: terraSupply(chainContracts.terra.bridgedFromBSC, 8),
  },
  shiden: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("shiden", 18, chainContracts.shiden.bridgedFromBSC),
  },
  astar: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("astar", 18, chainContracts.astar.bridgedFromBSC),
  },
  evmos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("evmos", 18, chainContracts.evmos.bridgedFromBSC),
  },
  syscoin: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("syscoin", 18, chainContracts.syscoin.bridgedFromBSC),
  },
  boba: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("boba", 18, chainContracts.boba.bridgedFromBSC),
  },
  metis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: sumMultipleBalanceFunctions(
      [
        bridgedSupply("metis", 18, chainContracts.metis.bridgedFromBSC),
        polyNetworkBridged(24, "Andromeda", "BUSD"),
      ],
      "peggedUSD"
    ),
  },
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromBSC),
  },
  kcc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("kcc", 18, chainContracts.kcc.bridgedFromBSC),
  },
  rsk: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("rsk", 18, chainContracts.rsk.bridgedFromBSC),
  },
  theta: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply(
      "theta",
      18,
      chainContracts.theta.bridgedFromBSC,
      "multichain",
      "BSC"
    ),
  },
  kava: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: kavaMinted(chainContracts.kava.bridgeOnBNB), 
  },
  loopring: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.loopring.bridgeOnETH[0],
      18
    ),
  },
  ethereumclassic: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "ethereumclassic",
      18,
      chainContracts.ethereumclassic.bridgedFromETH
    ),
  },
  near: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: nearBridged(chainContracts.near.bridgedFromETH[0], 18),
  },
  klaytn: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("klaytn", 18, chainContracts.klaytn.bridgedFromBSC),
  },
  dogechain: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "dogechain",
      18,
      chainContracts.dogechain.bridgedFromETH
    ),
  },
};

export default adapter;
