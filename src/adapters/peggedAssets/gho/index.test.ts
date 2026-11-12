// Offline tests for the GHO adapter's non-circulating supply. Run with:
//   npx ts-node --transpile-only src/adapters/peggedAssets/gho/index.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import adapter, { idleDirectMinterGho } from "./index";

const E18 = BigInt(10) ** BigInt(18);
const gho = (n: number) => BigInt(n) * E18;
const RAY = (BigInt(10) ** BigInt(27)).toString();

const GHO = "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f";
const ETH_RESERVE = "0x54C58157DeF387A880AE62332D1445f03adbE7E9";
const CORE = "0x5513224daaEABCa31af5280727878d52097afA05";
const LIDO = "0x2cE01c87Fec1b71A9041c52CaED46Fc5f4807285";

const state = (o: Partial<Record<string, bigint>>) => ({
  bucketLevel: gho(100), liquidity: gho(0), aTokenSupply: gho(100), treasuryAccrued: BigInt(0), minterATokenBalance: gho(100), ...o,
});

test("idle: no borrows, no other suppliers -> whole bucket is idle", () => {
  assert.equal(idleDirectMinterGho(state({ liquidity: gho(100) })), gho(100));
});

test("idle: borrows draw on minter liquidity first, user deposits stay circulating", () => {
  // minter supplied 100, users supplied 50, borrowers took 30 -> 120 liquidity, 70 of it the minter's
  assert.equal(idleDirectMinterGho(state({ liquidity: gho(120), aTokenSupply: gho(150) })), gho(70));
});

test("idle: borrows above the minter's supply -> nothing idle, never negative", () => {
  assert.equal(idleDirectMinterGho(state({ liquidity: gho(20), aTokenSupply: gho(150) })), BigInt(0));
});

test("idle: treasury accrual counts as a non-minter claim", () => {
  assert.equal(idleDirectMinterGho(state({ liquidity: gho(100), treasuryAccrued: gho(5) })), gho(95));
});

test("idle: capped at bucketLevel (minter's accrued interest or donations are not pre-mint)", () => {
  assert.equal(idleDirectMinterGho(state({ liquidity: gho(110), aTokenSupply: gho(110), minterATokenBalance: gho(110) })), gho(100));
});

type Handler = (abi: string, target: string, params: any[]) => any;
function mockApi(handler: Handler, opts: { timestamp?: number } = {}) {
  const log: string[] = [];
  const one = (c: any, base: any) => {
    const target = typeof c === "string" ? base.target ?? c : c.target ?? base.target;
    const params = typeof c === "string" ? (base.target ? [c] : []) : c.params ?? [];
    log.push(`${base.abi}@${target}`);
    const r = handler(base.abi, target, params);
    if (r instanceof Error) throw r;
    return r;
  };
  return {
    log,
    timestamp: opts.timestamp,
    getBlock: async () => 123,
    call: async (o: any) => one({ target: o.target, params: o.params }, o),
    multiCall: async (o: any) => o.calls.map((c: any) => one(c, o)),
  } as any;
}

// Ethereum chain state: reserve balance + per-minter levels and pool state.
function ethHandler(reserveBal: bigint, minters: { [m: string]: { level: bigint; liq?: bigint; aSupply?: bigint; mBal?: bigint; aToken?: string } }): Handler {
  return (abi, target, params) => {
    if (abi === "erc20:balanceOf" && target === GHO) return params[0] === ETH_RESERVE ? reserveBal.toString() : new Error("unexpected balanceOf");
    if (abi.includes("getFacilitator")) return { bucketLevel: (minters[params[0]]?.level ?? BigInt(0)).toString() };
    const m = Object.keys(minters).find((k) => k === target || `pool-${k}` === target || `aT-${k}` === target);
    if (!m) return new Error(`unexpected call ${abi} ${target}`);
    const s = minters[m];
    if (abi === "address:POOL") return `pool-${m}`;
    if (abi === "address:GHO_A_TOKEN") return `aT-${m}`;
    if (abi.includes("getReserveData")) return { aTokenAddress: s.aToken ?? `aT-${m}`, accruedToTreasury: "0", liquidityIndex: RAY };
    if (abi.includes("getVirtualUnderlyingBalance")) return (s.liq ?? BigInt(0)).toString();
    if (abi === "erc20:totalSupply") return (s.aSupply ?? s.level).toString();
    if (abi === "erc20:balanceOf") return (s.mBal ?? s.level).toString();
    return new Error(`unexpected ${abi}`);
  };
}

test("ethereum: zero inventory and no active minters -> 0, pool contracts never queried", async () => {
  const api = mockApi(ethHandler(BigInt(0), {}));
  const res = await adapter.ethereum.unreleased(api);
  assert.equal(res.peggedUSD, 0);
  assert.ok(!api.log.some((l: string) => l.startsWith("address:POOL")));
});

test("ethereum: reserve inventory + idle minter liquidity are summed once each", async () => {
  const api = mockApi(ethHandler(gho(276), {
    [CORE]: { level: gho(135), liq: gho(33), aSupply: gho(135) }, // 33 idle
    [LIDO]: { level: gho(45), liq: gho(23), aSupply: gho(52), mBal: gho(46) }, // 23 - (52-46) = 17 idle
  }));
  const res = await adapter.ethereum.unreleased(api);
  assert.equal(res.peggedUSD, 276 + 33 + 17);
});

test("ethereum: reserve withdrawal (GSM use) lowers excluded supply, replenishment (restore) raises it", async () => {
  const before = await adapter.ethereum.unreleased(mockApi(ethHandler(gho(310), {})));
  const afterUse = await adapter.ethereum.unreleased(mockApi(ethHandler(gho(276), {})));
  const afterRestore = await adapter.ethereum.unreleased(mockApi(ethHandler(gho(300), {})));
  assert.deepEqual([before.peggedUSD, afterUse.peggedUSD, afterRestore.peggedUSD], [310, 276, 300]);
});

test("ethereum: minter whose GHO_A_TOKEN disagrees with the pool fails instead of guessing", async () => {
  const api = mockApi(ethHandler(BigInt(0), { [CORE]: { level: gho(10), liq: gho(10), aToken: "0xother" } }));
  await assert.rejects(adapter.ethereum.unreleased(api), /does not match/);
});

test("ethereum: an RPC failure propagates (framework retries / falls back) instead of returning 0", async () => {
  const base = ethHandler(gho(1), { [CORE]: { level: gho(10), liq: gho(10) } });
  const api = mockApi((abi, t, p) => (abi.includes("getVirtualUnderlyingBalance") ? new Error("rpc down") : base(abi, t, p)));
  await assert.rejects(adapter.ethereum.unreleased(api), /rpc down/);
});

test("L2: reserve balance excluded on its own chain only; no direct-minter lookups there", async () => {
  const api = mockApi((abi, target, params) =>
    abi === "erc20:balanceOf" && target === "0x7dfF72693f6A4149b17e7C6314655f6A9F7c8B33" && params[0] === "0xC912D64F9F649897dC0244da3835869d410d053e"
      ? gho(33).toString() : new Error(`unexpected ${abi} ${target}`), { timestamp: 1790000000 });
  const res = await adapter.arbitrum.unreleased(api);
  assert.equal(res.peggedUSD, 33);
  assert.equal(api.log.length, 1);
  assert.equal(adapter.base.unreleased, undefined); // chains without a reserve exclude nothing
});

test("L2: timestamps before the reserve was first funded skip the call (token may not exist yet)", async () => {
  const api = mockApi(() => new Error("must not be called"), { timestamp: 1785960902 - 1 });
  assert.deepEqual(await adapter.monad.unreleased(api), {});
  const atFunding = mockApi(() => gho(50).toString(), { timestamp: 1785960902 });
  assert.equal((await adapter.monad.unreleased(atFunding)).peggedUSD, 50);
});

test("bridged L2 supply is still reported per chain from the CCIP token", () => {
  for (const chain of ["arbitrum", "base", "avax", "xdai", "ink", "mantle", "monad", "plasma", "xlayer"])
    assert.equal(typeof adapter[chain].ethereum, "function", chain);
  assert.equal(typeof adapter.ethereum.minted, "function");
});
