import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getTimestampAtStartOfDay,
  getDay,
  getClosestDayStartTimestamp,
} from "./date";

test("getTimestampAtStartOfDay", () => {
  assert.equal(getTimestampAtStartOfDay(1631772242), 1631750400);
});

test("getDay", () => {
  const start = 1631750400;
  for (let ts = start; ts < start + 24 * 3600; ts += 3600) {
    assert.equal(getDay(ts), "16-8-2021");
  }
  assert.equal(getDay(start + 25 * 3600), "17-8-2021");
});

test("getClosestDayStartTimestamp", () => {
  assert.equal(getClosestDayStartTimestamp(1631750400 - 1), 1631750400);
  assert.equal(getClosestDayStartTimestamp(1631750400 + 1), 1631750400);
  assert.equal(getClosestDayStartTimestamp(1631793104), 1631750400);
});
