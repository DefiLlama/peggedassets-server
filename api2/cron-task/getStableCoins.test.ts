import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPriceSeries } from "../../src/utils/pricing";
import { cache } from "../cache";
import { d4, peggedAssetsData, priceRecords } from "../testFixtures";
import handler from "./getStableCoins";

async function runList(current: Record<string, number>) {
  cache.peggedPrices = current;
  cache.priceSeries = buildPriceSeries(priceRecords());
  cache.peggedAssetsData = peggedAssetsData();
  const logged: string[] = [];
  const info = console.info;
  console.info = (line: string) => logged.push(line);
  try {
    const response = await handler();
    const row = (id: string) => response.peggedAssets.find((asset: any) => asset.id === id);
    return { response, row, logged };
  } finally {
    console.info = info;
  }
}

function assertMoney(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) < 0.01, `${actual} is not ${expected}`);
}

test("a missing current price values a row with a stale balance at the last known price before the run", async () => {
  const { row } = await runList({});
  const usdn = row("12");
  assertMoney(usdn.circulating.peggedUSD, 6448588.66);
  assertMoney(usdn.circulatingPrevDay.peggedUSD, 6448588.66);
  assert.deepEqual(usdn.pricing, { price: 0.015770918154435674, asOf: d4, source: "last-known" });
  assert.equal(usdn.price, null);
  assert.equal(usdn.deadFrom, "2023-02-01");
  assertMoney(row("268").circulating.peggedUSD, 8718468.3);
  assert.equal(row("268").pricing.source, "last-known");
});

test("a current price values the row at the market with the run time as its date", async () => {
  const { row } = await runList({ neutrino: 0.0157, yu: 0.4 });
  assertMoney(row("12").circulating.peggedUSD, 6419590.85);
  assert.equal(row("12").pricing.price, 0.0157);
  assert.equal(row("12").pricing.source, "market");
  assert.ok(Math.abs(row("12").pricing.asOf - Date.now() / 1000) < 60, `asOf ${row("12").pricing.asOf}`);
  assertMoney(row("268").circulating.peggedUSD, 9088326.0);
});

test("each asset valued at the peg is named once in the log with its token count and the run's day", async () => {
  const { logged } = await runList({});
  const today = new Date().toISOString().slice(0, 10);
  assert.deepEqual(logged, [`rwaUSDi (id 340): 487,400,000 tokens valued at the peg on ${today}, no usable market price`]);
});
