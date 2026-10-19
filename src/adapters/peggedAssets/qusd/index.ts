const sdk = require("@defillama/sdk");
const { sumSingleBalance } = require("../helper/generalUtil");
const {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} = require("../peggedAsset.type");

/*
 * QUSD — QVTX USD, issued by QUANTVESTRIX.
 *
 * 1:1 USD, fiat-backed. The peg is on chain, not merely asserted:
 *   QUSD_PEG()        selector 0x06cbb491  returns 100000000 (= 1.00 at 8 dp)
 *   AggregatorV3 peg oracles return latestAnswer 100000000 on every chain below:
 *     polygon   0xc48fa8420648F281a0CFA5bc94a1ABa9E9665250
 *     bsc       0xC9DE8Df633191dDb1727e81a0D5dD8F4FA95296B
 *     base      0x05ffE0B7B4Cf096d0189f13349387282405A3538
 *     arbitrum  0xc48fa8420648F281a0CFA5bc94a1ABa9E9665250
 *   backing()/backingBps() returns 10000 bps = exactly 1:1.
 *
 * Public documents:
 *   token list   https://audit.quantvestrix.io/tokenlist.json
 *   reserves     https://audit.quantvestrix.io/qusd/reserves
 *   supply       https://audit.quantvestrix.io/qusd/supply
 *   circulating  https://audit.quantvestrix.io/qusd/circulating
 *
 * Notes on what is and is not counted here:
 *  - Wrapped variants (wQUSD) are DELIBERATELY EXCLUDED. They wrap a QUSD contract
 *    already listed below, so counting both sides would double count the supply.
 *  - Low-supply test deployments (*_v2, supply <= 1000) are excluded.
 *  - QVTX chain 42000 is not a DefiLlama chain, so the QUSD issued there is not
 *    represented in this adapter. It is published at the endpoints above.
 *  - `unreleased` is the issuer's own holdings: supply minus these is the
 *    circulating float.
 */

const chainContracts: { [chain: string]: { [key: string]: string[] } } = {
  polygon: {
    issued: [
      "0xa225d99ed91c3592be1396324b81a52a184b30e2", // QUSD (Cascade)
      "0xb57bf3c50f20096723b46645f741f632aef220fa", // QUSD (canonical, CREATE2)
      "0x8d58debf89740da1416d5f1904e4286096174b5a", // pQUSD
    ],
    unreleased: [
      "0xCDb91C04B6A730f52fd23887d002d9d6BEE4C066",
      "0x60D021B8949bFd0FB7ac0c695d9a389181D49eBd",
      "0x2754FbBC994114c5e3b0BC7aC486Bd386DD52eBA",
    ],
  },
  bsc: {
    issued: [
      "0x76f63354b28ae6d500420f8ecffe0bbc179b1641", // QUSD
      "0xff6bd9eadef121e51b1b077ca654fd0c77829556", // bQUSD
      "0x63c4664ceb3e93ef22d1e56826395fb1c927c118", // QUSD
      "0x5a8ba77fcc84f6766f6eb54477149c7b9aa0a2fa", // QUSD
      "0x73e8107025a7f1e427ffc59767c97790fe4fa57d", // QUSD
      "0x6a3f04f3c0628f85f16962928de1a0b7d187f4b5", // QUSD-F
    ],
    unreleased: [
      "0x60D021B8949bFd0FB7ac0c695d9a389181D49eBd",
      "0xCDb91C04B6A730f52fd23887d002d9d6BEE4C066",
      "0x13b91b90fdd228cB196278852DC61A8f40eBE097",
    ],
  },
  base: {
    issued: [
      "0xdd5375facc986dd9bd905fe96e25c9acfa51cd72", // baseQUSD
      "0x82c20093a3ee8bea24ac5807d387471d61454669", // QUSD
    ],
    unreleased: [
      "0x60D021B8949bFd0FB7ac0c695d9a389181D49eBd",
      "0xCDb91C04B6A730f52fd23887d002d9d6BEE4C066",
    ],
  },
  arbitrum: {
    issued: [
      "0xdd5375facc986dd9bd905fe96e25c9acfa51cd72", // arbQUSD
      "0xd9a0de9564e7e510455f62d5b21b6b2367e694bb", // QUSD
    ],
    unreleased: [
      "0x60D021B8949bFd0FB7ac0c695d9a389181D49eBd",
      "0xCDb91C04B6A730f52fd23887d002d9d6BEE4C066",
    ],
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    chainBlocks: ChainBlocks
  ) {
    const balances = {} as Balances;
    for (const issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: chainBlocks[chain],
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

async function chainUnreleased(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    chainBlocks: ChainBlocks
  ) {
    const balances = {} as Balances;
    for (const issued of chainContracts[chain].issued) {
      for (const owner of chainContracts[chain].unreleased) {
        const reserve = (
          await sdk.api.erc20.balanceOf({
            target: issued,
            owner: owner,
            block: chainBlocks[chain],
            chain: chain,
          })
        ).output;
        sumSingleBalance(balances, "peggedUSD", reserve / 10 ** decimals);
      }
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  polygon: {
    minted: chainMinted("polygon", 18),
    unreleased: chainUnreleased("polygon", 18),
  },
  bsc: {
    minted: chainMinted("bsc", 18),
    unreleased: chainUnreleased("bsc", 18),
  },
  base: {
    minted: chainMinted("base", 18),
    unreleased: chainUnreleased("base", 18),
  },
  arbitrum: {
    minted: chainMinted("arbitrum", 18),
    unreleased: chainUnreleased("arbitrum", 18),
  },
};

export default adapter;
