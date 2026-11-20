// node -r ts-node/register/transpile-only --test src/cli/rebuildDailyPeggedPrices.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { planRebuild, describeChange } = require("./rebuildDailyPeggedPrices.ts");

const DAY = 86400;
const d0 = 1767225600; // 2026-01-01
const daily = (SK, tether) => ({ PK: "dailyPeggedPrices", SK, prices: { tether, "usd-coin": 1 } });
const hourly = (SK, tether) => ({ PK: "hourlyPeggedPrices", SK, prices: { tether, "usd-coin": 1 } });

test("each day is rewritten with its first hourly reading, or left alone", () => {
  const days = [d0, d0 + DAY, d0 + 2 * DAY, d0 + 3 * DAY];
  const dailyRecords = new Map([
    [d0, daily(d0, 1.0023)],
    [d0 + DAY, daily(d0 + DAY, 1.01)],
    [d0 + 2 * DAY, daily(d0 + 2 * DAY, 1.0206)],
  ]);
  const firstHourly = new Map([
    [d0, hourly(d0 + 600, 1)],
    [d0 + DAY, hourly(d0 + DAY + 600, 1.01)],
    [d0 + 3 * DAY, hourly(d0 + 3 * DAY + 600, 1.03)],
  ]);
  const plan = planRebuild(days, dailyRecords, firstHourly);
  assert.deepEqual(plan.rewrite.map((r) => [r.daily.SK, r.first.prices.tether]), [[d0, 1]]);
  assert.deepEqual(plan.unchanged, [d0 + DAY]);
  assert.deepEqual(plan.noHourly, [d0 + 2 * DAY]);
  assert.deepEqual(plan.noDaily, [d0 + 3 * DAY]);
});

test("a second run over rewritten days plans nothing", () => {
  const dailyRecords = new Map([[d0, daily(d0, 1)]]);
  const firstHourly = new Map([[d0, hourly(d0 + 600, 1)]]);
  assert.equal(planRebuild([d0], dailyRecords, firstHourly).rewrite.length, 0);
});

test("the change summary names the largest move", () => {
  const text = describeChange({ daily: daily(d0, 1.0023), first: hourly(d0 + 600, 1) });
  assert.match(text, /^1 prices differ, largest tether 1.0023 -> 1 \(0.23%\)$/);
});
