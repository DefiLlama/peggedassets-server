import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPriceSeries, hasMarketPrices, PriceSeries, resolvePricing, withLatestHourly } from "./pricing";

const usdn = { gecko_id: "neutrino", pegType: "peggedUSD" };
const usdnSeries: PriceSeries = new Map([
  [
    "neutrino",
    [
      { SK: 1790985600, price: 0.015770918154435674 },
      { SK: 1791417600, price: 0.015759177953386896 },
    ],
  ],
]);

test("a current price above 0 wins with the run as its date", () => {
  const at = { current: { neutrino: 0.0157 }, series: usdnSeries, pegPrice: 1, daySK: 1791417600 };
  assert.deepEqual(resolvePricing(usdn, at), { price: 0.0157, asOf: 1791417600, source: "market" });
  assert.deepEqual(resolvePricing(usdn, { ...at, nowSK: 1791450000 }), {
    price: 0.0157,
    asOf: 1791450000,
    source: "market",
  });
});

test("a current price of 0 falls through to the last known price", () => {
  const pricing = resolvePricing(usdn, { current: { neutrino: 0 }, series: usdnSeries, pegPrice: 1, daySK: 1791158400 });
  assert.deepEqual(pricing, { price: 0.015770918154435674, asOf: 1790985600, source: "last-known" });
});

test("no record at or before the day takes the peg price", () => {
  const empty: PriceSeries = new Map();
  assert.deepEqual(resolvePricing({ gecko_id: "husd", pegType: "peggedUSD" }, { series: empty, pegPrice: 1, daySK: 1791158400 }), {
    price: 1,
    asOf: null,
    source: "peg",
  });
  assert.deepEqual(
    resolvePricing({ gecko_id: "eurx", pegType: "peggedEUR" }, { series: empty, daySK: 1791158400, pegPrice: 1 / 0.92 }),
    { price: 1 / 0.92, asOf: null, source: "peg" }
  );
  assert.deepEqual(resolvePricing({ gecko_id: "varx", pegType: "peggedVAR" }, { series: empty, pegPrice: 0, daySK: 1791158400 }), {
    price: 0,
    asOf: null,
    source: "peg",
  });
});

test("a null gecko id takes the peg price", () => {
  const pricing = resolvePricing({ gecko_id: null, pegType: "peggedUSD" }, { series: usdnSeries, pegPrice: 1, daySK: 1791158400 });
  assert.deepEqual(pricing, { price: 1, asOf: null, source: "peg" });
});

test("a record after the day is never used", () => {
  const pricing = resolvePricing(usdn, { series: usdnSeries, pegPrice: 1, daySK: 1790985600 - 86400 });
  assert.deepEqual(pricing, { price: 1, asOf: null, source: "peg" });
});

const tor = { gecko_id: "tor", pegType: "peggedUSD" };

test("a record above 1.5 times the peg price is skipped for the plausible record before it", () => {
  const series: PriceSeries = new Map([
    [
      "tor",
      [
        { SK: 1712534400, price: 0.9812 },
        { SK: 1712707200, price: 17.91 },
      ],
    ],
  ]);
  assert.deepEqual(resolvePricing(tor, { series, pegPrice: 1, daySK: 1712793600 }), {
    price: 0.9812,
    asOf: 1712534400,
    source: "last-known",
  });
});

test("an implausible record with no plausible record before it takes the peg price", () => {
  const series: PriceSeries = new Map([["tor", [{ SK: 1712707200, price: 17.91 }]]]);
  assert.deepEqual(resolvePricing(tor, { series, pegPrice: 1, daySK: 1712793600 }), { price: 1, asOf: null, source: "peg" });
});

test("a record older than maxAgeDays takes the peg price", () => {
  const series: PriceSeries = new Map([["neutrino", [{ SK: 1791158400 - 5 * 86400, price: 0.0157 }]]]);
  assert.deepEqual(resolvePricing(usdn, { series, pegPrice: 1, daySK: 1791158400 }, { maxAgeDays: 3 }), {
    price: 1,
    asOf: null,
    source: "peg",
  });
});

test("records in any order become one sorted series per gecko id without missing or zero prices", () => {
  const series = buildPriceSeries([
    { SK: 1791417600, prices: { neutrino: 0.015759177953386896, tether: 0.9991, husd: 0 } },
    { SK: 1790985600, prices: { neutrino: 0.015770918154435674, tether: null, husd: undefined } },
  ]);
  assert.deepEqual(
    series,
    new Map([
      [
        "neutrino",
        [
          { SK: 1790985600, price: 0.015770918154435674 },
          { SK: 1791417600, price: 0.015759177953386896 },
        ],
      ],
      ["tether", [{ SK: 1791417600, price: 0.9991 }]],
    ])
  );
});

test("a record with a numeric string price lands in the series as a number", () => {
  const series = buildPriceSeries([{ SK: 1791158400, prices: { frankencoin: "1.10" as unknown as number } }]);
  assert.deepEqual(series, new Map([["frankencoin", [{ SK: 1791158400, price: 1.1 }]]]));
});

test("a current price stored as a numeric string resolves as market", () => {
  const at = { current: { neutrino: "0.5" as unknown as number }, series: usdnSeries, pegPrice: 1, daySK: 1791417600 };
  assert.deepEqual(resolvePricing(usdn, at), { price: 0.5, asOf: 1791417600, source: "market" });
});

test("a record at exactly 1.5 times the peg price is kept as last-known", () => {
  const series: PriceSeries = new Map([["tor", [{ SK: 1712534400, price: 1.5 }]]]);
  assert.deepEqual(resolvePricing(tor, { series, pegPrice: 1, daySK: 1712793600 }), {
    price: 1.5,
    asOf: 1712534400,
    source: "last-known",
  });
});

test("a record inside maxAgeDays is used as last-known", () => {
  const series: PriceSeries = new Map([["neutrino", [{ SK: 1791158400 - 2 * 86400, price: 0.0157 }]]]);
  assert.deepEqual(resolvePricing(usdn, { series, pegPrice: 1, daySK: 1791158400 }, { maxAgeDays: 3 }), {
    price: 0.0157,
    asOf: 1791158400 - 2 * 86400,
    source: "last-known",
  });
});

test("USDN between two records is valued at the earlier record, not at the peg", () => {
  const series = buildPriceSeries([
    { SK: 1791417600, prices: { neutrino: 0.015759177953386896 } },
    { SK: 1790985600, prices: { neutrino: 0.015770918154435674 } },
  ]);
  const pricing = resolvePricing(usdn, { series, pegPrice: 1, daySK: 1791158400 });
  assert.deepEqual(pricing, { price: 0.015770918154435674, asOf: 1790985600, source: "last-known" });
  assert.equal(Math.round(408891137.096548 * pricing.price * 100) / 100, 6448588.66);
});

const d4 = 1791072000;
const d5 = 1791158400;
const dailyRecords = [
  { SK: d4, prices: { neutrino: 0.015770918154435674 } },
  { SK: d5, prices: { neutrino: 0.0157 } },
];

test("an hourly record newer than the last daily record and within 25 hours takes its place under the daily SK", () => {
  const records = withLatestHourly(dailyRecords, { SK: d5 + 7200, prices: { neutrino: 0.02 } });
  assert.deepEqual(records, [dailyRecords[0], { SK: d5, prices: { neutrino: 0.02 } }]);
  assert.equal(dailyRecords[1].prices.neutrino, 0.0157);
});

test("an hourly record that is older, more than 25 hours newer or missing leaves the records unchanged", () => {
  assert.deepEqual(withLatestHourly(dailyRecords, { SK: d5 - 3600, prices: { neutrino: 0.02 } }), dailyRecords);
  assert.deepEqual(withLatestHourly(dailyRecords, { SK: d5 + 26 * 3600, prices: { neutrino: 0.02 } }), dailyRecords);
  assert.deepEqual(withLatestHourly(dailyRecords, undefined), dailyRecords);
  assert.deepEqual(withLatestHourly([], { SK: d5, prices: { neutrino: 0.02 } }), []);
});

const adapterForcedIds = ["m-2", "terrausd"];

test("an answer that prices only the ignored ids has no market prices", () => {
  assert.equal(hasMarketPrices({ "m-2": 1, terrausd: 0 }, adapterForcedIds), false);
});

test("one priced listing beyond the ignored ids is a market answer", () => {
  assert.equal(hasMarketPrices({ "m-2": 1, terrausd: 0, tether: 0.9991 }, adapterForcedIds), true);
});

const eurx = { gecko_id: "eurx", pegType: "peggedEUR" };

test("a euro peg with a peg price of 0 skips a record above 1.5 for that peg price", () => {
  const series: PriceSeries = new Map([["eurx", [{ SK: 1712707200, price: 17.91 }]]]);
  assert.deepEqual(resolvePricing(eurx, { series, pegPrice: 0, daySK: 1712793600 }), { price: 0, asOf: null, source: "peg" });
});

test("a euro peg with a peg price of 0 skips a record above 1.5 for the plausible record before it", () => {
  const series: PriceSeries = new Map([
    [
      "eurx",
      [
        { SK: 1712534400, price: 1.08 },
        { SK: 1712707200, price: 17.91 },
      ],
    ],
  ]);
  assert.deepEqual(resolvePricing(eurx, { series, pegPrice: 0, daySK: 1712793600 }), {
    price: 1.08,
    asOf: 1712534400,
    source: "last-known",
  });
});

test("a variable peg carries a record of any size", () => {
  const series: PriceSeries = new Map([["varx", [{ SK: 1712707200, price: 17.91 }]]]);
  assert.deepEqual(resolvePricing({ gecko_id: "varx", pegType: "peggedVAR" }, { series, pegPrice: 0, daySK: 1712793600 }), {
    price: 17.91,
    asOf: 1712707200,
    source: "last-known",
  });
});
