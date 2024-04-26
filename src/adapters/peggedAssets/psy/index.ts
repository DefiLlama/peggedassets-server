const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

const chainContracts = {
  arbitrum: {
    issued: "0x63d4dc5376cfb48a885a165cd97ba208b87881c7",
  },
};

async function arbitrumMinted(decimals: number) {
  return async function (
    _timestamp: number,
    _bscBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.arbitrum.issued,
        block: _chainBlocks?.["arbitrum"],
        chain: "arbitrum",
      })
    ).output;
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupply / 10 ** decimals,
      "issued",
      false
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  arbitrum: {
    minted: arbitrumMinted(18),
  },
};

export default adapter;
