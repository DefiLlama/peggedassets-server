/**
 * WAD (Whale Asset Dollar) stablecoin adapter
 *
 * WAD is an overcollateralized stablecoin issued by DorkFi (dork.fi),
 * a cross-chain borrow/lend protocol on the Algorand Virtual Machine (AVM).
 *
 * Chains:
 *   - Algorand: ASA ID 3334160924 (6 decimals)
 *   - Voi Network: ARC-200 app ID 47138068 (6 decimals)
 *
 * Algorand:
 *   The ASA `total` is set to uint64 max (effectively uncapped).
 *   Circulating = total_issued - creator_reserve_balance.
 *
 * Voi Network:
 *   WAD is an ARC-200 token minted exclusively via collateralized borrowing
 *   through DorkFi's A-Market. There is no pre-minted reserve - every WAD
 *   in existence is circulating. Circulating supply = arc200_totalSupply.
 *   The totalSupply is stored as a big-endian byte value in the app's
 *   global state under the key "totalSupply".
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
// Creator wallet - holds all un-minted WAD supply on Algorand
const WAD_CREATOR = "KTKMGUA2YWZ4OF4P2UBDE57CYS2YRF6S7275EAF6VVC5D2Z3T6YNMBIMQM";
const ALGONODE_INDEXER = "https://mainnet-idx.algonode.cloud";

const WAD_VOI_APP_ID = 47138068;
const VOI_INDEXER = "https://mainnet-idx.voi.nodely.dev";

/**
 * minted (Algorand) = total ASA supply (uint64 max).
 * BigInt used to avoid float precision loss.
 */
async function algorandMinted() {
  return async function (_ts: any, _block: any, _chainBlocks: ChainBlocks) {
    const balances = {} as Balances;

    const assetRes = await retry(
      async (_bail: any) =>
        await axios.get(`${ALGONODE_INDEXER}/v2/assets/${WAD_ASSET_ID}`, {
          timeout: 30000,
        })
    );

    const totalRaw: string = String(
      assetRes?.data?.asset?.params?.total ?? "0"
    );
    const totalWAD = Number(BigInt(totalRaw)) / 10 ** WAD_DECIMALS;

    sumSingleBalance(balances, "peggedUSD", totalWAD, "issued", false);
    return balances;
  };
}

/**
 * unreleased (Algorand) = creator wallet balance (un-minted WAD in reserve).
 * circulating = minted - unreleased
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

/**
 * minted (Voi) = ARC-200 totalSupply from app global state.
 *
 * The ARC-200 contract stores totalSupply as big-endian bytes under the
 * key "totalSupply" in global state. WAD on Voi is minted on-demand via
 * collateralized borrowing - there is no pre-minted reserve, so the
 * entire totalSupply equals circulating supply.
 */
async function voiMinted() {
  return async function (_ts: any, _block: any, _chainBlocks: ChainBlocks) {
    const balances = {} as Balances;

    const appRes = await retry(
      async (_bail: any) =>
        await axios.get(`${VOI_INDEXER}/v2/applications/${WAD_VOI_APP_ID}`, {
          timeout: 30000,
        })
    );

    const globalState: any[] =
      appRes?.data?.application?.params?.["global-state"] ?? [];

    // Find "totalSupply" key (base64-encoded).
    const TOTAL_SUPPLY_KEY = Buffer.from("totalSupply").toString("base64");
    const entry = globalState.find((x: any) => x.key === TOTAL_SUPPLY_KEY);
    const appId = appRes?.data?.application?.id ?? WAD_VOI_APP_ID;

    if (!entry || typeof entry.value?.bytes !== "string") {
      throw new Error(
        `Missing totalSupply global-state bytes for Voi WAD app ${appId} (key ${TOTAL_SUPPLY_KEY})`
      );
    }

    let totalRaw: bigint;
    try {
      const encodedBytes = entry.value.bytes;
      const raw = Buffer.from(encodedBytes, "base64");
      const normalizedInput = encodedBytes.replace(/=+$/, "");
      const normalizedDecoded = raw.toString("base64").replace(/=+$/, "");
      if (normalizedInput !== normalizedDecoded) {
        throw new Error("invalid base64");
      }

      const rawHex = raw.toString("hex");
      totalRaw = BigInt(`0x${rawHex || "0"}`);
    } catch (error) {
      throw new Error(
        `Failed to decode totalSupply global-state bytes for Voi WAD app ${appId} (key ${TOTAL_SUPPLY_KEY}): ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    const totalWAD = Number(totalRaw) / 10 ** WAD_DECIMALS;
    sumSingleBalance(balances, "peggedUSD", totalWAD, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  algorand: {
    minted: algorandMinted(),
    unreleased: algorandUnreleased(),
  },
  voi: {
    minted: voiMinted(),
    // No unreleased - WAD on Voi is only minted via borrowing, never pre-minted.
  },
};

export default adapter;
