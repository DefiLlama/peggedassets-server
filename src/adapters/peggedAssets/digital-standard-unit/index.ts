const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    issued: string;
    unreleased: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: "0x605D26FBd5be761089281d5cec2Ce86eeA667109",
    unreleased: [
      "0xAEf566ca7E84d1E736f999765a804687f39D9094", // TwoWayBatcher
      "0x0B663CeaCEF01f2f88EB7451C70Aa069f19dB997", // WrapOnlyBatcher
    ],
  },
  arbitrum: {
    issued: "0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b",
    unreleased: [],
  },
  optimism: {
    issued: "0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b",
    unreleased: [],
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts[chain].issued,
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
    return balances;
  };
}

async function chainUnreleased(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let unreleased of chainContracts[chain].unreleased) {
      const unreleasedBalance = (
        await sdk.api.abi.call({
          abi: "erc20:balanceOf",
          target: chainContracts[chain].issued,
          params: [unreleased],
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedUSD",
        unreleasedBalance / 10 ** decimals,
        "unreleased",
        false
      );
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: chainUnreleased("ethereum", 18),
  },
  arbitrum: {
    minted: chainMinted("arbitrum", 18),
    unreleased: chainUnreleased("arbitrum", 18),
  },
  optimism: {
    minted: chainMinted("optimism", 18),
    unreleased: chainUnreleased("optimism", 18),
  },
};

export default adapter;
