import { test } from "node:test";
import assert from "node:assert/strict";
import peggedAssets from "../peggedData/peggedData";
import { balancesUntilDeadFrom, deadFromSK, isInactive } from "./listingStatus";

test("an asset with deadFrom or delisted is inactive", () => {
  assert.equal(isInactive({ deadFrom: "2023-02-01" }), true);
  assert.equal(isInactive({ delisted: true }), true);
  assert.equal(isInactive({}), false);
});

test("deadFrom becomes the UTC day start, and a missing deadFrom is null", () => {
  assert.equal(deadFromSK({ deadFrom: "2022-06-22" }), 1655856000);
  assert.equal(deadFromSK({}), null);
});

test("a deadFrom that is not strictly YYYY-MM-DD throws an error naming it", () => {
  assert.throws(() => deadFromSK({ deadFrom: "2022-6-22" }), /2022-6-22/);
  assert.throws(() => deadFromSK({ deadFrom: "22-06-2022" }), /22-06-2022/);
  assert.throws(() => deadFromSK({ deadFrom: "2023-02-30" }), /2023-02-30/);
});

const d3 = 1790985600;
const d4 = 1791072000;
const d5 = 1791158400;
const d6 = 1791244800;
const balances = [{ SK: d3 }, { SK: d4 }, { SK: d5 }, { SK: d6 }];

test("balances after deadFrom are cut, the deadFrom day is kept", () => {
  assert.deepEqual(balancesUntilDeadFrom(balances, { deadFrom: "2026-10-05" }), [{ SK: d3 }, { SK: d4 }, { SK: d5 }]);
});

test("a record before noon on the deadFrom day is kept, one at noon rounds to the day after and is dropped", () => {
  const kept = { SK: d5 + 11 * 3600 };
  const dropped = { SK: d5 + 12 * 3600 };
  assert.deepEqual(balancesUntilDeadFrom([kept, dropped], { deadFrom: "2026-10-05" }), [kept]);
});

test("every deadFrom in the data file is a valid date at or before today", () => {
  const now = Date.now() / 1000;
  for (const asset of peggedAssets) {
    assert.doesNotThrow(() => deadFromSK(asset), asset.id);
    assert.ok((deadFromSK(asset) ?? 0) <= now, `${asset.id}: deadFrom ${asset.deadFrom} lies in the future`);
  }
});

test("an asset without deadFrom keeps every balance", () => {
  assert.deepEqual(balancesUntilDeadFrom(balances, {}), balances);
});
