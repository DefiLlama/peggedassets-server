import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPriceSeries } from "../../src/utils/pricing";
import { cache } from "../cache";
import { peggedAssetsData, priceRecords } from "../testFixtures";
import { craftStablecoinChainsResponse } from "./getStablecoinChains";

test("chain totals leave dead assets out and value the rest at the last known price", () => {
  cache.peggedPrices = {};
  cache.priceSeries = buildPriceSeries(priceRecords());
  cache.peggedAssetsData = peggedAssetsData();
  const chains = craftStablecoinChainsResponse();
  assert.equal(chains.find((chain) => chain.name === "Waves"), undefined);
  const ethereum = chains.find((chain) => chain.name === "Ethereum");
  assert.ok(Math.abs(ethereum!.totalCirculatingUSD.peggedUSD - 496118468.3) < 0.01);
});
