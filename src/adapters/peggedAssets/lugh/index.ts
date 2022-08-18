const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import {
  getTotalSupply as tezosGetTotalSupply,
  getBalance as tezosGetBalance,
} from "../helper/tezos";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  tezos: {
    issued: ["KT1JBNFcB5tiycHNdYGYCtR3kk6JaJysUCi8"],
    unreleased: ["tz1TmgGBuHZgUZSsvu9SajKiTJxiewXfJsVq"], // appears to just be a whale with 90% of the supply, the coin's attestations claim all minted tokens are circulating
  },
  ethereum: {
    issued: ["0xA967Dd943B336680540011536E7D8c3d33333515"],
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
        "peggedEUR",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

async function tezosMinted(contract: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await tezosGetTotalSupply(contract);
    sumSingleBalance(balances, "peggedEUR", totalSupply, "issued", false);
    return balances;
  };
}

async function tezosUnreleased(address: string, tokenID: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await tezosGetBalance(address, tokenID);
    sumSingleBalance(balances, "peggedEUR", totalSupply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  tezos: {
    minted: tezosMinted(chainContracts.tezos.issued[0]),
    unreleased: async () => ({}),
  },
  ethereum: {
    minted: chainMinted("ethereum", 6),
    unreleased: async () => ({}),
  },
};

export default adapter;
