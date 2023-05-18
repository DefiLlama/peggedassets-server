const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
        const totalDebt = (
            await sdk.api.abi.call({
            abi: {"stateMutability":"view","type":"function","name":"total_debt","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
            target: "0xC9332fdCB1C491Dcc683bAe86Fe3cb70360738BC",
            block: _ethBlock,
            chain: chain,
            })
        ).output;
        sumSingleBalance(
            balances,
            "peggedUSD",
            totalDebt / 10 ** decimals,
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
  },
};

export default adapter;
