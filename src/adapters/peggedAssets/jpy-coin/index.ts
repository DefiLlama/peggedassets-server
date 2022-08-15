const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
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

// The amounts minted on chains and in bridge contracts seem to have no relation to each other.
// Adapter treats each chain separately, subtracts the gnosis multisig address as unreleased, except for ethereum where it also subtracts the large amounts in bridge contracts.
const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x2370f9d504c7a6e775bf6e14b3f12846b594cd53"],
    unreleased: [
      "0x7a7f371abcab225c8d78341ebabae991f2e18828", // gnosis safe
      "0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf", // polygon bridge
      "0x4e67df0f232c3bc985f8a63326d80ce3d9a40400", // shiden bridge
      "0x88ad09518695c6c3712ac10a214be5109a655671", // gnosis bridge
    ],
  },
  avax: {
    issued: ["0x431d5dff03120afa4bdf332c61a6e1766ef37bdb"],
    unreleased: ["0x7a96b7cf21f543e6d20159112fb7a9e66de4ff4f"],
  },
  polygon: {
    issued: ["0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB"],
    unreleased: ["0x7a7F371aBCab225C8d78341eBabAE991F2e18828"],
  },
  shiden: {
    issued: ["0x431d5dff03120afa4bdf332c61a6e1766ef37bdb"],
    unreleased: ["0xb30B58386F51881024231b06470E6ed6Fe5bD725"],
  },
  astar: {
    issued: ["0x431d5dff03120afa4bdf332c61a6e1766ef37bdb"],
    unreleased: ["0x572BCbBFbd19d6D7D0c80660151a48da6331be2c"], // not sure if this is correct
  },
  xdai: {
    issued: ["0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB"],
    unreleased: ["0xa312f84607Efb1D200C313859156ccC3500189b6"],
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
        "peggedJPY",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

async function chainUnreleased(
  chain: string,
  decimals: number,
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
          target: chainContracts[chain].issued[0],
          owner: owner,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedJPY", reserve / 10 ** decimals);
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
      chainContracts.ethereum.unreleased
    ),
  },
  avalanche: {
    minted: chainMinted("avax", 18),
    unreleased: chainUnreleased("avax", 18, chainContracts.avax.unreleased),
  },
  polygon: {
    minted: chainMinted("polygon", 18),
    unreleased: chainUnreleased(
      "polygon",
      18,
      chainContracts.polygon.unreleased
    ),
  },
  shiden: {
    minted: chainMinted("shiden", 18),
    unreleased: chainUnreleased("shiden", 18, chainContracts.shiden.unreleased),
  },
  astar: {
    minted: chainMinted("astar", 18),
    unreleased: chainUnreleased("astar", 18, chainContracts.astar.unreleased),
  },
  xdai: {
    minted: chainMinted("xdai", 18),
    unreleased: chainUnreleased("xdai", 18, chainContracts.xdai.unreleased),
  },
};

export default adapter;
