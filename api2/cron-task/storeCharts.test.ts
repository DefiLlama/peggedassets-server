import assert from "node:assert/strict";
import test from "node:test";
import peggedAssets from "../../src/peggedData/peggedData";
import { cache } from "../cache";
import { craftChartsResponse } from "./storeCharts";

const firstDay = 1_728_000_000;
const secondDay = firstDay + 86_400;

function balance(SK: number, circulating: number) {
  return {
    SK,
    totalCirculating: {
      circulating: { peggedUSD: circulating },
      unreleased: { peggedUSD: 0 },
    },
  };
}

test("repeated chart construction preserves active tails without extending inactive assets", () => {
  assert.ok(peggedAssets.find(({ id }) => id === "3")?.deadFrom);
  assert.equal(peggedAssets.find(({ id }) => id === "327")?.delisted, true);

  cache.historicalPrices = [{ PK: "prices", SK: secondDay, prices: {} }];
  cache.priceTimestamps = [secondDay];
  cache.lastPrices = undefined;
  cache.fxRateMap = null;
  cache.peggedAssetsData = {
    "1": { balances: [balance(secondDay, 100)] },
    "2": { balances: [balance(firstDay, 200)] },
    "3": { balances: [balance(firstDay, 300)] },
    "327": { balances: [balance(firstDay, 400)] },
  };

  const options = {
    assetChainMap: {
      "1": new Set(["ethereum"]),
      "2": new Set(["ethereum"]),
      "3": new Set(["ethereum"]),
      "327": new Set(["ethereum"]),
    },
  };

  const firstResponse = craftChartsResponse(options);
  const secondResponse = craftChartsResponse(options);

  assert.deepEqual(secondResponse, firstResponse);
  assert.equal(
    firstResponse.find(({ date }) => date === String(firstDay))?.totalCirculating.peggedUSD,
    900,
  );
  assert.equal(
    firstResponse.find(({ date }) => date === String(secondDay))?.totalCirculating.peggedUSD,
    300,
  );
});
