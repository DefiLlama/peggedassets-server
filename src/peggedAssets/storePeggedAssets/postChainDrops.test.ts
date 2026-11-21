import assert from "node:assert/strict";
import { test } from "node:test";
import axios from "axios";
import { sendMessage } from "../../utils/discord";
import { ChainDrop } from "./chainDrops";
import { formatTeamChainDrops, postChainDrops } from "./postChainDrops";

const held: ChainDrop = {
  chain: "starknet", assetName: "USD Coin", assetId: "2",
  previous: 141560445.7, current: 60e6, missing: false,
  protection: "held", expiresAt: 1789046800,
};
const webhooks = { outdated: "https://example.test/outdated", team: "https://example.test/team" };

test("team message is concise and includes only active protection alerts", () => {
  assert.equal(formatTeamChainDrops([
    held,
    { ...held, chain: "tron", missing: true, current: 0, protection: "fetch-failed" },
    { ...held, protection: "accepted" },
    { ...held, protection: "recovered" },
  ]), [
    "Probable issue with stablecoin data:", "", "Chain circulating alerts:",
    "USD Coin (id=2) | tron | 141.56 M → missing | fallback kept",
    "USD Coin (id=2) | starknet | 141.56 M → 60.00 M | protected 12h",
  ].join("\n"));
});

test("invalid fetches are not displayed as valid zero balances in the team message", () => {
  assert.match(formatTeamChainDrops([{ ...held, current: 0, protection: "fetch-failed" }])!, /→ unavailable \| fallback kept/);
});

test("team message caps rows, prioritizes lost circulating, and does not mutate events", () => {
  const drops = Array.from({ length: 12 }, (_, i) => ({
    ...held, chain: `chain${i}`, previous: (i + 1) * 1e6, current: 0,
  }));
  const before = [...drops];
  const message = formatTeamChainDrops(drops)!;
  assert.equal(message.split("\n").filter((line) => line.includes(" | ")).length, 10);
  assert.equal(message.split("\n")[3], "USD Coin (id=2) | chain11 | 12.00 M → 0.00 | protected 12h");
  assert.ok(message.endsWith("... and 2 more"));
  assert.deepEqual(drops, before);
});

test("posts detail to outdated and a compact alert to the monitored team webhook", async (t) => {
  const calls: Array<{ url: string; content: string }> = [];
  t.mock.method(axios, "post", async (url: string, body: { content: string }) => {
    calls.push({ url, content: body.content });
  });
  await postChainDrops([held], webhooks);
  assert.equal(calls.length, 2);
  const team = calls.find((call) => call.url === `${webhooks.team}?wait=true`)!;
  const outdated = calls.find((call) => call.url === `${webhooks.outdated}?wait=true`)!;
  assert.match(team.content, /Probable issue with stablecoin data/);
  assert.match(team.content, /protected 12h/);
  assert.doesNotMatch(team.content, /retained until/);
  assert.match(outdated.content, /last valid balance retained until/);
});

test("recovery and acceptance are posted only to the detailed channel", async (t) => {
  const post = t.mock.method(axios, "post", async () => {});
  await postChainDrops([{ ...held, protection: "accepted" }, { ...held, protection: "recovered" }], webhooks);
  assert.equal(post.mock.callCount(), 1);
  assert.equal(post.mock.calls[0].arguments[0], `${webhooks.outdated}?wait=true`);
});

test("the team notification works without an outdated webhook", async (t) => {
  const post = t.mock.method(axios, "post", async () => {});
  await postChainDrops([held], { outdated: undefined, team: webhooks.team });
  assert.equal(post.mock.callCount(), 1);
  assert.equal(post.mock.calls[0].arguments[0], `${webhooks.team}?wait=true`);
});

test("a failed webhook does not prevent notification to the other channel", async (t) => {
  for (const failed of [webhooks.outdated, webhooks.team]) {
    const delivered: string[] = [];
    const error = t.mock.method(console, "error", () => {});
    const post = t.mock.method(axios, "post", async (url: string) => {
      if (url === `${failed}?wait=true`) throw new Error("Webhook unavailable");
      delivered.push(url);
    });
    await postChainDrops([held], webhooks);
    assert.equal(delivered.length, 1);
    assert.equal(error.mock.callCount(), 1);
    post.mock.restore();
    error.mock.restore();
  }
});

test("no actual sends occur without events or configured webhooks", async (t) => {
  const post = t.mock.method(axios, "post", async () => {});
  const warn = t.mock.method(console, "warn", () => {});
  await postChainDrops([], webhooks);
  await postChainDrops([held], { outdated: undefined, team: undefined });
  assert.equal(post.mock.callCount(), 0);
  assert.equal(warn.mock.callCount(), 1);
});

test("long detailed messages retain Markdown formatting when split", async (t) => {
  const contents: string[] = [];
  t.mock.method(axios, "post", async (_url: string, body: { content: string }) => {
    contents.push(body.content);
  });
  const message = Array.from({ length: 30 }, (_, i) => `**chain${i}** ${"balance ".repeat(14)}`).join("\n");
  await sendMessage(message, webhooks.outdated, false);
  assert.ok(contents.length > 1);
  assert.ok(contents.every((content) => content.length < 2000 && !content.startsWith("```")));
  assert.equal(contents.join("\n"), message);
});

test("long team messages retain code-block formatting when split", async (t) => {
  const contents: string[] = [];
  t.mock.method(axios, "post", async (_url: string, body: { content: string }) => {
    contents.push(body.content);
  });
  const message = Array.from({ length: 30 }, (_, i) => `chain${i} ${"balance ".repeat(14)}`).join("\n");
  await sendMessage(message, webhooks.team, true);
  assert.ok(contents.length > 1);
  assert.ok(contents.every((content) => content.length < 2000 && content.startsWith("```\n") && content.endsWith("\n```")));
  assert.equal(contents.map((content) => content.slice(4, -4)).join("\n"), message);
});
