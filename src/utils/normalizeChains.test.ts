import { test } from "node:test";
import assert from "node:assert/strict";
import { addToChains } from "./normalizeChain";

test("addToChains", () => {
  const chains = [] as string[];
  addToChains(chains, "Ethereum");
  assert.deepEqual(chains, ["Ethereum"]);
  addToChains(chains, "Ethereum-borrowed");
  assert.deepEqual(chains, ["Ethereum"]);
  addToChains(chains, "BSC-staking");
  assert.deepEqual(chains, ["Ethereum", "BSC"]);
  addToChains(chains, "Heco");
  assert.deepEqual(chains, ["Ethereum", "BSC", "Heco"]);
});
