import { test } from "node:test";
import assert from "node:assert/strict";
import parseRequestBody from "./parseRequestBody";

test("invalid json body is rejected", () => {
  assert.throws(
    () => {
      parseRequestBody("fake");
    },
    { message: "Message body is not a valid JSON object" }
  );
});

test("parsed JSON object is returned", () => {
  assert.deepEqual(parseRequestBody('{"a":"b"}'), {
    a: "b",
  });
});
