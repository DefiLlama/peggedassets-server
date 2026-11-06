// Offline tests for checkBridgeStablecoins. Run with:
//   npx ts-node --transpile-only src/adapters/peggedAssets/helper/scripts/checkBridgeStablecoins.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIndex, lookup, parseArgs, parseSupply, render, run } from "./checkBridgeStablecoins";

const DOCS = "https://apidocs.bridge.xyz/platform/issuance/reporting-and-transparency.md";
const INDEX = "https://reserves.bridge.xyz/";
const page = (ticker: string) => `https://reserves.bridge.xyz/${ticker}`;
const api = (ticker: string) => `https://transparency.bridge.xyz/v0/stablecoins/${ticker}`;

const EVM_A = "0x1111111111111111111111111111111111111111";
const EVM_B = "0x2222222222222222222222222222222222222222";
const EVM_RES = "0x3333333333333333333333333333333333333333";
const APTOS = "0x96401f1e3ab3245d056d5a1ba67eef066ac3edc4d5f1b16adc5d567e79a845b0";
const ISSUER = "GAIUGZZZSL47BKH27SUDZESZELFJDPE2UM52RACOSFJ7BIVBGKUEJSUZ";

const docs = (tickers: string[]) =>
  `# Reporting\n\n> [accordion] Supported stablecoin tickers\n>\n> **USD-pegged**\n>\n> ${tickers.map((t) => `\`${t}\``).join(" ")}\n\n## Next\n`;
const reservesPage = (name: string, symbol: string, links: string[], extra = "") =>
  `<html><head><title>${name} (${symbol}) | Bridge</title></head><body>${links.map((l) => `<a href="${l}">x</a>`).join("")}${extra}</body></html>`;

type Routes = Record<string, string | Error>;
const fetcher = (routes: Routes) => async (url: string) => {
  const r = routes[url];
  if (r === undefined) throw new Error(`${url} -> HTTP 404`);
  if (r instanceof Error) throw r;
  return r;
};
const supply = (n: unknown) => JSON.stringify({ total_onchain_amount: n });
// one-ticker world: docs + index list `ticker`, supply is `amount`, reserves page is `html`
const world = (ticker: string, html: string | Error, amount: unknown = "1000", extra: Routes = {}): Routes => ({
  [DOCS]: docs([ticker]), [INDEX]: `<a href="/${ticker}">`, [api(ticker)]: supply(amount), [page(ticker)]: html, ...extra,
});

const asset = (id: string, address: string, chains: Record<string, Record<string, string | string[]>> = {}) =>
  ({ id, name: `Asset ${id}`, address, chainConfig: { chains } });

test("same address on different chains is not treated as the same deployment", async () => {
  const assets = [asset("1", `base:${EVM_A}`, { base: { issued: [EVM_A] } })];
  const html = reservesPage("Tok", "TOK", [`https://basescan.org/token/${EVM_A}`, `https://arbiscan.io/token/${EVM_A}`]);
  const r = await run({ text: fetcher(world("tok", html)), assets });
  assert.equal(r.missingChains.length, 1);
  assert.deepEqual(r.missingChains[0].deployments.map((d) => d.chain), ["arbitrum"]);
  assert.equal(r.missingChains[0].id, "1");
  assert.equal(r.exitCode, 1);
});

test("an address tracked only on another chain does not make a token 'tracked'", async () => {
  const assets = [asset("1", `ethereum:${EVM_A}`, { ethereum: { issued: [EVM_A] } })];
  const html = reservesPage("Tok", "TOK", [`https://basescan.org/token/${EVM_A}`]);
  const r = await run({ text: fetcher(world("tok", html)), assets });
  assert.equal(r.missingTokens.length, 1);
  assert.equal(r.missingChains.length, 0);
});

test("reserve / unreleased / bridge-contract addresses are not indexed as deployments", () => {
  const index = buildIndex([
    asset("1", `ethereum:${EVM_A}`, { ethereum: { issued: [EVM_A], unreleased: [EVM_RES], reserves: EVM_B, bridgeOnETH: [EVM_B] } }),
  ]);
  assert.deepEqual(lookup(index, { chain: "ethereum", address: EVM_A }), ["1"]);
  assert.deepEqual(lookup(index, { chain: "ethereum", address: EVM_RES }), []);
  assert.deepEqual(lookup(index, { chain: "ethereum", address: EVM_B }), []);
});

test("a token whose address is another asset's reserve wallet is reported missing, not attributed", async () => {
  const assets = [asset("1", `ethereum:${EVM_A}`, { ethereum: { issued: [EVM_A], unreleased: [EVM_RES] } })];
  const html = reservesPage("Tok", "TOK", [`https://etherscan.io/token/${EVM_RES}`]);
  const r = await run({ text: fetcher(world("tok", html)), assets });
  assert.equal(r.missingTokens.length, 1);
  assert.equal(r.missingChains.length, 0);
});

test("bridgedFrom* entries count as tracked deployments", () => {
  const index = buildIndex([asset("1", `ethereum:${EVM_A}`, { arbitrum: { bridgedFromETH: [EVM_B], bridge: "layerzero" } })]);
  assert.deepEqual(lookup(index, { chain: "arbitrum", address: EVM_B.toUpperCase().replace("0X", "0x") }), ["1"]);
});

test("a failed reserves-page request is a failed check with exit code 2, other tickers still reported", async () => {
  const assets = [asset("1", `base:${EVM_A}`, { base: { issued: [EVM_A] } })];
  const routes: Routes = {
    [DOCS]: docs(["good", "bad"]), [INDEX]: "",
    [api("good")]: supply("5"), [page("good")]: reservesPage("Good", "GOOD", [`https://basescan.org/token/${EVM_A}`]),
    [api("bad")]: supply("5"), [page("bad")]: new Error("https://reserves.bridge.xyz/bad -> HTTP 503"),
  };
  const r = await run({ text: fetcher(routes), assets });
  assert.deepEqual(r.failures.map((f) => f.ticker), ["bad"]);
  assert.deepEqual(r.inSync, ["good"]);
  assert.equal(r.exitCode, 2);
  const report = render(r);
  assert.match(report, /INCOMPLETE CHECK/);
  assert.match(report, /`bad` not checked/);
  assert.doesNotMatch(report, /already tracked/);
});

test("docs discovery failure with a nonempty reserves index is incomplete", async () => {
  const assets = [asset("1", `base:${EVM_A}`, { base: { issued: [EVM_A] } })];
  const routes = world("tok", reservesPage("Tok", "TOK", [`https://basescan.org/token/${EVM_A}`]));
  routes[DOCS] = new Error(`${DOCS} -> HTTP 500`);
  const r = await run({ text: fetcher(routes), assets });
  assert.equal(r.discovery.docsOk, false);
  assert.deepEqual(r.inSync, ["tok"]);
  assert.equal(r.exitCode, 2);
  assert.match(render(r), /ticker discovery from Bridge docs failed/);
});

test("docs page without the ticker section is incomplete discovery", async () => {
  const routes = world("tok", reservesPage("Tok", "TOK", [`https://basescan.org/token/${EVM_A}`]));
  routes[DOCS] = "# Reporting\n\nrewritten page, no list here\n";
  const r = await run({ text: fetcher(routes), assets: [asset("1", `base:${EVM_A}`, { base: { issued: [EVM_A] } })] });
  assert.equal(r.discovery.docsOk, false);
  assert.equal(r.exitCode, 2);
});

test("unknown supply with a positive --min-supply is still reported", async () => {
  const html = reservesPage("Tok", "TOK", [`https://basescan.org/token/${EVM_A}`]);
  const routes = world("tok", html);
  routes[api("tok")] = new Error("HTTP 500");
  const r = await run({ text: fetcher(routes), assets: [], minSupply: 1_000_000 });
  assert.equal(r.missingTokens.length, 1);
  assert.equal(r.missingTokens[0].supply.status, "unknown");
  assert.equal(r.belowMinSupply.length, 0);
  assert.equal(r.exitCode, 1);
});

test("known supply below --min-supply is skipped, not counted as in sync", async () => {
  const html = reservesPage("Tok", "TOK", [`https://basescan.org/token/${EVM_A}`]);
  const r = await run({ text: fetcher(world("tok", html, "10")), assets: [], minSupply: 1000 });
  assert.equal(r.belowMinSupply.length, 1);
  assert.equal(r.inSync.length, 0);
  assert.equal(r.exitCode, 0);
});

test("unknown supply on a fully tracked token is not in sync", async () => {
  const assets = [asset("1", `base:${EVM_A}`, { base: { issued: [EVM_A] } })];
  const html = reservesPage("Tok", "TOK", [`https://basescan.org/token/${EVM_A}`]);
  const r = await run({ text: fetcher(world("tok", html, "NaN")), assets });
  assert.equal(r.inSync.length, 0);
  assert.equal(r.needsAttention.length, 1);
  assert.equal(r.exitCode, 1);
});

test("parseSupply rejects missing, empty, negative and non-finite values", () => {
  for (const bad of [undefined, null, "", "  ", "abc", "-1", -5, "Infinity", Infinity, NaN, {}])
    assert.equal(parseSupply(bad).status, "unknown", JSON.stringify(bad));
  assert.deepEqual(parseSupply("0"), { status: "ok", value: 0 });
  assert.deepEqual(parseSupply("25319900.23"), { status: "ok", value: 25319900.23 });
});

test("unknown explorer host next to a tracked bare address needs attention, not in sync", async () => {
  const assets = [asset("1", `aptos:${APTOS}`, { aptos: { issued: [APTOS] } })];
  const html = reservesPage("Dec", "USDCBL", ["https://newchainscan.io/token/0xabc"], `<p>${APTOS}</p>`);
  const r = await run({ text: fetcher(world("usdcbl", html)), assets });
  assert.equal(r.inSync.length, 0);
  assert.equal(r.needsAttention.length, 1);
  assert.ok(r.needsAttention[0].reasons.some((x) => x.includes("newchainscan.io")));
});

test("a tracked bare address alone (Aptos FA page) is in sync", async () => {
  const assets = [asset("1", `aptos:${APTOS}`, { aptos: { issued: [APTOS] } })];
  const r = await run({ text: fetcher(world("usdcbl", reservesPage("Dec", "USDCBL", [], `<p>${APTOS}</p>`))), assets });
  assert.deepEqual(r.inSync, ["usdcbl"]);
  assert.equal(r.exitCode, 0);
});

test("unknown explorer host next to tracked explorer deployments needs attention, not in sync", async () => {
  const assets = [asset("1", `base:${EVM_A}`, { base: { issued: [EVM_A] } })];
  const html = reservesPage("Tok", "TOK", [`https://basescan.org/token/${EVM_A}`, "https://newchainscan.io/token/0xabc"]);
  const r = await run({ text: fetcher(world("tok", html)), assets });
  assert.equal(r.inSync.length, 0);
  assert.equal(r.needsAttention.length, 1);
});

test("a page with no deployments at all is never in sync", async () => {
  const r = await run({ text: fetcher(world("tok", reservesPage("Tok", "TOK", []))), assets: [] });
  assert.equal(r.needsAttention.length, 1);
  assert.match(r.needsAttention[0].reasons.join(), /no deployments found/);
  assert.equal(r.exitCode, 1);
});

test("known + unknown deployments -> missing chain attributed to the owning asset", async () => {
  const assets = [asset("9", "ethereum:0x9999999999999999999999999999999999999999"), asset("1", `ethereum:${EVM_A}`, { base: { issued: EVM_B } })];
  const html = reservesPage("Tok", "TOK", [`https://etherscan.io/token/${EVM_A}`, `https://basescan.org/token/${EVM_B}`, "https://solscan.io/token/So1anaMint111"]);
  const r = await run({ text: fetcher(world("tok", html)), assets });
  assert.equal(r.missingChains.length, 1);
  assert.equal(r.missingChains[0].id, "1");
  assert.deepEqual(r.missingChains[0].deployments.map((d) => d.chain), ["solana"]);
});

test("multiple deployments of the same tracked asset (incl. duplicate explorer links) are in sync", async () => {
  const assets = [asset("1", `ethereum:${EVM_A}`, { base: { issued: [EVM_B] } })];
  const html = reservesPage("Tok", "TOK", [
    `https://etherscan.io/token/${EVM_A}`, `https://etherscan.io/address/${EVM_A.toUpperCase().replace("0X", "0x")}`, `https://basescan.org/token/${EVM_B}`,
  ]);
  const r = await run({ text: fetcher(world("tok", html)), assets });
  assert.deepEqual(r.inSync, ["tok"]);
  assert.equal(r.exitCode, 0);
});

test("deployments matching different assets are flagged, never attributed to the first match", async () => {
  const assets = [asset("1", `ethereum:${EVM_A}`), asset("2", `base:${EVM_B}`)];
  const html = reservesPage("Tok", "TOK", [`https://etherscan.io/token/${EVM_A}`, `https://basescan.org/token/${EVM_B}`, "https://solscan.io/token/So1anaMint111"]);
  const r = await run({ text: fetcher(world("tok", html)), assets });
  assert.equal(r.missingChains.length, 0);
  assert.equal(r.needsAttention.length, 1);
  assert.match(r.needsAttention[0].reasons.join("\n"), /different peggedData ids/);
  assert.match(r.needsAttention[0].reasons.join("\n"), /owner ambiguous/);
});

test("one deployment tracked by two assets is flagged as conflicting", async () => {
  const assets = [asset("1", `ethereum:${EVM_A}`), asset("2", "ethereum:0x9999999999999999999999999999999999999999", { ethereum: { issued: [EVM_A] } })];
  const r = await run({ text: fetcher(world("tok", reservesPage("Tok", "TOK", [`https://etherscan.io/token/${EVM_A}`]))), assets });
  assert.equal(r.inSync.length, 0);
  assert.match(r.needsAttention[0].reasons.join("\n"), /several peggedData ids: 1, 2/);
});

test("stellar: shared issuer with several codes is ambiguous, unique code:issuer matches", () => {
  const index = buildIndex([
    asset("157", "stellar:GDXL", { stellar: { issued: [`VCHF:${ISSUER}`] } }),
    asset("158", "stellar:GDXL", { stellar: { issued: [`VEUR-${ISSUER}`] } }),
  ]);
  assert.deepEqual(lookup(index, { chain: "stellar", address: `veur:${ISSUER}` }), ["158"]);
  assert.deepEqual(lookup(index, { chain: "stellar", address: `XYZ:${ISSUER}` }).sort(), ["157", "158"]);
});

test("address normalization: base58 is case-sensitive, hex is not, move hex ignores leading zeros, sui keeps the type", () => {
  const index = buildIndex([
    asset("1", "solana:CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH"),
    asset("2", "aptos:0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2"),
    asset("3", "sui:0x44f838219cf67b058f3b37907b655f226153c18e33dfcd0da559a844fea9b1c1::usdsui::USDSUI"),
  ]);
  assert.deepEqual(lookup(index, { chain: "solana", address: "CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH" }), ["1"]);
  assert.deepEqual(lookup(index, { chain: "solana", address: "cashx9kjustyftlfwgvevf59sgeg9sh5ffcnzmvpcash" }), []);
  assert.deepEqual(lookup(index, { chain: "aptos", address: "0x5FABD1B12E39967A3C24E91B7B8F67719A6DACEE74F3C8B9FB7D93E855437D2" }), ["2"]);
  assert.deepEqual(lookup(index, { chain: "sui", address: "0x44f838219cf67b058f3b37907b655f226153c18e33dfcd0da559a844fea9b1c1::usdsui::USDSUI" }), ["3"]);
  assert.deepEqual(lookup(index, { chain: "sui", address: "0x44f838219cf67b058f3b37907b655f226153c18e33dfcd0da559a844fea9b1c1::other::USDSUI" }), []);
});

test("CLI args: missing or invalid values are rejected", () => {
  assert.deepEqual(parseArgs([]), { jsonOut: null, minSupply: 0 });
  assert.deepEqual(parseArgs(["--json", "out.json", "--min-supply", "1000"]), { jsonOut: "out.json", minSupply: 1000 });
  assert.throws(() => parseArgs(["--json"]), /--json needs a value/);
  assert.throws(() => parseArgs(["--json", "--min-supply", "5"]), /--json needs a value/);
  assert.throws(() => parseArgs(["--min-supply"]), /needs a value/);
  assert.throws(() => parseArgs(["--min-supply", "abc"]), /non-negative number/);
  assert.throws(() => parseArgs(["--min-supply", "-5"]), /needs a value|non-negative/);
});

test("clean run exits 0 and says so", async () => {
  const assets = [asset("1", `base:${EVM_A}`, { base: { issued: [EVM_A] } })];
  const r = await run({ text: fetcher(world("tok", reservesPage("Tok", "TOK", [`https://basescan.org/token/${EVM_A}`]))), assets });
  assert.equal(r.exitCode, 0);
  assert.match(render(r), /already tracked/);
});
