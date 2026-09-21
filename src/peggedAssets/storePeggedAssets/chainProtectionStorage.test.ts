import assert from "node:assert/strict";
import { test, TestContext } from "node:test";
import { PeggedAsset } from "../../peggedData/peggedData";
import { PeggedAssetIssuance } from "../../types";
import { HOUR } from "../../utils/date";
import * as date from "../../utils/date";
import * as discord from "../../utils/discord";
import dynamodb from "../../utils/shared/dynamodb";
import * as assetBlocking from "./assetBlocking";
import { chainDrops } from "./chainDrops";
import { ExtrapolationMetadata } from "./chainProtection";
import storeNewPeggedBalances, { ZeroCirculatingError } from "./storeNewPeggedBalances";

const asset = { id: "2", name: "USD Coin", gecko_id: "usd-coin", pegType: "peggedUSD" } as PeggedAsset;
const now = Math.floor(1789003600 / 86400) * 86400 + HOUR;
const hourlyPK = (id: string) => `hourlyPeggedBalances#${id}`;
const dailyPK = (id: string) => `dailyPeggedBalances#${id}`;
const clone = (value: any) => JSON.parse(JSON.stringify(value));
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

function setup(t: TestContext, supplies: Record<string, number>) {
  const variables = ["DRY_RUN_MODE", "FORCE_UPDATE", "AWS_LAMBDA_FUNCTION_NAME", "OUTDATED_WEBHOOK"];
  const previousEnvironment = variables.map((name) => [name, process.env[name]] as const);
  for (const name of variables) delete process.env[name];
  const previousAlerts = chainDrops.splice(0);
  t.after(() => {
    for (const [name, value] of previousEnvironment) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    chainDrops.splice(0, chainDrops.length, ...previousAlerts);
  });

  let latest: any = { PK: hourlyPK(asset.id), SK: now - HOUR, ...balances(supplies) };
  let clock = now;
  t.mock.method(date, "getCurrentUnixTimestamp", () => clock);
  const daily = new Map<number, any>();
  t.mock.method(dynamodb, "query", async (params: any) => ({
    Items: params.Limit === 1 ? [clone(latest)] : [...daily.values()].map(clone),
    $metadata: {},
  }));
  t.mock.method(dynamodb, "get", async (key: any) => ({ Item: daily.get(key.SK), $metadata: {} }));
  const persist = async (item: any) => {
    if (item.PK === hourlyPK(asset.id)) latest = clone(item);
    else daily.set(item.SK, clone(item));
    return { $metadata: {} };
  };
  const put = t.mock.method(dynamodb, "put", persist);
  const getAssetBlock = t.mock.method(assetBlocking, "getAssetBlock", async (): Promise<assetBlocking.AssetBlock | null> => null);
  const removeBlock = t.mock.method(assetBlocking, "removeBlock", async () => {});
  const createBlock = t.mock.method(assetBlocking, "createBlock", async () => {
    throw new Error("Unexpected asset-level block");
  });
  t.mock.method(discord, "sendMessage", async () => {});

  return {
    latest: () => clone(latest),
    setLatest: (value: any) => { latest = clone(value); },
    daily,
    createBlock,
    getAssetBlock,
    removeBlock,
    put,
    persist,
    async store(data: PeggedAssetIssuance, time = now, extra: ExtrapolationMetadata = {
      extrapolated: false, extrapolatedChains: [],
    }) {
      clock = time;
      await storeNewPeggedBalances(asset, time, data, hourlyPK, dailyPK, extra, true);
    },
  };
}

test("a large chain drop preserves that chain without blocking healthy chain updates", async (t) => {
  const storage = setup(t, { starknet: 900, ethereum: 100 });
  await storage.store(balances({ starknet: 40, ethereum: 110 }));
  const latest = storage.latest();
  assert.equal(latest.starknet.circulating.peggedUSD, 900);
  assert.equal(latest.ethereum.circulating.peggedUSD, 110);
  assert.equal(latest.totalCirculating.circulating.peggedUSD, 1010);
  assert.equal(latest.extrapolated, true);
  assert.equal(latest.extrapolatedChainsCount, 1);
  assert.equal(latest.extrapolatedChains[0].expiresAt, now + 12 * HOUR);
  assert.equal(storage.createBlock.mock.callCount(), 0);
});

test("an expired valid drop is saved and promoted to daily without triggering the asset block", async (t) => {
  const storage = setup(t, { starknet: 900, ethereum: 100 });
  await storage.store(balances({ starknet: 40, ethereum: 110 }));
  await storage.store(balances({ starknet: 40, ethereum: 110 }), now + 11 * HOUR);
  assert.equal(storage.latest().starknet.circulating.peggedUSD, 900);
  await storage.store(balances({ starknet: 40, ethereum: 110 }), now + 12 * HOUR);
  const latest = storage.latest();
  assert.equal(latest.starknet.circulating.peggedUSD, 40);
  assert.equal(latest.totalCirculating.circulating.peggedUSD, 150);
  assert.equal(latest.extrapolated, undefined);
  assert.equal([...storage.daily.values()][0].starknet.circulating.peggedUSD, 40);
  assert.equal([...storage.daily.values()][0].extrapolated, undefined);
  assert.equal(chainDrops[chainDrops.length - 1]?.protection, "accepted");
  assert.equal(storage.createBlock.mock.callCount(), 0);
});

test("a single-chain asset can retain then accept a valid zero after 12 hours", async (t) => {
  const storage = setup(t, { starknet: 100 });
  await storage.store(balances({ starknet: 0 }));
  assert.equal(storage.latest().totalCirculating.circulating.peggedUSD, 100);
  await storage.store(balances({ starknet: 0 }), now + 11 * HOUR);
  await storage.store(balances({ starknet: 0 }), now + 12 * HOUR);
  assert.equal(storage.latest().totalCirculating.circulating.peggedUSD, 0);
  assert.equal([...storage.daily.values()][0].totalCirculating.circulating.peggedUSD, 0);
  assert.equal(storage.createBlock.mock.callCount(), 0);
});

test("a missing chain remains extrapolated after expiration and alerts until a valid fetch returns", async (t) => {
  const storage = setup(t, { starknet: 100, ethereum: 900 });
  await storage.store(balances({ ethereum: 910 }));
  await storage.store(balances({ ethereum: 920 }), now + 13 * HOUR);
  const latest = storage.latest();
  assert.equal(latest.starknet.circulating.peggedUSD, 100);
  assert.equal(latest.ethereum.circulating.peggedUSD, 920);
  assert.equal(latest.extrapolatedChains[0].expiresAt, now + 12 * HOUR);
  assert.equal(chainDrops[chainDrops.length - 1]?.protection, "fetch-failed");
  await storage.store(balances({ starknet: 30, ethereum: 920 }), now + 14 * HOUR);
  assert.equal(storage.latest().starknet.circulating.peggedUSD, 30);
  assert.equal(storage.latest().extrapolated, undefined);
});

test("force update bypasses chain protection", async (t) => {
  const storage = setup(t, { starknet: 900, ethereum: 100 });
  await storage.store(balances({ starknet: 40, ethereum: 110 }));
  process.env.FORCE_UPDATE = "true";
  await storage.store(balances({ starknet: 40, ethereum: 110 }), now + HOUR);
  assert.equal(storage.latest().starknet.circulating.peggedUSD, 40);
  assert.equal(storage.latest().extrapolated, undefined);
});

test("the existing zero-total safeguard still applies without a recent baseline", async (t) => {
  const storage = setup(t, { starknet: 100 });
  await assert.rejects(storage.store(balances({ starknet: 0 }), now + 12 * HOUR), ZeroCirculatingError);
  assert.equal(storage.latest().SK, now - HOUR);
});

test("active asset blocks do not announce unpersisted chain protections", async (t) => {
  const storage = setup(t, { starknet: 100e6, ethereum: 900e6 });
  storage.getAssetBlock.mock.mockImplementation(async () => ({
    assetId: asset.id, blockedAt: now, expiresAt: now + 12 * HOUR,
    reason: "spike", blockType: "spike" as const,
  }));
  for (const hour of [0, 1, 2]) {
    await storage.store(balances({ starknet: 40e6, ethereum: 3e9 }), now + hour * HOUR);
  }
  assert.equal(storage.put.mock.callCount(), 0);
  assert.deepEqual(chainDrops, []);
  assert.equal(storage.latest().SK, now - HOUR);
  assert.equal(storage.removeBlock.mock.callCount(), 0);
});

test("a spike block created in the same run does not announce an unpersisted chain protection", async (t) => {
  const storage = setup(t, { starknet: 100e6, ethereum: 900e6 });
  storage.createBlock.mock.mockImplementation(async () => ({
    assetId: asset.id, blockedAt: now, expiresAt: now + 12 * HOUR,
    reason: "spike", blockType: "spike" as const,
  }));
  await storage.store(balances({ starknet: 40e6, ethereum: 6e9 }));
  assert.equal(storage.createBlock.mock.callCount(), 1);
  assert.equal(storage.put.mock.callCount(), 0);
  assert.deepEqual(chainDrops, []);
});

test("acceptance does not lower the baseline used for asset spike detection", async (t) => {
  const storage = setup(t, { starknet: 900e6, ethereum: 100e6 });
  await storage.store(balances({ starknet: 40e6, ethereum: 100e6 }));
  await storage.store(balances({ starknet: 40e6, ethereum: 100e6 }), now + 11 * HOUR);
  await storage.store(balances({ starknet: 40e6, ethereum: 800e6 }), now + 12 * HOUR);
  assert.equal(storage.latest().totalCirculating.circulating.peggedUSD, 840e6);
  assert.equal(storage.latest().starknet.circulating.peggedUSD, 40e6);
  assert.equal(storage.createBlock.mock.callCount(), 0);
  assert.equal(chainDrops[chainDrops.length - 1]?.protection, "accepted");
});

test("accepting a bridge move does not hide a genuine asset supply drop", async (t) => {
  const storage = setup(t, { ethereum: 200, polygon: 800 });
  const bridgedBalances = (minted: number, bridged: number): PeggedAssetIssuance => ({
    ethereum: {
      minted: { peggedUSD: minted },
      unreleased: { peggedUSD: 0 },
      circulating: { peggedUSD: minted - bridged },
      bridgedTo: { peggedUSD: 0 },
    },
    polygon: {
      minted: { peggedUSD: 0 },
      unreleased: { peggedUSD: 0 },
      ethereum: { peggedUSD: bridged },
      circulating: { peggedUSD: bridged },
      bridgedTo: { peggedUSD: bridged },
    },
    totalCirculating: {
      circulating: { peggedUSD: minted },
      unreleased: { peggedUSD: 0 },
    },
  });
  storage.setLatest({ PK: hourlyPK(asset.id), SK: now - HOUR, ...bridgedBalances(1000, 800) });
  await storage.store(bridgedBalances(1000, 100));
  await storage.store(bridgedBalances(1000, 100), now + 11 * HOUR);
  const before = storage.latest();
  storage.createBlock.mock.mockImplementation(async () => ({
    assetId: asset.id, blockedAt: now + 12 * HOUR, expiresAt: now + 24 * HOUR,
    reason: "drop", blockType: "drop" as const,
  }));

  await storage.store(bridgedBalances(400, 100), now + 12 * HOUR);

  assert.equal(storage.createBlock.mock.callCount(), 1);
  assert.deepEqual(storage.latest(), before);
});

test("genuine asset spikes are still blocked during a chain acceptance", async (t) => {
  const storage = setup(t, { starknet: 900e6, ethereum: 100e6 });
  await storage.store(balances({ starknet: 40e6, ethereum: 100e6 }));
  await storage.store(balances({ starknet: 40e6, ethereum: 100e6 }), now + 11 * HOUR);
  const before = storage.latest();
  const alertCount = chainDrops.length;
  storage.createBlock.mock.mockImplementation(async () => ({
    assetId: asset.id, blockedAt: now + 12 * HOUR, expiresAt: now + 24 * HOUR,
    reason: "spike", blockType: "spike" as const,
  }));
  await storage.store(balances({ starknet: 40e6, ethereum: 6e9 }), now + 12 * HOUR);
  assert.equal(storage.createBlock.mock.callCount(), 1);
  assert.deepEqual(storage.latest(), before);
  assert.equal(chainDrops.length, alertCount);
});

test("an hourly write failure cannot announce or persist a chain protection", async (t) => {
  const storage = setup(t, { starknet: 100, ethereum: 900 });
  storage.put.mock.mockImplementation(async () => { throw new Error("DynamoDB unavailable"); });
  await assert.rejects(storage.store(balances({ starknet: 40, ethereum: 910 })), /DynamoDB unavailable/);
  assert.deepEqual(chainDrops, []);
  assert.equal(storage.latest().extrapolated, undefined);
  storage.put.mock.mockImplementation(storage.persist);
  await storage.store(balances({ starknet: 40, ethereum: 910 }), now + HOUR);
  assert.equal(chainDrops.length, 1);
  assert.equal(storage.latest().extrapolatedChains[0].expiresAt, now + 13 * HOUR);
});

test("a write failure after accepting zero remains a storage error", async (t) => {
  const storage = setup(t, { starknet: 100 });
  await storage.store(balances({ starknet: 0 }));
  await storage.store(balances({ starknet: 0 }), now + 11 * HOUR);
  const alertCount = chainDrops.length;
  storage.put.mock.mockImplementation(async () => { throw new Error("DynamoDB unavailable"); });
  await assert.rejects(storage.store(balances({ starknet: 0 }), now + 12 * HOUR), (error) => {
    assert.ok(error instanceof Error);
    assert.equal(error.message, "DynamoDB unavailable");
    assert.ok(!(error instanceof ZeroCirculatingError));
    return true;
  });
  assert.equal(chainDrops.length, alertCount);
  assert.equal(storage.latest().totalCirculating.circulating.peggedUSD, 100);
});

test("an auto-force update bypasses chain protection before resetting the baseline", async (t) => {
  const storage = setup(t, { starknet: 900, ethereum: 100 });
  await storage.store(balances({ starknet: 40, ethereum: 110 }));
  const alertCount = chainDrops.length;
  storage.getAssetBlock.mock.mockImplementation(async () => ({
    assetId: asset.id, blockedAt: now - 12 * HOUR, expiresAt: now,
    reason: "drop", blockType: "drop" as const,
  }));
  await storage.store(balances({ starknet: 40, ethereum: 110 }), now + HOUR);
  assert.equal(storage.removeBlock.mock.callCount(), 1);
  assert.equal(storage.latest().starknet.circulating.peggedUSD, 40);
  assert.equal(storage.latest().extrapolated, undefined);
  assert.equal(chainDrops.length, alertCount);
});
