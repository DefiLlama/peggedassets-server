const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    issued: string[];
    ignored?: string[]; // ignored addresses which have deadlock tokens
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x183015a9bA6fF60230fdEaDc3F43b3D788b13e21"],
    ignored: ["0x2ba26baE6dF1153e29813d7f926143f9c94402f3"],
  },
  base: {
    issued: ["0xafb2820316e7bc5ef78d295ab9b8bb2257534576"],
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const { issued: issuedAddresses, ignored: ignoredAddresses = [] } =
      chainContracts[chain];
    for (let issued of issuedAddresses) {
      let totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;

      for (let ignored of ignoredAddresses) {
        const ignoredBalance = (
          await sdk.api.abi.call({
            abi: "erc20:balanceOf",
            target: issued,
            params: ignored,
            block: _chainBlocks?.[chain],
            chain: chain,
          })
        ).output;
        totalSupply -= ignoredBalance;
      }

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

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
  },
  base: {
    minted: chainMinted("base", 18),
  },
};

export default adapter;
