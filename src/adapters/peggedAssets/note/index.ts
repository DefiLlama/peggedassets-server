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

const chainContracts: ChainContracts = {
  canto: {
    issued: ["0xEe602429Ef7eCe0a13e4FfE8dBC16e101049504C"], // cNote address; cNote and NOTE should be 1 to 1(?)
    reserve: ["0x4F6DCfa2F69AF7350AAc48D3a3d5B8D03b5378AA"],
  },
};

async function cantoCirculating(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts[chain].issued[0],
        block: _chainBlocks?.[chain],
        chain: chain,
      })
    ).output;
    sumSingleBalance(
      balances,
      "peggedUSD",
      (totalSupply) / 10 ** decimals,
      "issued",
      false
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  canto: {
    minted: cantoCirculating("canto", 18),
    unreleased: async () => ({}),
  },
};

export default adapter;
