const sdk = require("@defillama/sdk");
import {
  sumMultipleBalanceFunctions,
  sumSingleBalance,
} from "../helper/generalUtil";
import {
  bridgedSupply,
  solanaMintedOrBridged,
  bridgedSupplySubtractReserve,
  terraSupply,
  supplyInEthereumBridge,
  osmosisSupply,
} from "../helper/getSupply";
import { call as nearCall } from "../llama-helper/near";
import { getTotalBridged as pnGetTotalBridged } from "../helper/polynetwork";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
  PeggedAssetType,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  bsc: {
    issued: ["0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"],
    reserves: ["0x0000000000000000000000000000000000001004"],
  },
  avax: {
    issued: ["0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39"],
    reserves: ["0x4A13E986a4B8E123721aA1F621E046fe3b74F724"], // owner of the native "issued" contract
    bridgedFromBSC: ["0xA41a6c7E25DdD361343e8Cb8cFa579bbE5eEdb7a"], // wormhole
  },
  polygon: {
    issued: ["0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39"],
    reserves: ["0x4a13e986a4b8e123721aa1f621e046fe3b74f724"], // owner of native "issued" contract
    bridgedFromBSC: [
      "0x9fb83c0635de2e815fd1c21b3a292277540c2e8d", // multichain
      "0xA8D394fE7380b8cE6145d5f85E6aC22d4E91ACDe", // wormhole
    ],
  },
  optimism: {
    issued: ["0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39"],
    reserves: ["0x4a13e986a4b8e123721aa1f621e046fe3b74f724"], // owner of native "issued" contract
  },
  tron: {
    issued: ["TMz2SWatiAtZVVcH2ebpsbVtYwUPT9EdjH"],
    reserves: ["TDE6LDhCfAQbaxs5RLgjJmYbtP5YyorQeh"],
  },
  binance: {
    issued: ["bnb19v2ayq6k6e5x6ny3jdutdm6kpqn3n6mxheegvj"],
    reserves: ["bnb1v8vkkymvhe2sf7gd2092ujc6hweta38xadu2pj"],
  },
  solana: {
    bridgedFromBSC: ["5RpUwQ8wtdPCZHhu6MERp2RGrpobsbZ6MH5dDHkUjs2"], // wormhole
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
  } /*
  kava: {
    bridgeOnBNB: [
      "bnb1skl4n4vrzx3ty9ujaut8rmkhkmtl4t04ysllfm", // cold wallets on BNB chain
      "bnb10zq89008gmedc6rrwzdfukjk94swynd7dl97w8",
    ],
  },*/,
  klaytn: {
    bridgedFromBSC: ["0x210bc03f49052169d5588a52c317f71cf2078b85"], // orbit
  },
  thundercore: {
    bridgedFromBSC: ["0xBEB0131D95AC3F03fd15894D0aDE5DBf7451d171"],
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
  bsc: {
    minted: chainMinted("bsc", 18),
    unreleased: chainUnreleased("bsc", 18),
  },
  avalanche: {
    minted: chainMinted("avax", 18),
    unreleased: chainUnreleased("avax", 18),
    bsc: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromBSC),
  },
  polygon: {
    minted: chainMinted("polygon", 18),
    unreleased: chainUnreleased("polygon", 18),
    bsc: bridgedSupply("polygon", 18, chainContracts.polygon.bridgedFromBSC),
  },
  optimism: {
    minted: chainMinted("optimism", 18),
    unreleased: chainUnreleased("optimism", 18),
  },
  okexchain: {
    bsc: bridgedSupply(
      "okexchain",
      18,
      chainContracts.okexchain.bridgedFromBSC
    ),
  },
  moonriver: {
    bsc: bridgedSupply(
      "moonriver",
      18,
      chainContracts.moonriver.bridgedFromBSC
    ),
  },
  solana: {
    bsc: solanaMintedOrBridged(chainContracts.solana.bridgedFromBSC),
  } /*
  fuse: {
    bsc: bridgedSupply("fuse", 18, chainContracts.fuse.bridgedFromBSC),
  },*/,
  meter: {
    bsc: bridgedSupply("meter", 18, chainContracts.meter.bridgedFromBSC),
  },
  moonbeam: {
    bsc: bridgedSupply("moonbeam", 18, chainContracts.moonbeam.bridgedFromBSC),
  },
  milkomeda: {
    bsc: bridgedSupply(
      "milkomeda",
      18,
      chainContracts.milkomeda.bridgedFromBSC
    ),
  },
  elastos: {
    bsc: bridgedSupply("elastos", 18, chainContracts.elastos.bridgedFromBSC),
  },
  aurora: {
    bsc: bridgedSupply("aurora", 18, chainContracts.aurora.bridgedFromBSC),
  },
  oasis: {
    bsc: bridgedSupply("oasis", 18, chainContracts.oasis.bridgedFromBSC),
  },
  terra: {
    bsc: terraSupply(chainContracts.terra.bridgedFromBSC, 8),
  },
  shiden: {
    bsc: bridgedSupply("shiden", 18, chainContracts.shiden.bridgedFromBSC),
  },
  astar: {
    bsc: bridgedSupply("astar", 18, chainContracts.astar.bridgedFromBSC),
  },
  evmos: {
    bsc: bridgedSupply("evmos", 18, chainContracts.evmos.bridgedFromBSC),
  },
  syscoin: {
    bsc: bridgedSupply("syscoin", 18, chainContracts.syscoin.bridgedFromBSC),
  },
  boba: {
    bsc: bridgedSupply("boba", 18, chainContracts.boba.bridgedFromBSC),
  },
  metis: {
    bsc: sumMultipleBalanceFunctions(
      [bridgedSupply("metis", 18, chainContracts.metis.bridgedFromBSC)],
      "peggedUSD"
    ),
  },
  fantom: {
    bsc: bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromBSC),
  },
  kcc: {
    bsc: bridgedSupply("kcc", 18, chainContracts.kcc.bridgedFromBSC),
  },
  rsk: {
    bsc: bridgedSupply("rsk", 18, chainContracts.rsk.bridgedFromBSC),
  },
  theta: {
    bsc: bridgedSupply(
      "theta",
      18,
      chainContracts.theta.bridgedFromBSC,
      "multichain",
      "BSC"
    ),
  } /*
  kava: {
    bsc: kavaMinted(chainContracts.kava.bridgeOnBNB),
  },*/,
  klaytn: {
    bsc: bridgedSupply("klaytn", 18, chainContracts.klaytn.bridgedFromBSC),
  },
  thundercore: {
    bsc: bridgedSupply(
      "thundercore",
      18,
      chainContracts.thundercore.bridgedFromBSC
    ),
  },
};

export default adapter;
