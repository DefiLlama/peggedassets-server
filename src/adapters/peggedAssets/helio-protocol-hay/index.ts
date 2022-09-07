const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances
} from "../peggedAsset.type";

const chainContracts = {
    bsc: {
        issued: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
    },
};

async function bscMinted(decimals: number) {
return async function (
    _timestamp: number,
    _bscBlock: number,
    _chainBlocks: ChainBlocks
) {
  let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.bsc.issued,
        block: _chainBlocks?.["bsc"],
        chain: "bsc",
      })
    ).output;
    sumSingleBalance(balances, "peggedUSD", totalSupply / 10 ** decimals, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  bsc: {
    minted: bscMinted(18),
    unreleased: async () => ({}),
  },
};

export default adapter;