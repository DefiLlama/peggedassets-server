import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFxRateMap, pegPriceAt } from "./fxRates";

const d4 = 1791072000;
const d5 = 1791158400;
const d6 = 1791244800;
const fx = buildFxRateMap([{ date: d4, rates: { EUR: 0.92 } }]);

test("a day without rates takes the rate of the day before", () => {
  assert.equal(pegPriceAt(fx, "peggedEUR", d5), 1 / 0.92);
});

test("a day two days past the last rates has a peg price of 0", () => {
  assert.equal(pegPriceAt(fx, "peggedEUR", d6), 0);
});

test("with no rate map a USD peg is 1 and every other peg is 0", () => {
  assert.equal(pegPriceAt(null, "peggedUSD", d4), 1);
  assert.equal(pegPriceAt(null, "peggedEUR", d4), 0);
});

test("a variable peg has a peg price of 0 even with a rate map", () => {
  assert.equal(pegPriceAt(fx, "peggedVAR", d4), 0);
});

test("a currency missing on the day takes the day before, then the day after", () => {
  const map = buildFxRateMap([
    { date: d4, rates: { EUR: 0.91, GBP: 0.79 } },
    { date: d5, rates: { EUR: 0.93 } },
    { date: d6, rates: { GBP: 0.8, CHF: 0.88 } },
  ]);
  assert.equal(pegPriceAt(map, "peggedEUR", d5), 1 / 0.93);
  assert.equal(pegPriceAt(map, "peggedGBP", d5), 1 / 0.79);
  assert.equal(pegPriceAt(map, "peggedCHF", d5), 1 / 0.88);
});

test("a 0 rate on the day gives way to the positive rate of the day before", () => {
  const map = buildFxRateMap([
    { date: d4, rates: { EUR: 0.92 } },
    { date: d5, rates: { EUR: 0 } },
  ]);
  assert.equal(pegPriceAt(map, "peggedEUR", d5), 1 / 0.92);
});

test("the latest rate takes a ticker from the day before when the last row lacks it", () => {
  const map = buildFxRateMap([{ date: d4, rates: { EUR: 0.92, XAU: 0.00024 } }, { date: d5, rates: { EUR: 0.93 } }]);
  assert.equal(pegPriceAt(map, "peggedEUR", 0), 1 / 0.93);
  assert.equal(pegPriceAt(map, "peggedXAU", 0), 1 / 0.00024);
});
