import { test } from "node:test";
import assert from "node:assert/strict";
import adapter from "./index";

const E18 = BigInt(10) ** BigInt(18);
const dola = (n: number) => (BigInt(n) * E18).toString();

const AN_DOLA = "0x7fcb7dac61ee35b3d4a51117a7c58d53f0a8a670";
const MKT_1 = "0xb427fc22561f3963b04202f9bb5bcebd76c14a99";
const MKT_2 = "0x1111111111111111111111111111111111111111";

test("ethereum unreleased: sums unique FiRM markets from AddMarket logs plus anDOLA", async () => {
  const bals: Record<string, string> = {
    [AN_DOLA]: dola(2),
    [MKT_1]: dola(35),
    [MKT_2]: dola(40),
  };
  const api: any = {
    getBlock: async () => 21000000,
    getLogs: async () => [{ market: MKT_1 }, { market: MKT_2 }, { market: MKT_1.toUpperCase() }],
    multiCall: async ({ calls }: { calls: string[] }) => calls.map((c) => bals[c.toLowerCase()] ?? "0"),
  };
  const res = await (adapter.ethereum.unreleased as any)(api);
  assert.equal(res.peggedUSD, 77);
});

test("ethereum unreleased: before FiRM deployment only checks anDOLA without querying logs", async () => {
  let logsQueried = false;
  const api: any = {
    getBlock: async () => 15000000,
    getLogs: async () => {
      logsQueried = true;
      return [];
    },
    multiCall: async ({ calls }: { calls: string[] }) => {
      assert.deepEqual(calls, [AN_DOLA]);
      return [dola(5)];
    },
  };
  const res = await (adapter.ethereum.unreleased as any)(api);
  assert.equal(logsQueried, false);
  assert.equal(res.peggedUSD, 5);
});
