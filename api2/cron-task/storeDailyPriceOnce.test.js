const { test } = require("node:test");
const assert = require("node:assert/strict");

const { storeDailyPriceOnce } = require("./storeDailyPriceOnce.ts");

function createStore() {
  const items = new Map();

  async function put(item, params) {
    const key = `${item.PK}#${item.SK}`;
    if (
      params?.ConditionExpression === "attribute_not_exists(PK)" &&
      items.has(key)
    ) {
      const error = new Error("The conditional request failed");
      error.name = "ConditionalCheckFailedException";
      throw error;
    }
    items.set(key, item);
  }

  return { items, put };
}

test("stores only the first daily price for a day", async () => {
  const { items, put } = createStore();
  const first = { PK: "dailyPeggedPrices", SK: 100, prices: { tether: 1 } };
  const second = { PK: "dailyPeggedPrices", SK: 100, prices: { tether: 2 } };

  assert.equal(await storeDailyPriceOnce(put, first), true);
  assert.equal(await storeDailyPriceOnce(put, second), false);
  assert.deepEqual(items.get("dailyPeggedPrices#100"), first);
});

test("stores a price for a new day", async () => {
  const { items, put } = createStore();
  const first = { PK: "dailyPeggedPrices", SK: 100, prices: { tether: 1 } };
  const nextDay = { PK: "dailyPeggedPrices", SK: 200, prices: { tether: 2 } };

  assert.equal(await storeDailyPriceOnce(put, first), true);
  assert.equal(await storeDailyPriceOnce(put, nextDay), true);
  assert.deepEqual(items.get("dailyPeggedPrices#200"), nextDay);
});

test("rethrows non-conditional write errors", async () => {
  const put = async () => {
    const error = new Error("write failed");
    error.name = "ProvisionedThroughputExceededException";
    throw error;
  };

  await assert.rejects(() => storeDailyPriceOnce(put, {}), /write failed/);
});
