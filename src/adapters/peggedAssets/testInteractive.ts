process.env.SKIP_RPC_CHECK = "true";

import path from "path";
import fs from "fs";
import childProcess from "child_process";
import inquirer from "inquirer";
import peggedAssets from "../../peggedData/peggedData";

require("dotenv").config();

// This directory (src/adapters/peggedAssets) — the same cwd `npm test` uses.
const PEGGED_DIR = __dirname;
const TEST_SCRIPT = path.join(PEGGED_DIR, "test.ts");

type Choice = {
  value: string; // path passed to test.ts (relative to PEGGED_DIR)
  pegType: string;
  name: string; // display label
  tag: string | null;
};

// Resolve the on-disk adapter key for an asset: `module` overrides gecko_id.
function adapterKey(asset: any): string {
  return asset.module ?? asset.gecko_id;
}

// Does an adapter source file exist for this key? (folder/index.ts or key.ts)
function adapterFileExists(key: string): boolean {
  return (
    fs.existsSync(path.join(PEGGED_DIR, key, "index.ts")) ||
    fs.existsSync(path.join(PEGGED_DIR, key + ".ts"))
  );
}

// Set of adapter keys (relative to PEGGED_DIR) touched in the working tree,
// so recently-edited adapters float to the top of the list.
function gitChangedKeys(): Set<string> {
  const keys = new Set<string>();
  const repoRoot = path.resolve(PEGGED_DIR, "../../..");
  const rel = path.relative(repoRoot, PEGGED_DIR).replace(/\\/g, "/"); // src/adapters/peggedAssets
  const collect = (cmd: string) => {
    try {
      const out = childProcess
        .execSync(cmd, { cwd: repoRoot, stdio: ["ignore", "pipe", "ignore"] })
        .toString();
      out
        .split("\n")
        .filter(Boolean)
        .forEach((p) => {
          // p like src/adapters/peggedAssets/<key>/... — take <key>
          const sub = p.startsWith(rel + "/") ? p.slice(rel.length + 1) : null;
          if (!sub) return;
          const top = sub.split("/")[0].replace(/\.ts$/, "");
          if (top && top !== "test" && top !== "testInteractive" && top !== "helper")
            keys.add(top);
        });
    } catch {
      /* ignore */
    }
  };
  collect(`git diff --name-only HEAD -- "${rel}/"`);
  collect(`git ls-files --others --exclude-standard "${rel}/"`);
  return keys;
}

function buildChoices(): Choice[] {
  const changed = gitChangedKeys();
  const choices: Choice[] = [];

  for (const asset of peggedAssets as any[]) {
    const key = adapterKey(asset);
    const hasFile = adapterFileExists(key);
    // For file-based adapters point test.ts at the real source (require works).
    // For chainConfig-only assets, pass the numeric asset id — test.ts resolves
    // it directly to the stablecoin and importAdapter builds from chainConfig
    // (gecko_id may be null for these, so it can't be used as the path segment).
    const value = hasFile ? `${key}/index` : String(asset.id);

    // These flags make the store pipeline skip the asset entirely
    // (see cli/storeAllPeggedAssets.ts), so surface them as "dead" — this
    // takes precedence over changed/chainConfig and is sorted to the bottom.
    const isDead = Boolean(asset.delisted || asset.deadFrom);

    let tag: string | null = null;
    if (isDead) tag = "dead";
    else if (changed.has(key)) tag = "changed";
    else if (!hasFile) tag = "chainConfig";

    const label = `${asset.name} (${asset.symbol}) [${asset.pegType}] :: ${value}`;
    choices.push({
      value,
      pegType: asset.pegType,
      tag,
      name: tag ? `[${tag}] ${label}` : label,
    });
  }

  choices.sort((a, b) => {
    // changed first, then untagged, then chainConfig, then dead (skipped in prod).
    const rank = (c: Choice) =>
      c.tag === "changed" ? 0 : c.tag === "dead" ? 3 : c.tag === "chainConfig" ? 2 : 1;
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    return a.name.localeCompare(b.name);
  });

  return choices;
}

// Minimal subsequence fuzzy match (avoids an extra dependency).
function fuzzyFilter(input: string, choices: Choice[]): Choice[] {
  if (!input) return choices;
  const needle = input.toLowerCase();
  const scored: Array<{ c: Choice; score: number }> = [];
  for (const c of choices) {
    const hay = c.name.toLowerCase();
    const idx = hay.indexOf(needle);
    if (idx !== -1) {
      scored.push({ c, score: idx });
      continue;
    }
    // subsequence fallback
    let pos = 0;
    let matched = 0;
    for (const ch of needle) {
      const found = hay.indexOf(ch, pos);
      if (found === -1) {
        matched = -1;
        break;
      }
      pos = found + 1;
      matched++;
    }
    if (matched === needle.length) scored.push({ c, score: 1000 + pos });
  }
  scored.sort((a, b) => a.score - b.score);
  return scored.map((s) => s.c);
}

function runTest(choice: Choice): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    console.log(
      `\n> npx ts-node --transpile-only test.ts ${choice.value} ${choice.pegType}\n`
    );
    const child = childProcess.spawn(
      "npx",
      ["ts-node", "--transpile-only", TEST_SCRIPT, choice.value, choice.pegType],
      { cwd: PEGGED_DIR, stdio: "inherit", env: process.env }
    );
    child.on("error", reject);
    child.on("close", () => {
      console.log(`\n      Run time: ${(Date.now() - startTime) / 1000} (seconds)\n`);
      resolve();
    });
  });
}

async function main() {
  const choices = buildChoices();
  console.log(
    `Loaded ${choices.length} pegged assets ` +
      `(${choices.filter((c) => c.tag === "changed").length} changed, ` +
      `${choices.filter((c) => c.tag === "dead").length} dead).`
  );

  const prompt = (inquirer as any).default ?? inquirer;

  while (true) {
    // inquirer v14 ships a native `search` (autocomplete) prompt.
    const { value } = await prompt.prompt([
      {
        type: "search",
        name: "value",
        message: "Select a pegged asset to test:",
        pageSize: 20,
        source: async (input: string) =>
          fuzzyFilter(input ?? "", choices).map((c) => ({
            name: c.name,
            value: c.value,
          })),
      } as any,
    ]);
    const choice = choices.find((c) => c.value === value)!;
    await runTest(choice);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
