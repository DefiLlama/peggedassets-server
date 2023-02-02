const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
  bridgedSupplySubtractReserve,
} from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x0a5E677a6A24b2F1A2Bf4F3bFfC443231d2fDEc8"],
    unreleased: [
      "0x9e8b68e17441413b26c2f18e741eaba69894767c", // MSD
      "0x40be37096ce3b8a2e9ec002468ab91071501c499", // L1 escrow
      "0x5427fefa711eff984124bfbb1ab6fbf5e3da1820", // cbridge
      //"0x1adc34af68e970a93062b67344269fd341979eb0", // iUSX
    ],
  },
  polygon: {
    issued: ["0xCf66EB3D546F0415b368d98A95EAF56DeD7aA752"],
    unreleased: [
      "0xc171ebe1a2873f042f1dddd9327d00527ca29882", // cbridge
    //"0x88dcdc47d2f83a99cf0000fdf667a468bb958a78", // iUSX
    ],
  },
  bsc: {
    issued: ["0xb5102cee1528ce2c760893034a4603663495fd72"],
    unreleased: [
      "0xdd90e5e87a2081dcf0391920868ebc2ffb81a1af", // cbridge
      //"0x7b933e1c1f44be9fb111d87501baada7c8518abe", // iUSX
    ],
  },
  avax: {
    issued: ["0x853ea32391AaA14c112C645FD20BA389aB25C5e0"],
    unreleased: [
      "0x73c01b355f2147e5ff315680e068354d6344eb0b", // cbridge
      "0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4", // iUSX, none is borrowed
    ],
  },
  kava: {
    issued: ["0xDb0E1e86B01c4ad25241b1843E407Efc4D615248"],
    unreleased: [
      "0xb51541df05DE07be38dcfc4a80c05389A54502BB", // cbridge
      "0x9787aF345E765a3fBf0F881c49f8A6830D94A514", // iUSX, none is borrowed
    ], 
  },
  arbitrum: {
    issued: ["0x641441c631e2f909700d2f41fd87f0aa6a6b4edb"],
    unreleased: [
      "0x9e8b68e17441413b26c2f18e741eaba69894767c", // vault
      "0x1619de6b6b20ed217a58d00f37b9d47c7663feca", // cbridge
      //"0x0385f851060c09a552f1a28ea3f612660256cbaa", // iUSX
    ],
  },
  optimism: {
    issued: ["0xbfD291DA8A403DAAF7e5E9DC1ec0aCEaCd4848B9"],
    unreleased: [
      "0x40a33fb67b8dafe88a5b1930be03c82157f47c65", // don't know
      "0x9D39Fc627A6d9d9F8C831c16995b209548cc3401", // cbridge
      //"0x7e7e1d8757b241aa6791c089314604027544ce43", // iUSX
    ],
  },
};

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

async function ethereumUnreleased(
  chain: string,
  decimals: number,
  target: string,
  owner: string
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const balance = (
      await sdk.api.erc20.balanceOf({
        target: target,
        owner: owner,
        block: _chainBlocks?.[chain],
        chain: chain,
      })
    ).output;

    sumSingleBalance(
      balances,
      "peggedUSD",
      balance / 10 ** decimals,
      "issued",
      false
    );
    return balances;
  };
}

async function chainUnreleased(
  chain: string,
  decimals: number,
  target: string,
  owners: string[]
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let owner of owners) {
      const reserve = (
        await sdk.api.erc20.balanceOf({
          target: target,
          owner: owner,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", reserve / 10 ** decimals);
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: chainUnreleased(
      "ethereum",
      18,
      chainContracts.ethereum.issued[0],
      chainContracts.ethereum.unreleased
    ),
  },
  polygon: {
    minted: chainMinted("polygon", 18),
    unreleased: chainUnreleased(
      "polygon",
      18,
      chainContracts.polygon.issued[0],
      chainContracts.polygon.unreleased
    ),
  },
  bsc: {
    minted: chainMinted("bsc", 18),
    unreleased: chainUnreleased(
      "bsc",
      18,
      chainContracts.bsc.issued[0],
      chainContracts.bsc.unreleased
    ),
  },
  /* chain no longer supported
  avalanche: {
    minted: chainMinted("avax", 18),
    unreleased: chainUnreleased(
      "avax",
      18,
      chainContracts.avax.issued[0],
      chainContracts.avax.unreleased
    ),
  },
  */
  avalanche: {
    minted: async () => ({}),
    unreleased: async () => ({}),
  },
  kava: {
    minted: chainMinted("kava", 18),
    unreleased: chainUnreleased(
      "kava",
      18,
      chainContracts.kava.issued[0],
      chainContracts.kava.unreleased
    ),
  },
  optimism: {
    minted: chainMinted("optimism", 18),
    unreleased: chainUnreleased(
      "optimism",
      18,
      chainContracts.optimism.issued[0],
      chainContracts.optimism.unreleased
    ),
  },
  arbitrum: {
    minted: chainMinted("arbitrum", 18),
    unreleased: chainUnreleased(
      "arbitrum",
      18,
      chainContracts.arbitrum.issued[0],
      chainContracts.arbitrum.unreleased
    ),
  },
};

export default adapter;
