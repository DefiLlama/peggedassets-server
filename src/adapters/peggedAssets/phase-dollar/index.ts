const sdk = require("@defillama/sdk");

import { sumSingleBalance } from "../helper/generalUtil";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const config = {
  base: "0xbe92452bb46485AF3308e6d77786bFBE3557808d",
} as const;

type ConfigChain = keyof typeof config;

async function chainMinted(chain: ConfigChain) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;

    const cash = config[chain];

    let totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: cash,
        block: _chainBlocks?.[chain],
        chain: chain,
      })
    ).output;

    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupply / 10 ** 18,
      "issued",
      false
    );

    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {};

for (const chain of Object.keys(config) as ConfigChain[]) {
  adapter[chain] = {
    minted: chainMinted(chain),
    unreleased: async () => ({}),
  };
}

export default adapter;
