/**
 * WAD (Whale Asset Dollar) stablecoin adapter
 *
 * WAD is an overcollateralized stablecoin issued by DorkFi (dork.fi),
 * a cross-chain borrow/lend protocol on the Algorand Virtual Machine (AVM).
 *
 * Chains:
 *   - Algorand: ASA ID 3334160924 (6 decimals)
 *
 * The ASA `total` is set to uint64 max (effectively uncapped).
 * Circulating supply = total_issued - creator_reserve_balance.
 *
 * We compute this as:
 *   minted    = total_supply (uint64 max, in WAD) — NOTE: BigInt required for precision
 *   unreleased = creator_wallet_balance
 *   circulating (computed by framework) = minted - unreleased
 *
 * Creator / reserve address (holds all un-minted WAD):
 *   KTKMGUA2YWZ4OF4P2UBDE57CYS2YRF6S7275EAF6VVC5D2Z3T6YNMBIMQM
 */

import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
import { lookupAccountByID } from "../helper/algorand";

const axios = require("axios");
const retry = require("async-retry");

const WAD_ASSET_ID = 3334160924;
const WAD_DECIMALS = 6;
// Creator wallet — holds all un-minted WAD supply
const WAD_CREATOR = "KTKMGUA2YWZ4OF4P2UBDE57CYS2YRF6S7275EAF6VVC5D2Z3T6YNMBIMQM";
const ALGONODE_INDEXER = "https://mainnet-idx.algonode.cloud";

/**
 * minted = total ASA supply (uint64 max).
 * We use BigInt to avoid float precision loss at large values, then
 * convert to a regular number once divided by decimals.
 */
async function algorandMinted() {
  return async function (_ts: any, _block: any, _chainBlocks: ChainBlocks) {
    const balances = {} as Balances;

    const assetRes = await retry(
      async (_bail: any) =>
        await axios.get(`${ALGONODE_INDEXER}/v2/assets/${WAD_ASSET_ID}`)
    );

    // Use string to preserve precision, then BigInt
    const totalRaw: string = String(
      assetRes?.data?.asset?.params?.total ?? "0"
    );
    const totalWAD = Number(BigInt(totalRaw)) / 10 ** WAD_DECIMALS;

    sumSingleBalance(balances, "peggedUSD", totalWAD, "issued", false);
    return balances;
  };
}

/**
 * unreleased = creator wallet balance (un-minted WAD sitting in reserve).
 * circulating (computed by framework) = minted - unreleased ≈ 10,600 WAD
 */
async function algorandUnreleased() {
  return async function (_ts: any, _block: any, _chainBlocks: ChainBlocks) {
    const balances = {} as Balances;

    const creatorAccount = await lookupAccountByID(WAD_CREATOR);
    const creatorBalanceRaw: number =
      creatorAccount?.account?.assets?.find(
        (a: any) => a["asset-id"] === WAD_ASSET_ID
      )?.amount ?? 0;

    const creatorWAD = creatorBalanceRaw / 10 ** WAD_DECIMALS;

    sumSingleBalance(balances, "peggedUSD", creatorWAD);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  algorand: {
    minted: algorandMinted(),
    unreleased: algorandUnreleased(),
  },
};

export default adapter;
