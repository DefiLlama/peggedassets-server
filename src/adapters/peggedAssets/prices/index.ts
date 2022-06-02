const sdk = require("@defillama/sdk");
import chainabi from "./chainlink_abi.json";
import uniabi from "./uniswap_abi.json";
import { ChainBlocks } from "../peggedAsset.type";
import { PriceSource } from "../../../peggedData/types";

const TWAPIntervalInSeconds: number = 10;

type ChainlinkFeeds = {
  [coinGeckoID: string]: {
    address: string;
    chain: string;
    decimals: number;
  };
};

type UniswapPools = {
  [coinGeckoID: string]: {
    address: string;
    token: 0 | 1;
    chain: string;
    decimalsDifference: number; // difference between number of decimals for token1 and number for token0
  };
};

type SaddlePools = {
  [coinGeckoID: string]: {
    address: string;
    chain: string;
  };
};

const feeds: ChainlinkFeeds = {
  tether: {
    address: "0x3e7d1eab13ad0104d2750b8863b489d65364e32d",
    chain: "ethereum",
    decimals: 8,
  }, // USDT-USD ETH
  "usd-coin": {
    address: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
    chain: "ethereum",
    decimals: 8,
  }, // USDC-USD ETH
  terrausd: {
    address: "0x8b6d9085f310396C6E4f0012783E9f850eaa8a82",
    chain: "ethereum",
    decimals: 8,
  }, // UST-USD ETH
  "binance-usd": {
    address: "0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A",
    chain: "ethereum",
    decimals: 8,
  }, // BUSD-USD ETH
  dai: {
    address: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
    chain: "ethereum",
    decimals: 8,
  }, // DAI-USD ETH
  frax: {
    address: "0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD",
    chain: "ethereum",
    decimals: 8,
  }, // FRAX-USD ETH
  "true-usd": {
    address: "0xec746eCF986E2927Abd291a2A1716c940100f8Ba",
    chain: "ethereum",
    decimals: 8,
  }, // TUSD-USD ETH
  "fei-usd": {
    address: "0x31e0a88fecb6ec0a411dbe0e9e76391498296ee9",
    chain: "ethereum",
    decimals: 8,
  }, // FEI-USD ETH
  "magic-internet-money": {
    address: "0x7A364e8770418566e3eb2001A96116E6138Eb32F",
    chain: "ethereum",
    decimals: 8,
  }, // MIM-USD ETH
  "paxos-standard": {
    address: "0x09023c0da49aaf8fc3fa3adf34c6a7016d38d5e3",
    chain: "ethereum",
    decimals: 8,
  }, // USDP-USD ETH
  "liquity-usd": {
    address: "0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0",
    chain: "ethereum",
    decimals: 8,
  }, // LUSD-USD ETH
  neutrino: {
    address: "0x7a8544894f7fd0c69cfcbe2b4b2e277b0b9a4355",
    chain: "ethereum",
    decimals: 8,
  }, // USDN-USD ETH
  "gemini-dollar": {
    address: "0xa89f5d2365ce98B3cD68012b6f503ab1416245Fc",
    chain: "ethereum",
    decimals: 8,
  },
};

const uniswapPools: UniswapPools = {
  usdd: {
    address: "0x1C5c60bEf00C820274d4938A5e6d04b124D4910B",
    token: 0,
    chain: "ethereum",
    decimalsDifference: -12,
  },
  "dola-usd": {
    address: "0x7c082BF85e01f9bB343dbb460A14e51F67C58cFB",
    token: 0,
    chain: "ethereum",
    decimalsDifference: -12,
  },
};

export default async function getCurrentPeggedPrice(
  token: string,
  chainBlocks: ChainBlocks,
  priceSource: PriceSource
): Promise<Number | null> {
  if (priceSource === "chainlink") {
    const feed = feeds[token];
    const latestRound = await sdk.api.abi.call({
      abi: chainabi.latestRoundData,
      target: feed.address,
      block: chainBlocks[feed.chain],
      chain: feed.chain,
    });

    if (latestRound.output && feed.decimals) {
      return latestRound.output.answer / 10 ** feed.decimals;
    }
    console.error(`Could not get ChainLink price for token ${token}`);
    return null;
  }
  if (priceSource === "uniswap") {
    const pool = uniswapPools[token];
    const observe = await sdk.api.abi.call({
      abi: uniabi.observe,
      params: [[0, TWAPIntervalInSeconds]],
      target: pool.address,
      block: chainBlocks[pool.chain],
      chain: pool.chain,
    });
    if (observe.output && pool.decimalsDifference) {
      // following follows method given in https://docs.uniswap.org/protocol/concepts/V3-overview/oracle
      const token0TickCumulative = observe.output.tickCumulatives[0];
      const token1TickCumulative = observe.output.tickCumulatives[1];
      const weightedAverage =
        (token1TickCumulative - token0TickCumulative) / TWAPIntervalInSeconds;
      const token0token1PriceRatio =
        1.0001 ** weightedAverage * 10 ** pool.decimalsDifference;
      if (pool.token === 1) {
        return token0token1PriceRatio;
      } else return 1 / token0token1PriceRatio;
    }
    console.error(`Could not get Uniswap price for token ${token}`);
    return null;
  }
  console.error(`no method to get price for given priceSource for ${token}`);
  return null;
}
