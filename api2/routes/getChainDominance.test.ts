import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPriceSeries } from "../../src/utils/pricing";
import { cache } from "../cache";
import { d6, peggedAssetsData, priceRecords } from "../testFixtures";
import { craftChainDominanceResponse } from "./getChainDominance";

test("dominance leaves dead assets out and values the rest at the last known price", () => {
  cache.peggedPrices = {};
  cache.priceSeries = buildPriceSeries(priceRecords());
  cache.peggedAssetsData = peggedAssetsData();
  const dominance = craftChainDominanceResponse("ethereum");
  assert.deepEqual(dominance.map((row) => row.date), [String(d6)]);
  assert.ok(Math.abs(dominance[0].totalCirculatingUSD.peggedUSD! - 496118468.3) < 0.01);
  assert.deepEqual(dominance[0].greatestMcap, { gecko_id: null, symbol: "rwaUSDi", mcap: 487400000 });
});
