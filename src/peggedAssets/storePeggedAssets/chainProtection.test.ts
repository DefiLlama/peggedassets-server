import assert from "node:assert/strict";
import { test } from "node:test";
import { PeggedAssetIssuance } from "../../types";
import { HOUR } from "../../utils/date";
import { formatChainDrops } from "./chainDrops";
import { ExtrapolationMetadata, protectChainDrops } from "./chainProtection";

const asset = { id: "2", name: "USD Coin" };
const now = 1789003600;
const metadata = (): ExtrapolationMetadata => ({ extrapolated: false, extrapolatedChains: [] });
const balances = (supplies: Record<string, number | null>): PeggedAssetIssuance => ({
  ...Object.fromEntries(Object.entries(supplies).map(([chain, supply]) => [chain, {
    minted: { peggedUSD: supply },
    circulating: { peggedUSD: supply },
    unreleased: { peggedUSD: 0 },
    bridgedTo: { peggedUSD: 0 },
  }])),
  totalCirculating: {
    circulating: { peggedUSD: Object.values(supplies).reduce<number>((sum, supply) => sum + (supply ?? 0), 0) },
    unreleased: { peggedUSD: 0 },
  },
});
const record = (data: PeggedAssetIssuance, SK = now - HOUR, extra = metadata()) =>
  JSON.parse(JSON.stringify({ PK: "hourlyPeggedBalances#2", SK, ...data, ...extra }));
const protect = (prev: any, next: PeggedAssetIssuance, time = now, extra = metadata()) => ({
  alerts: protectChainDrops(prev, next, "peggedUSD", asset, time, extra),
  extra,
  next,
});
const initialProtection = () => protect(
  record(balances({ starknet: 100, ethereum: 900 })),
  balances({ starknet: 40, ethereum: 1000 }),
);

test("retains the whole dropped chain, updates healthy chains, and recomputes both totals", () => {
  const prev = record(balances({ starknet: 100, ethereum: 900 }));
  prev.starknet.unreleased.peggedUSD = 20;
  const next = balances({ starknet: 40, ethereum: 1000 });
  next.ethereum.unreleased.peggedUSD = 30;
  const result = protect(prev, next);

  assert.deepEqual(next.starknet, prev.starknet);
  assert.notEqual(next.starknet, prev.starknet);
  assert.equal(next.ethereum.circulating.peggedUSD, 1000);
  assert.equal(next.totalCirculating.circulating.peggedUSD, 1100);
  assert.equal(next.totalCirculating.unreleased.peggedUSD, 50);
  assert.equal(result.alerts[0].current, 40);
  assert.equal(result.alerts[0].protection, "held");
  assert.deepEqual(result.extra.extrapolatedChains, [{
    chain: "starknet", timestamp: now - HOUR, blockedAt: now, expiresAt: now + 12 * HOUR,
  }]);
  assert.equal(result.extra.extrapolated, true);
});

test("serialized hourly metadata preserves the first deadline across repeated runs", () => {
  let result = initialProtection();
  for (const hour of [1, 6, 11]) {
    const prev = record(result.next, now + (hour - 1) * HOUR, result.extra);
    result = protect(prev, balances({ starknet: 0, ethereum: 1000 + hour }), now + hour * HOUR);
    assert.equal(result.next.starknet.circulating.peggedUSD, 100);
    assert.equal(result.extra.extrapolatedChains[0].expiresAt, now + 12 * HOUR);
    assert.equal(result.extra.extrapolatedChains[0].timestamp, now - HOUR);
    assert.deepEqual(result.alerts, []);
  }
});

test("crossing midnight does not reset protection or accept a drop early", () => {
  const startedAt = Math.floor(now / 86400) * 86400 + 23 * HOUR;
  const first = protect(record(balances({ starknet: 100 }), startedAt - HOUR),
    balances({ starknet: 40 }), startedAt);
  const second = protect(record(first.next, startedAt, first.extra),
    balances({ starknet: 40 }), startedAt + 2 * HOUR);
  assert.equal(second.next.starknet.circulating.peggedUSD, 100);
  assert.equal(second.extra.extrapolatedChains[0].expiresAt, startedAt + 12 * HOUR);
});

test("accepts a persistent valid drop, including zero, at the exact deadline", () => {
  for (const supply of [40, 0]) {
    const initial = initialProtection();
    const prev = record(initial.next, now + 11 * HOUR, initial.extra);
    const result = protect(prev, balances({ starknet: supply, ethereum: 1000 }), now + 12 * HOUR);
    assert.equal(result.next.starknet.circulating.peggedUSD, supply);
    assert.equal(result.next.totalCirculating.circulating.peggedUSD, 1000 + supply);
    assert.equal(result.alerts[0].protection, "accepted");
    assert.deepEqual(result.extra, metadata());
    const subsequent = protect(record(result.next, now + 12 * HOUR, result.extra),
      balances({ starknet: supply, ethereum: 1000 }), now + 13 * HOUR);
    assert.deepEqual(subsequent.alerts, []);
  }
});

test("removes protection immediately when a valid fetch recovers to the 50% boundary", () => {
  const initial = initialProtection();
  const result = protect(record(initial.next, now, initial.extra),
    balances({ starknet: 50, ethereum: 1000 }), now + HOUR);
  assert.equal(result.next.starknet.circulating.peggedUSD, 50);
  assert.equal(result.alerts[0].protection, "recovered");
  assert.deepEqual(result.extra, metadata());
});

test("missing, null, or snapshot-backed fetches stay protected after expiration", () => {
  const initial = initialProtection();
  const prev = record(initial.next, now, initial.extra);
  const failedFetches = [
    { data: balances({ ethereum: 1000 }), extra: metadata() },
    { data: balances({ starknet: null, ethereum: 1000 }), extra: metadata() },
    { data: balances({ starknet: 0, ethereum: 1000 }), extra: {
      extrapolated: true, extrapolatedChains: [{ chain: "starknet", timestamp: now - HOUR }],
    } },
  ];
  for (const { data, extra } of failedFetches) {
    const result = protect(prev, data, now + 13 * HOUR, extra);
    assert.equal(data.starknet.circulating.peggedUSD, 100);
    assert.equal(data.totalCirculating.circulating.peggedUSD, 1100);
    assert.equal(result.alerts[0].protection, "fetch-failed");
    assert.equal(result.extra.extrapolatedChains[0].expiresAt, now + 12 * HOUR);
    const recovered = protect(record(data, now + 13 * HOUR, extra),
      balances({ starknet: 0, ethereum: 1000 }), now + 14 * HOUR);
    assert.equal(recovered.alerts[0].protection, "accepted");
    assert.equal(recovered.next.starknet.circulating.peggedUSD, 0);
  }
});

test("a failed issuance cannot be mistaken for a valid computed circulating balance", () => {
  const initial = initialProtection();
  const next = balances({ starknet: 40, ethereum: 1000 });
  next.starknet.minted.peggedUSD = null;
  const result = protect(record(initial.next, now + 11 * HOUR, initial.extra), next, now + 12 * HOUR);
  assert.equal(result.alerts[0].protection, "fetch-failed");
  assert.equal(next.starknet.circulating.peggedUSD, 100);
});

test("does not initiate protection from a stale baseline or without a previous record", () => {
  for (const prev of [undefined, record(balances({ starknet: 100 }), now - 12 * HOUR)]) {
    const result = protect(prev, balances({ starknet: 0 }));
    assert.deepEqual(result.alerts, []);
    assert.equal(result.next.starknet.circulating.peggedUSD, 0);
    assert.deepEqual(result.extra, metadata());
  }
});

test("separate chains retain independent deadlines and pre-existing fallback timestamps", () => {
  const prev = record(balances({ starknet: 100, tron: 200, ethereum: 900 }), now - HOUR, {
    extrapolated: true, extrapolatedChains: [{ chain: "starknet", timestamp: now - 3 * HOUR }],
  });
  const first = protect(prev, balances({ starknet: 40, tron: 200, ethereum: 900 }));
  const second = protect(record(first.next, now, first.extra),
    balances({ starknet: 40, tron: 90, ethereum: 900 }), now + HOUR);
  assert.equal(second.extra.extrapolatedChains.find((entry) => entry.chain === "starknet")?.timestamp, now - 3 * HOUR);
  const third = protect(record(second.next, now + 11 * HOUR, second.extra),
    balances({ starknet: 40, tron: 90, ethereum: 900 }), now + 12 * HOUR);
  assert.equal(third.next.starknet.circulating.peggedUSD, 40);
  assert.equal(third.next.tron.circulating.peggedUSD, 200);
  assert.equal(third.next.totalCirculating.circulating.peggedUSD, 1140);
  assert.equal(third.extra.extrapolatedChains.length, 1);
  assert.equal(third.extra.extrapolatedChains[0].expiresAt, now + 13 * HOUR);
});

test("Discord describes protection, acceptance, recovery, and failed fetches", () => {
  const initial = initialProtection();
  const held = formatChainDrops(initial.alerts).join("\n");
  assert.match(held, /last valid balance retained until/);
  for (const [protection, message] of [
    ["accepted", "protection expired; new balance accepted"],
    ["recovered", "fetch recovered; protection removed"],
    ["fetch-failed", "fetch unavailable; last valid balance retained"],
  ] as const) {
    assert.ok(formatChainDrops([{ ...initial.alerts[0], protection }]).join("\n").includes(message));
  }
});

test("valid bridged-from issuances and nested bridge details can be accepted after expiration", () => {
  const initial = initialProtection();
  const next = balances({ starknet: 40, ethereum: 1000 });
  next.starknet.minted.peggedUSD = 30;
  next.starknet.ethereum = { peggedUSD: 10 };
  next.starknet.bridgedTo = {
    peggedUSD: 10,
    bridges: { sampleBridge: { ethereum: { amount: 10 } } },
  } as any;
  const result = protect(record(initial.next, now + 11 * HOUR, initial.extra), next, now + 12 * HOUR);
  assert.equal(result.alerts[0].protection, "accepted");
  assert.equal(next.starknet.ethereum.peggedUSD, 10);
  assert.deepEqual(next.starknet.bridgedTo.bridges, { sampleBridge: { ethereum: { amount: 10 } } });
});

test("recalculating totals also handles an absent unreleased total", () => {
  const next = balances({ starknet: 40, ethereum: 1000 });
  delete next.totalCirculating.unreleased;
  protect(record(balances({ starknet: 100, ethereum: 900 })), next);
  assert.equal(next.totalCirculating.circulating.peggedUSD, 1100);
  assert.equal(next.totalCirculating.unreleased.peggedUSD, 0);
});
