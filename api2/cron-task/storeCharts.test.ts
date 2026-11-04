import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPriceSeries } from "../../src/utils/pricing";
import { cache } from "../cache";
import { balanceRecord, d3, d4, d5, d6, usdnSupply } from "../testFixtures";
import { craftChartsResponse } from "./storeCharts";

const balance = (SK: number) => balanceRecord(SK, usdnSupply, { waves: 1 });

test("a live listing with USDN's numbers is valued every chart day at the price known on that day, the peg only before the first record", () => {
  cache.priceSeries = buildPriceSeries([
    { SK: d4, prices: { tether: 0.015770918154435674 } },
    { SK: d5, prices: {} },
    { SK: d6, prices: { tether: 0.015759177953386896 } },
  ]);
  cache.fxRateMap = null;
  cache.peggedAssetsData = { "1": { balances: [balance(d3), balance(d4), balance(d5), balance(d6)] } };

  const chart = craftChartsResponse({ chain: "all", peggedID: "1", assetChainMap: { "1": new Set(["waves"]) } });

  const usdByDay = Object.fromEntries(chart.map((row: any) => [row.date, row.totalCirculatingUSD.peggedUSD]));
  const expected = { [d3]: 408891137.1, [d4]: 6448588.66, [d5]: 6448588.66, [d6]: 6443788.19 };
  assert.deepEqual(Object.keys(usdByDay), Object.keys(expected));
  for (const [day, usd] of Object.entries(expected)) {
    assert.ok(Math.abs(usdByDay[day] - usd) < 0.1, `day ${day}: ${usdByDay[day]} is not ${usd}`);
  }
});

test("a dead asset's chart ends on its deadFrom day although its balances run past it", () => {
  const jan31 = 1675123200;
  const feb1 = 1675209600;
  const feb2 = 1675296000;
  cache.priceSeries = buildPriceSeries([]);
  cache.fxRateMap = null;
  cache.peggedAssetsData = { "12": { balances: [balance(jan31), balance(feb1), balance(feb2)] } };

  const chart = craftChartsResponse({ chain: "all", peggedID: "12", assetChainMap: { "12": new Set(["waves"]) } });

  assert.deepEqual(
    chart.map((row: any) => row.date),
    [String(jan31), String(feb1)]
  );
  assert.deepEqual(
    cache.peggedAssetsData["12"].balances.map((b: any) => b.SK),
    [jan31, feb1, feb2]
  );
});

test("a chart day takes the day's record or the carried one, never the current price", () => {
  cache.peggedPrices = { "usd-coin": 0.5 };
  cache.priceSeries = buildPriceSeries([
    { SK: d5, prices: { "usd-coin": 0.9991 } },
    { SK: d6, prices: {} },
  ]);
  cache.fxRateMap = null;
  cache.peggedAssetsData = {
    "2": { balances: [balanceRecord(d5, 1000000, { ethereum: 1 }), balanceRecord(d6, 1000000, { ethereum: 1 })] },
  };

  const chart = craftChartsResponse({ chain: "all", peggedID: "2", assetChainMap: { "2": new Set(["ethereum"]) } });

  assert.deepEqual(
    chart.map((row: any) => [row.date, row.totalCirculatingUSD.peggedUSD]),
    [
      [String(d5), 999100],
      [String(d6), 999100],
    ]
  );
});
