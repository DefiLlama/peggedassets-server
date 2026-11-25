// node -r ts-node/register/transpile-only --test api2/cron-task/dailyPrices.test.js
const test = require("node:test");
const assert = require("node:assert/strict");

const dynamodbModule = require("../../src/utils/shared/dynamodb.ts");
const pricesModule = require("../../src/adapters/peggedAssets/prices/index.ts");
const s3 = require("../../src/utils/s3.ts");
const { cache } = require("../cache.ts");
const storePeggedPrices = require("./storePeggedPrices.ts").default;
const { craftStablecoinPricesResponse } = require("./getStablecoinPrices.ts");
const { craftChartsResponse } = require("./storeCharts.ts");

const day = 1767225600; // 2026-01-01
const conditionalFailure = Object.assign(new Error("The conditional request failed"), { name: "ConditionalCheckFailedException" });

function stubWrites(onDailyPut) {
  const puts = [];
  pricesModule.getPrices = async () => ({ tether: 1.001 });
  s3.store = async () => {};
  dynamodbModule.getHistoricalValues = async () => [];
  dynamodbModule.default.put = async (item, params) => {
    puts.push({ item, params });
    if (item.PK === "dailyPeggedPrices") return onDailyPut();
  };
  for (const key of Object.keys(cache)) delete cache[key];
  return puts;
}

test("the daily price record is written only if the day has none yet", async () => {
  const puts = stubWrites(async () => {});
  await storePeggedPrices();
  const daily = puts.find((p) => p.item.PK === "dailyPeggedPrices");
  assert.equal(daily.params?.ConditionExpression, "attribute_not_exists(PK)");
  const hourly = puts.find((p) => p.item.PK === "hourlyPeggedPrices");
  assert.equal(hourly.params, undefined);
});

test("a later run of the day keeps the first reading and still succeeds", async () => {
  stubWrites(async () => {
    throw conditionalFailure;
  });
  await storePeggedPrices();
});

test("any other daily write error still fails the run", async () => {
  stubWrites(async () => {
    throw Object.assign(new Error("throttled"), { name: "ProvisionedThroughputExceededException" });
  });
  await assert.rejects(storePeggedPrices(), /throttled/);
});

function seedPriceCache() {
  for (const key of Object.keys(cache)) delete cache[key];
  cache.historicalPrices = [
    { PK: "dailyPeggedPrices", SK: day, prices: { tether: 0.99 } },
    { PK: "dailyPeggedPrices", SK: day + 86400, prices: { tether: 1.01 } },
  ];
  cache.lastPrices = { PK: "hourlyPeggedPrices", SK: day + 86400 + 6 * 3600, prices: { tether: 1.02 } };
  cache.priceTimestamps = cache.historicalPrices.map((item) => item.SK);
  return JSON.parse(JSON.stringify({ history: cache.historicalPrices, last: cache.lastPrices }));
}

test("the price response shows today's live reading and leaves cached history alone", () => {
  const before = seedPriceCache();
  assert.deepEqual(craftStablecoinPricesResponse(), [
    { date: day, prices: { tether: 0.99 } },
    { date: day + 86400, prices: { tether: 1.02 } },
  ]);
  assert.deepEqual(cache.historicalPrices, before.history);
  assert.deepEqual(cache.lastPrices, before.last);
});

test("the chart prices each past day with that day's record and leaves cached history alone", () => {
  const before = seedPriceCache();
  const balance = (SK) => ({ SK, totalCirculating: { circulating: { peggedUSD: 100 }, unreleased: { peggedUSD: 0 } } });
  cache.peggedAssetsData = { 1: { balances: [balance(day), balance(day + 86400)] } };
  const chart = craftChartsResponse({ chain: "all", peggedID: "1", assetChainMap: { 1: new Set(["ethereum"]) } });
  const usd = Object.fromEntries(chart.map((point) => [Number(point.date), point.totalCirculatingUSD.peggedUSD]));
  assert.equal(usd[day], 99);
  assert.equal(usd[day + 86400], 102);
  assert.deepEqual(cache.historicalPrices, before.history);
  assert.deepEqual(cache.lastPrices, before.last);
});
