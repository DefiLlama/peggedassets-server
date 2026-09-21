import assert from "node:assert/strict";
import { test } from "node:test";
import { HOUR } from "../../utils/date";
import { findChainDrops, formatChainDrops } from "./chainDrops";

const usdc = { name: "USD Coin", id: "2" };
const unixTimestamp = 1789003600;

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

  assert.deepEqual(findChainDrops(prev, next, "peggedUSD", usdc, unixTimestamp), [
    {
      chain: "starknet",
      assetName: "USD Coin",
      assetId: "2",
      previous: 141560445.7,
      current: 0,
      missing: true,
    },
  ]);
});

test("only drops strictly greater than 50% are reported, without an absolute floor", () => {
  const prev = record({
    partial: chain(100),
    half: chain(100),
    smallerDrop: chain(100),
    zero: chain(100),
    tiny: chain(10),
    unchanged: chain(100),
    increased: chain(100),
    empty: chain(0),
  });
  const next = record({
    partial: chain(49),
    half: chain(50),
    smallerDrop: chain(51),
    zero: chain(0),
    tiny: chain(4),
    unchanged: chain(100),
    increased: chain(200),
    empty: chain(0),
    newChain: chain(100),
  });

  assert.deepEqual(
    findChainDrops(prev, next, "peggedUSD", usdc, unixTimestamp).map((d) => [d.chain, d.current]),
    [["partial", 49], ["zero", 0], ["tiny", 4]],
  );
});

test("the previous hourly record must be strictly less than 12 hours old", () => {
  const next = record({ ethereum: chain(0) });
  const baseline = (age: number) => record(
    { ethereum: chain(100) },
    { SK: unixTimestamp - age },
  );

  assert.equal(findChainDrops(baseline(12 * HOUR - 1), next, "peggedUSD", usdc, unixTimestamp).length, 1);
  assert.deepEqual(findChainDrops(baseline(12 * HOUR), next, "peggedUSD", usdc, unixTimestamp), []);
  assert.deepEqual(findChainDrops(baseline(13 * HOUR), next, "peggedUSD", usdc, unixTimestamp), []);
  for (const SK of [undefined, null, NaN, Infinity]) {
    assert.deepEqual(
      findChainDrops(record({ ethereum: chain(100) }, { SK }), next, "peggedUSD", usdc, unixTimestamp),
      [],
    );
  }
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

  assert.deepEqual(findChainDrops(prev, next, "peggedUSD", usdc, unixTimestamp), []);
});

test("missing previous record yields no drops", () => {
  const next = record({ ethereum: chain(46e9) });

  assert.deepEqual(
    findChainDrops(undefined, next, "peggedUSD", usdc, unixTimestamp),
    [],
  );
  assert.deepEqual(
    findChainDrops(
      { SK: undefined, totalCirculating: { circulating: { peggedUSD: 0 } } },
      next,
      "peggedUSD",
      usdc,
      unixTimestamp,
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
    findChainDrops(prev, next, "peggedUSD", usdc, unixTimestamp).map((d) => [d.chain, d.missing]),
    [["dropped", false]],
  );
});

test("non-finite and non-number balances are reported as failed drops", () => {
  const prev = record({ nan: chain(100), infinity: chain(100), text: chain(100) });
  const next = record({
    nan: chain(Number.NaN),
    infinity: chain(Number.POSITIVE_INFINITY),
    text: chain("invalid" as any),
  });

  assert.deepEqual(
    findChainDrops(prev, next, "peggedUSD", usdc, unixTimestamp).map((drop) => [drop.chain, drop.current]),
    [["nan", 0], ["infinity", 0], ["text", 0]],
  );
});

test("only the requested peg type is compared", () => {
  const prev = record({ ethereum: { circulating: { peggedEUR: 5e6 } } });
  const next = record({ ethereum: { circulating: { peggedEUR: 0 } } });

  assert.deepEqual(findChainDrops(prev, next, "peggedUSD", usdc, unixTimestamp), []);
  assert.equal(findChainDrops(prev, next, "peggedEUR", usdc, unixTimestamp).length, 1);
});

test("formatChainDrops groups, sorts, and marks missing chains", () => {
  assert.deepEqual(
    formatChainDrops([
      { chain: "tron", assetName: "Tether", assetId: "1", previous: 2e6, current: 0, missing: false },
      { chain: "starknet", assetName: "USD Coin", assetId: "2", previous: 141560445.7, current: 60e6, missing: false },
      { chain: "starknet", assetName: "Tether", assetId: "1", previous: 3600000, current: 0, missing: true },
    ]),
    [
      "**Chain-level circulating alerts:**",
      "• [2] starknet",
      "    - USD Coin (id=2): 141.56 M → 60.00 M",
      "    - Tether (id=1): 3.60 M → missing",
      "• [1] tron",
      "    - Tether (id=1): 2.00 M → 0.00",
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
        current: 0,
        missing: false,
      });
    }
  }

  const lines = formatChainDrops(drops);

  assert.equal(lines.filter((l) => l.startsWith("• ")).length, 10);
  assert.equal(lines.filter((l) => l === "    ... and 2 more").length, 10);
  assert.equal(lines[lines.length - 1], "... and 2 more chains");
});

test("formatChainDrops keeps the largest assets when a chain is capped", () => {
  const drops = [1, 10, 3, 8, 5, 6].map((previous) => ({
    chain: "ethereum",
    assetName: `asset${previous}`,
    assetId: String(previous),
    previous,
    current: 0,
    missing: false,
  }));

  const output = formatChainDrops(drops).join("\n");
  assert.ok(!output.includes("asset1 (id=1)"));
  for (const previous of [10, 8, 6, 5, 3]) assert.ok(output.includes(`asset${previous} (id=${previous})`));
});
