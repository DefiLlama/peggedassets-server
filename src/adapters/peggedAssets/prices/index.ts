const sdk = require("@defillama/sdk");
import chainabi from "./chainlink_abi.json";
import uniabi from "./uniswap_abi.json";
import { ChainBlocks } from "../peggedAsset.type";
import { PriceSource } from "../../../peggedData/types";
import { getCurvePrice, OtherTokenTypes } from "./getCurvePrice";
const axios = require("axios");
const retry = require("async-retry");

const TWAPIntervalInSeconds: number = 10;

export type GetCoingeckoLog = () => Promise<any>;

const locks = [] as ((value: unknown) => void)[];
function getCoingeckoLock() {
  return new Promise((resolve) => {
    locks.push(resolve);
  });
}
function releaseCoingeckoLock() {
  const firstLock = locks.shift();
  if (firstLock !== undefined) {
    firstLock(null);
  }
}
// Rate limit is 50 calls/min for coingecko's API
// So we'll release one every 1.2 seconds to match it
setInterval(() => {
  releaseCoingeckoLock();
}, 2000);

type ChainlinkFeeds = {
  [coinGeckoID: string]: {
    address: string;
    chain: string;
    decimals: number;
  };
};

// Calculates price by using exchange rate between token0 and token1.
// If the other token in the pair is not one included in 'OtherTokenTypes', it's assumed to be priced $1.
type CurvePools = {
  [coinGeckoID: string]: {
    chain: string;
    address: string;
    tokenIndex: 0 | 1; // token0 or token1
    decimalsToken0: number;
    decimalsToken1: number;
    otherTokenisType?: OtherTokenTypes;
    use256abi?: boolean;
  };
};

type AddressesForDexes = {
  [coinGeckoID: string]: {
    address: string;
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
  }, // GUSD-USD ETH
  nusd: {
    address: "0xad35bd71b9afe6e4bdc266b345c198eadef9ad94",
    chain: "ethereum",
    decimals: 8,
  }, // NUSD-USD ETH
  usdk: {
    address: "0xfac81ea9dd29d8e9b212acd6edbeb6de38cb43af",
    chain: "ethereum",
    decimals: 8,
  }, // USDK-USD ETH
  vai: {
    address: "0x058316f8bb13acd442ee7a216c7b60cfb4ea1b53",
    chain: "bsc",
    decimals: 8,
  }, // VAI-USD BSC
  rai: {
    address: "0x483d36f6a1d063d580c7a24f9a42b346f3a69fbb",
    chain: "ethereum",
    decimals: 8,
  }, // RAI-USD ETH
  "tether-eurt": {
    address: "0x01d391a48f4f7339ac64ca2c83a07c22f95f587a",
    chain: "ethereum",
    decimals: 8,
  }, // EURT-USD ETH
};

const curvePools: CurvePools = {
  husd: {
    chain: "ethereum",
    address: "0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604",
    tokenIndex: 0,
    decimalsToken0: 8,
    decimalsToken1: 18,
    otherTokenisType: "3crv",
  },
  "alchemix-usd": {
    chain: "ethereum",
    address: "0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 18,
    otherTokenisType: "3crv",
  },
  "yusd-stablecoin": {
    chain: "avax",
    address: "0x1da20Ac34187b2d9c74F729B85acB225D3341b25",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 6,
  },
  usdd: {
    chain: "ethereum",
    address: "0xe6b5CC1B4b47305c58392CE3D359B10282FC36Ea",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 18,
    otherTokenisType: "3crv",
  },
  "dola-usd": {
    chain: "ethereum",
    address: "0xAA5A67c256e27A5d80712c51971408db3370927D",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 18,
    otherTokenisType: "3crv",
  },
  "origin-dollar": {
    chain: "ethereum",
    address: "0x87650D7bbfC3A9F10587d7778206671719d9910D",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 18,
    otherTokenisType: "3crv",
  },
  reserve: {
    chain: "ethereum",
    address: "0xC18cC39da8b11dA8c3541C598eE022258F9744da",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 18,
    otherTokenisType: "3crv",
  },
  musd: {
    chain: "ethereum",
    address: "0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 18,
    otherTokenisType: "3crv",
  },
  tor: {
    chain: "fantom",
    address: "0x24699312CB27C26Cfc669459D670559E5E44EE60",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 18,
    otherTokenisType: "2crv",
  },
  spiceusd: {
    chain: "avax",
    address: "0x90D5233b53436767fecACD1a783D3dA8Cc7395ED",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 18,
    otherTokenisType: "3crv",
  },
  usdp: {
    chain: "ethereum",
    address: "0xc270b3B858c335B6BA5D5b10e2Da8a09976005ad",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 18,
    otherTokenisType: "3crv",
  },
  mimatic: {
    chain: "polygon",
    address: "0x447646e84498552e62eCF097Cc305eaBFFF09308",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 18,
    otherTokenisType: "am3crv",
  },
  "token-dforce-usd": {
    chain: "ethereum",
    address: "0x76264772707c8Bc24261516b560cBF3Cbe6F7819",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 18,
    otherTokenisType: "3crv",
  },
  "dei-token": {
    chain: "ethereum",
    address: "0x6870F9b4DD5d34C7FC53D0d85D9dBd1aAB339BF7",
    tokenIndex: 0,
    decimalsToken0: 18,
    decimalsToken1: 18,
    otherTokenisType: "3crv",
  },
  "stasis-eurs": {
    chain: "ethereum",
    address: "0x98a7F18d4E56Cfe84E3D081B40001B3d5bD3eB8B",
    tokenIndex: 1,
    decimalsToken0: 6,
    decimalsToken1: 2,
    use256abi: true,
  },
};

const dexscreener: AddressesForDexes = {
  usdd: {
    address: "0xd17479997F34dd9156Deef8F95A52D81D265be9c", // pools on BSC
    // address: "0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6", pools on ETH, but dexscreener rugged them for some reason
  },
  husd: {
    address: "0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047",
  },
  "yusd-stablecoin": {
    address: "0x111111111111ed1D73f860F57b2798b683f2d325",
  },
  "dola-usd": {
    address: "0x865377367054516e17014CcdED1e7d814EDC9ce4",
  },
  "alchemix-usd": {
    address: "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9",
  },
  "origin-dollar": {
    address: "0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86",
  },
  tor: {
    address: "0x74E23dF9110Aa9eA0b6ff2fAEE01e740CA1c642e",
  },
  spiceusd: {
    address: "0xaB05b04743E0aeAF9D2cA81E5D3b8385e4BF961e",
  },
  "sperax-usd": {
    address: "0xD74f5255D557944cf7Dd0E45FF521520002D5748",
  },
  "usd-balance": {
    address: "0x6Fc9383486c163fA48becdEC79d6058f984f62cA",
  },
  mimatic: {
    address: "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d",
  },
  "float-protocol-float": {
    address: "0xb05097849BCA421A3f51B249BA6CCa4aF4b97cb9",
  },
  usd: {
    address: "0x236eeC6359fb44CCe8f97E99387aa7F8cd5cdE1f",
  },
  "dei-token": {
    address: "0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3",
  },
  "bai-stablecoin": {
    address: "0x733ebcC6DF85f8266349DEFD0980f8Ced9B45f35",
  },
  "par-stablecoin": {
    address: "0x68037790A0229e9Ce6EaA8A99ea92964106C4703",
  },
};

const birdeye: AddressesForDexes = {
  "parrot-usd": {
    address: "Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS",
  },
  "ratio-stable-coin": {
    address: "USDrbBQwQbQ2oWHUPfA8QBHcyVxKUq1xHyXsSLKdUq2",
  },
};

const uniswapPools: UniswapPools = {
  reserve: {
    address: "0x98a19D4954B433Bd315335A05d7d6371D812A492",
    token: 0,
    chain: "ethereum",
    decimalsDifference: -12,
  },
};

const kucoinPairs: AddressesForDexes = {
  "celo-dollar": {
    address: "CUSD-USDT",
  },
  "celo-euro": {
    address: "CEUR-USDT",
  },
};

export default async function getCurrentPeggedPrice(
  token: string,
  chainBlocks: ChainBlocks,
  priceSource: PriceSource
): Promise<Number | null> {
  if (priceSource === "chainlink") {
    const feed = feeds[token];
    if (feed) {
      const latestRound = await sdk.api.abi.call({
        abi: chainabi.latestRoundData,
        target: feed.address,
        block: chainBlocks[feed.chain],
        chain: feed.chain,
      });

      if (latestRound.output && feed.decimals) {
        return latestRound.output.answer / 10 ** feed.decimals;
      }
    }
    console.error(`Could not get ChainLink price for token ${token}`);
    return null;
  }
  if (priceSource === "curve") {
    const pool = curvePools[token];
    const {
      chain,
      address,
      tokenIndex,
      decimalsToken0,
      decimalsToken1,
      otherTokenisType,
      use256abi,
    } = pool;
    if (pool) {
      for (let i = 0; i < 5; i++) {
        try {
          const price = await getCurvePrice(
            chain,
            chainBlocks,
            address,
            tokenIndex,
            decimalsToken0,
            decimalsToken1,
            otherTokenisType,
            use256abi
          );
          if (price) {
            return price;
          } else {
            console.error(`Could not get Curve price for token ${token}`);
            return null;
          }
        } catch (e) {
          console.error(token, e);
          continue;
        }
      }
    }
  }
  if (priceSource === "uniswap") {
    const pool = uniswapPools[token];
    if (pool) {
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
    }
    console.error(`Could not get Uniswap price for token ${token}`);
    return null;
  }
  if (priceSource === "dexscreener") {
    const address = dexscreener[token]?.address;
    if (address) {
      for (let i = 0; i < 5; i++) {
        try {
          const res = await axios.get(
            `https://api.dexscreener.com/latest/dex/tokens/${address}`
          );
          const filteredPools = res.data.pairs
            .filter((obj: any) => obj?.baseToken?.address === `${address}`)
            .sort((a: any, b: any) => {
              if (a.liquidity?.usd === undefined) {
                return 1;
              } else if (b.liquidity?.usd === undefined) {
                return -1;
              } else return b.liquidity.usd - a.liquidity.usd;
            });
          const poolWithGreatestLiquidity = filteredPools[0];
          const price = parseFloat(poolWithGreatestLiquidity?.priceUsd);
          if (price) {
            return price;
          } else {
            console.error(`Could not get Dexscreener price for token ${token}`);
            return null;
          }
        } catch (e) {
          console.error(token, e);
          continue;
        }
      }
    }
    console.error(`Could not get Dexscreener price for token ${token}`);
    return null;
  }
  if (priceSource === "birdeye") {
    const address = birdeye[token]?.address;
    if (address) {
      for (let i = 0; i < 5; i++) {
        try {
          const res = await axios.get(
            `https://public-api.birdeye.so/public/price?address=${address}`
          );
          const price = res?.data?.data?.value;
          if (price) {
            return price;
          } else {
            console.error(`Could not get Birdeye price for token ${token}`);
            return null;
          }
        } catch (e) {
          console.error(token, e);
          continue;
        }
      }
    }
    console.error(`Could not get Birdeye price for token ${token}`);
    return null;
  }
  if (priceSource === "kucoin") {
    const symbol = kucoinPairs[token]?.address;
    if (symbol) {
      for (let i = 0; i < 5; i++) {
        try {
          const res = await axios.get(
            `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}`
          );
          const price = parseFloat(res?.data?.data?.price);
          if (price) {
            return price;
          } else {
            console.error(`Could not get Kucoin price for token ${token}`);
            return null;
          }
        } catch (e) {
          console.error(token, e);
          continue;
        }
      }
    }
    console.error(`Could not get Birdeye price for token ${token}`);
    return null;
  }
  if (priceSource === "coingecko") {
    // only use as last resort
    for (let i = 0; i < 5; i++) {
      try {
        await getCoingeckoLock();
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`
        );
        const price = res?.data?.[token]?.usd;
        if (price) {
          return price;
        } else {
          console.error(`Could not get Coingecko price for token ${token}`);
          return null;
        }
      } catch (e) {
        console.error(token, e);
        continue;
      }
    }
    console.error(`Could not get Coingecko price for token ${token}`);
    return null;
  }
  console.error(
    `no priceSource method given or failed to get price for ${token}`
  );
  return null;
}
