import { test } from "node:test";
import assert from "node:assert/strict";
import { pegFallbackLines, priceFeedReport } from "./priceFeedReport";
import { PriceSeries } from "./pricing";

test("only peg-valued rows of at least a million tokens get a fallback line naming the valued day", () => {
  const peg = { price: 1, asOf: null, source: "peg" as const };
  const lines = pegFallbackLines(
    [
      { id: "268", symbol: "YU", circulating: 22720815, pricing: { price: 0.99, asOf: 1791158400, source: "last-known" } },
      { id: "340", symbol: "rwaUSDi", circulating: 487400000, pricing: peg },
      { id: "999", symbol: "SMALL", circulating: 900000, pricing: peg },
    ],
    1791158400 + 13 * 3600
  );
  assert.deepEqual(lines, ["rwaUSDi (id 340): 487,400,000 tokens valued at the peg on 2026-10-05, no usable market price"]);
});

const feedSeries: PriceSeries = new Map([
  [
    "neutrino",
    [
      { SK: 1790985600, price: 0.015770918154435674 },
      { SK: 1791417600, price: 0.01576 },
    ],
  ],
  ["tether", [{ SK: 1791417600, price: 0.9991 }]],
]);
const feedAssets = [
  { id: "36", symbol: "USDN", gecko_id: "neutrino", circulating: 408891137, inactive: false },
  { id: "1", symbol: "USDT", gecko_id: "tether", circulating: 1e11, inactive: false },
];

test("an asset with a series entry and no current price is reported as lost from its last entry", () => {
  const report = priceFeedReport(feedSeries, { tether: 0.9992 }, feedAssets);
  assert.ok(report);
  assert.equal(report.split("\n")[0], "**Stablecoin prices: 1 lost, 1 with no price in this run**");
  assert.match(report, /^symbol +\| id +\| gecko +\| tokens +\| last price +\| last seen$/m);
  assert.match(report, /^USDN +\| 36 +\| neutrino +\| 408,891,137 +\| 0\.01576 +\| 2026-10-08$/m);
  assert.doesNotMatch(report, /USDT/);
  assert.match(report, /^Resolve: check https:\/\/coins\.llama\.fi\/prices\/current\/coingecko:<gecko_id>/m);
});

test("a working feed with no lost asset reports nothing", () => {
  assert.equal(priceFeedReport(feedSeries, { neutrino: 0.0157, tether: 0.9992 }, feedAssets), null);
});

test("a failed feed says so and lists every asset with a series entry", () => {
  const report = priceFeedReport(feedSeries, null, feedAssets);
  assert.ok(report);
  assert.equal(report.split("\n")[0], "**Stablecoin price feed failed: 2 lost, 2 with no price in this run**");
  assert.match(report, /^USDT +\| 1 +\| tether +\| 100,000,000,000 +\| 0\.9991 +\| 2026-10-08$/m);
  assert.match(report, /^USDN +\| 36 +\| neutrino +\| 408,891,137 +\| 0\.01576 +\| 2026-10-08$/m);
});

test("a lost asset below the token minimum is counted, not listed", () => {
  const assets = [...feedAssets, { id: "500", symbol: "TINY", gecko_id: "tiny", circulating: 500000, inactive: false }];
  const series: PriceSeries = new Map([...feedSeries, ["tiny", [{ SK: 1791417600, price: 1 }]]]);
  const report = priceFeedReport(series, { tether: 0.9992 }, assets);
  assert.ok(report);
  assert.doesNotMatch(report, /TINY/);
  assert.match(report, /^Lost below 1,000,000 tokens, not listed: 1$/m);
});

test("a long report stays under 1,800 characters with 25 rows and a count of the rest", () => {
  const assets = Array.from({ length: 40 }, (_, i) => ({
    id: String(i),
    symbol: `S${i}`,
    gecko_id: `g${i}`,
    circulating: 5000000 + i,
    inactive: false,
  }));
  const series: PriceSeries = new Map(assets.map((asset) => [asset.gecko_id, [{ SK: 1791417600, price: 0.9991 }]]));
  const report = priceFeedReport(series, {}, assets);
  assert.ok(report);
  assert.ok(report.length < 1800, `length ${report.length}`);
  assert.match(report, /and 15 more/);
});

test("wide rows drop below 25 so the report still stays under 1,800 characters", () => {
  const assets = Array.from({ length: 30 }, (_, i) => ({
    id: String(1000 + i),
    symbol: `LONGSYMBOLUSD${i}`,
    gecko_id: `coin-${i}`,
    circulating: 100000000000 + i,
    inactive: false,
  }));
  const series: PriceSeries = new Map(assets.map((asset) => [asset.gecko_id, [{ SK: 1791417600, price: 0.012345 }]]));
  const report = priceFeedReport(series, {}, assets);
  assert.ok(report);
  assert.ok(report.length < 1800, `length ${report.length}`);
  assert.match(report, /^and 12 more$/m);
});

test("an asset with no series entry is not reported as lost", () => {
  assert.equal(priceFeedReport(new Map(), { tether: 0.9992 }, feedAssets), null);
});

test("the count of assets with no price leaves out listings without a gecko id", () => {
  const assets = [...feedAssets, { id: "340", symbol: "rwaUSDi", gecko_id: null, circulating: 487400000, inactive: false }];
  const report = priceFeedReport(feedSeries, { tether: 0.9992 }, assets);
  assert.ok(report);
  assert.match(report.split("\n")[0], /\b1 with no price in this run\b/);
});

test("an inactive asset with no current price is not reported or counted", () => {
  const assets = [
    { id: "36", symbol: "USDN", gecko_id: "neutrino", circulating: 408891137, inactive: true },
    { id: "77", symbol: "XUSD", gecko_id: "xusd", circulating: 5000000, inactive: false },
  ];
  const series: PriceSeries = new Map([...feedSeries, ["xusd", [{ SK: 1791417600, price: 1 }]]]);
  assert.equal(priceFeedReport(series, { xusd: 1 }, assets), null);
  const report = priceFeedReport(series, {}, assets);
  assert.ok(report);
  assert.match(report.split("\n")[0], /\b1 lost, 1 with no price in this run\b/);
  assert.doesNotMatch(report, /USDN/);
  assert.doesNotMatch(priceFeedReport(series, null, assets) ?? "", /USDN/);
});
