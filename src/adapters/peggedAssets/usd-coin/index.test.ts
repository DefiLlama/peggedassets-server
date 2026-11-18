// Offline test for USDC's Solana unreleased supply. Run with:
//   npx ts-node --transpile-only src/adapters/peggedAssets/usd-coin/index.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import axios from "axios";
import { chains } from "@defillama/sdk";
import adapter from "./index";
import { chainContracts } from "./config";

const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const PREMINT_A = "FSxJ85FXVsXSr51SeWf9ciJWTcRnqKFSmBgRDeL3KyWw";
const PREMINT_B = "6xTBTqJMBr5m7BKqVxmW2x11DfqUwtD3TJsqpxELx72L";

test("solana unreleased: Circle registry pre-mint accounts plus the listed owner wallets", async () => {
  const svm = chains.svm as any;
  const origGet = axios.get, origBalances = svm.getTokenAccountBalances, origByOwner = svm.getTokenAccountsByOwner;
  const urls: string[] = [];
  (axios as any).get = async (url: string) => {
    urls.push(url);
    return { data: { devnet: [], mainnet: [PREMINT_A, PREMINT_B] } };
  };
  svm.getTokenAccountBalances = async ({ tokenAccounts }: { tokenAccounts: string[] }) =>
    tokenAccounts.map((account) => ({ mint: USDC, amount: account === PREMINT_A ? "100000000" : "250000000", owner: "x" }));
  svm.getTokenAccountsByOwner = async () => [{ uiAmount: 5 }];
  try {
    const unreleased = await (adapter as any).solana.unreleased;
    const balances = await unreleased();
    // 100 + 250 from the registry, 5 for each owner wallet left in config
    assert.equal(balances.peggedUSD, 350 + 5 * chainContracts.solana.unreleased.length);
    assert.deepEqual(urls, ["https://raw.githubusercontent.com/circlefin/centre-ecosystem/master/usdc/solana/minters.json"]);
  } finally {
    (axios as any).get = origGet;
    svm.getTokenAccountBalances = origBalances;
    svm.getTokenAccountsByOwner = origByOwner;
  }
});

test("solana unreleased: a registry failure propagates instead of falling back to the owner wallets alone", async () => {
  const origGet = axios.get;
  (axios as any).get = async () => {
    throw new Error("registry down");
  };
  try {
    const unreleased = await (adapter as any).solana.unreleased;
    await assert.rejects(unreleased(), /registry down/);
  } finally {
    (axios as any).get = origGet;
  }
});
