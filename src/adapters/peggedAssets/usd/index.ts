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
  polygon: {
    issued: ["0x236eec6359fb44cce8f97e99387aa7f8cd5cde1f"],
  },
  bsc: {
    issued: ["0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65"],
  },
  avax: {
    issued: ["0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65"],
  },
  optimism: {
    issued: ["0x73cb180bf0521828d8849bc8CF2B920918e23032"],
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

const adapter: PeggedIssuanceAdapter = {
  polygon: {
    minted: chainMinted("polygon", 6),
    unreleased: async () => ({}),
  },
  bsc: {
    minted: chainMinted("bsc", 6),
    unreleased: async () => ({}),
  },
  avalanche: {
    minted: chainMinted("avax", 6),
    unreleased: async () => ({}),
  },
  optimism: {
    minted: chainMinted("optimism", 6),
    unreleased: async () => ({}),
  },
};

export default adapter;
