import assert from "node:assert/strict";
import { test } from "node:test";
import { CHAIN_DROP_FLOOR, findChainDrops, formatChainDrops } from "./chainDrops";

const usdc = { name: "USD Coin", id: "2" };

const chain = (circulating: number | null, extra: any = {}) => ({
  minted: { peggedUSD: 0 },
  unreleased: { peggedUSD: 0 },
  circulating: { peggedUSD: circulating },
  bridgedTo: { peggedUSD: 0 },
  ...extra,
});

const record = (chains: Record<string, any>, extra: any = {}) => ({
  PK: "hourlyPeggedBalances#2",
  SK: 1789000000,
  ...chains,
  totalCirculating: { circulating: { peggedUSD: 1 }, unreleased: { peggedUSD: 0 } },
  ...extra,
});

test("missing chain is reported as missing", () => {
  const prev = record({ starknet: chain(141560445.7) });
  const next = record({ ethereum: chain(46e9) });

  assert.deepEqual(findChainDrops(prev, next, "peggedUSD", usdc), [
    {
      chain: "starknet",
      assetName: "USD Coin",
      assetId: "2",
      previous: 141560445.7,
      missing: true,
    },
  ]);
});

test("drop is reported only when previous supply is at or above the floor", () => {
  const prev = record({
    below: chain(CHAIN_DROP_FLOOR - 1),
    edge: chain(CHAIN_DROP_FLOOR),
  });
  const next = record({
    below: chain(0),
    edge: chain(0),
  });

  assert.deepEqual(
    findChainDrops(prev, next, "peggedUSD", usdc).map((d) => d.chain),
    ["edge"],
  );
});

test("non-chain metadata and totalCirculating are ignored", () => {
  const meta = {
    extrapolated: true,
    extrapolatedChains: [{ chain: "starknet", timestamp: 1 }],
    extrapolatedChainsCount: 1,
  };

  const prev = record({ ethereum: chain(46e9) }, meta);
  const next = {
    ...record({ ethereum: chain(46e9) }, meta),
    totalCirculating: { circulating: { peggedUSD: 0 } },
  };

  assert.deepEqual(findChainDrops(prev, next, "peggedUSD", usdc), []);
});

test("missing previous record yields no drops", () => {
  const next = record({ ethereum: chain(46e9) });

  assert.deepEqual(
    findChainDrops(undefined, next, "peggedUSD", usdc),
    [],
  );
  assert.deepEqual(
    findChainDrops(
      { SK: undefined, totalCirculating: { circulating: { peggedUSD: 0 } } },
      next,
      "peggedUSD",
      usdc,
    ),
    [],
  );
});

test("null or absent circulating supply is treated as zero", () => {
  const prev = record({
    dropped: chain(5e6),
    nullSupply: chain(null),
    absentSupply: { minted: { peggedUSD: 5e6 } },
  });
  const next = record({
    dropped: chain(null),
    nullSupply: chain(0),
    absentSupply: chain(0),
  });

  assert.deepEqual(
    findChainDrops(prev, next, "peggedUSD", usdc).map((d) => [d.chain, d.missing]),
    [["dropped", false]],
  );
});

test("only the requested peg type is compared", () => {
  const prev = record({ ethereum: { circulating: { peggedEUR: 5e6 } } });
  const next = record({ ethereum: { circulating: { peggedEUR: 0 } } });

  assert.deepEqual(findChainDrops(prev, next, "peggedUSD", usdc), []);
  assert.equal(findChainDrops(prev, next, "peggedEUR", usdc).length, 1);
});

test("formatChainDrops groups, sorts, and marks missing chains", () => {
  assert.deepEqual(
    formatChainDrops([
      { chain: "tron", assetName: "Tether", assetId: "1", previous: 2e6, missing: false },
      { chain: "starknet", assetName: "USD Coin", assetId: "2", previous: 141560445.7, missing: false },
      { chain: "starknet", assetName: "Tether", assetId: "1", previous: 3600000, missing: true },
    ]),
    [
      "**Chains whose supply dropped to 0 since last hour:**",
      "• [2] starknet",
      "    - USD Coin (id=2): 141.56 M → 0",
      "    - Tether (id=1): 3.60 M → missing",
      "• [1] tron",
      "    - Tether (id=1): 2.00 M → 0",
    ],
  );
});

test("formatChainDrops caps chains and assets per chain", () => {
  const drops = [];

  for (let c = 0; c < 12; c++) {
    for (let a = 0; a < 7; a++) {
      drops.push({
        chain: `chain${c}`,
        assetName: `asset${a}`,
        assetId: String(a),
        previous: 1e6 * (12 - c),
        missing: false,
      });
    }
  }

  const lines = formatChainDrops(drops);

  assert.equal(lines.filter((l) => l.startsWith("• ")).length, 10);
  assert.equal(lines.filter((l) => l === "    ... and 2 more").length, 10);
  assert.equal(lines[lines.length - 1], "... and 2 more chains");
});