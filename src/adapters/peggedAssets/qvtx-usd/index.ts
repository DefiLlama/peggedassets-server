const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
  ChainContracts,
} from "../peggedAsset.type";

/*
 * QVTX USD (QUSD) - fiat-backed, redeemable at par.
 *
 * One contract at ONE address on every chain it is deployed to, so `minted` is genuine
 * per-chain issuance and nothing is double counted. The issuer's treasury and reserve
 * wallets are reported as `unreleased`: those coins were minted but have never
 * circulated, and counting them as supply would overstate the float.
 *
 * Backing is verifiable on-chain without trusting the issuer. Every deployment exposes
 * totalBackingCents() alongside totalSupply(); read on 2026-09-14 they match exactly on
 * all five chains (100,001 each on BSC/Polygon/Base/Arbitrum; 1,000,200,005 on the
 * issuer's own chain 42000, which DefiLlama does not index and which is therefore
 * deliberately absent from this adapter).
 */

const QUSD = "0xb57bf3c50f20096723b46645f741f632aef220fa";

// Issuer-held. Coins here have never circulated -> `unreleased`, never `minted`.
const TREASURY = "0x60D021B8949bFd0FB7ac0c695d9a389181D49eBd";
const RESERVES = "0xCDb91C04B6A730f52fd23887d002d9d6BEE4C066";

const chainContracts: ChainContracts = {
  bsc: { issued: [QUSD], reserves: [TREASURY, RESERVES] },
  polygon: { issued: [QUSD], reserves: [TREASURY, RESERVES] },
  base: { issued: [QUSD], reserves: [TREASURY, RESERVES] },
  arbitrum: { issued: [QUSD], reserves: [TREASURY, RESERVES] },
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

async function chainUnreleased(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let owner of chainContracts[chain].reserves) {
      const reserve = (
        await sdk.api.erc20.balanceOf({
          target: chainContracts[chain].issued[0],
          owner: owner,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", reserve / 10 ** decimals);
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  bsc: {
    minted: chainMinted("bsc", 18),
    unreleased: chainUnreleased("bsc", 18),
  },
  polygon: {
    minted: chainMinted("polygon", 18),
    unreleased: chainUnreleased("polygon", 18),
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
