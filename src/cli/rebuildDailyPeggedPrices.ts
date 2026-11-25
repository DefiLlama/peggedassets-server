/**
 * Rebuilds daily prices since 2024-06-10 from the first hourly reading (#928).
 * Dry-run by default. Run after deploying the first-write rule. --write backs up replaced records.
 *   npx ts-node --transpile-only src/cli/rebuildDailyPeggedPrices.ts [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--write]
 *   npx ts-node --transpile-only src/cli/rebuildDailyPeggedPrices.ts --restore <backup>
 * After writing/restoring: STABLECOINS_CACHE_RESET_PRICES=true pnpm run api2-cron-task
 */
import * as fs from "fs";
import { isDeepStrictEqual } from "util";
import { dailyPeggedPrices, hourlyPeggedPrices } from "../peggedAssets/utils/getLastRecord";
import { secondsInDay } from "../utils/date";
import dynamodb from "../utils/shared/dynamodb";

type PriceRecord = {
  PK: string;
  SK: number;
  prices: Record<string, unknown>;
};

export type Plan = {
  rewrite: { daily: PriceRecord; first: PriceRecord }[];
  unchanged: number[];
  noHourly: number[];
  noDaily: number[];
};

export function planRebuild(days: number[], daily: Map<number, PriceRecord>, firstHourly: Map<number, PriceRecord>): Plan {
  const plan: Plan = { rewrite: [], unchanged: [], noHourly: [], noDaily: [] };
  for (const day of days) {
    const record = daily.get(day);
    const first = firstHourly.get(day);
    if (!record) {
      if (first) plan.noDaily.push(day);
    } else if (!first) plan.noHourly.push(day);
    else if (isDeepStrictEqual(record.prices, first.prices)) plan.unchanged.push(day);
    else plan.rewrite.push({ daily: record, first });
  }
  return plan;
}

export function describeChange({ daily, first }: Plan["rewrite"][number]) {
  const keys = new Set([...Object.keys(daily.prices), ...Object.keys(first.prices)]);
  const changed = [...keys].filter((key) => !isDeepStrictEqual(daily.prices[key], first.prices[key]));
  let largest = "";
  let largestRatio = 0;
  for (const key of changed) {
    const from = Number(daily.prices[key]);
    const to = Number(first.prices[key]);
    const ratio = Math.abs(from - to) / (Math.abs(to) || 1);
    if (ratio > largestRatio) {
      largestRatio = ratio;
      largest = `, largest ${key} ${from} -> ${to} (${(ratio * 100).toFixed(2)}%)`;
    }
  }
  return `${changed.length} prices differ${largest}`;
}

const isoDay = (day: number) => new Date(day * 1000).toISOString().slice(0, 10);
const parseDay = (text: string) => {
  const day = Date.parse(`${text}T00:00:00Z`) / 1000;
  if (!Number.isFinite(day)) throw new Error(`not a date: ${text}`);
  return day;
};

async function queryAll(params: any) {
  const items: any[] = [];
  let ExclusiveStartKey: any;
  do {
    const result = await dynamodb.query({ ...params, ExclusiveStartKey });
    items.push(...(result.Items ?? []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

async function main() {
  const args = process.argv.slice(2);
  const option = (name: string) => {
    const i = args.indexOf(name);
    return i === -1 ? undefined : args[i + 1];
  };

  const restoreFile = option("--restore");
  if (restoreFile) {
    const records: PriceRecord[] = JSON.parse(fs.readFileSync(restoreFile, "utf8"));
    if (records.some((record) => record.PK !== dailyPeggedPrices)) throw new Error("backup holds non daily price records");
    for (const record of records) await dynamodb.put(record);
    console.log(`restored ${records.length} daily price records from ${restoreFile}, now run STABLECOINS_CACHE_RESET_PRICES=true pnpm run api2-cron-task`);
    return;
  }

  const from = parseDay(option("--from") ?? "2024-06-10");
  const to = parseDay(option("--to") ?? isoDay(Math.floor(Date.now() / 1000)));
  const days: number[] = [];
  for (let day = from; day <= to; day += secondsInDay) days.push(day);

  const dailyRecords = await queryAll({
    KeyConditionExpression: "PK = :pk AND SK BETWEEN :from AND :to",
    ExpressionAttributeValues: { ":pk": dailyPeggedPrices, ":from": from, ":to": to + secondsInDay - 1 },
  });
  // days are UTC midnights, any other key would be skipped silently
  const offGrid = dailyRecords.filter((record) => record.SK % secondsInDay !== 0);
  if (offGrid.length) throw new Error(`daily records not at a UTC midnight: ${offGrid.map((r) => r.SK).join(", ")}`);
  const daily = new Map<number, PriceRecord>(dailyRecords.map((record) => [record.SK, record]));

  const firstHourly = new Map<number, PriceRecord>();
  for (const day of days) {
    const result = await dynamodb.query({
      KeyConditionExpression: "PK = :pk AND SK BETWEEN :start AND :end",
      ExpressionAttributeValues: { ":pk": hourlyPeggedPrices, ":start": day, ":end": day + secondsInDay - 1 },
      Limit: 1,
    });
    if (result.Items?.[0]) firstHourly.set(day, result.Items[0] as PriceRecord);
  }

  const plan = planRebuild(days, daily, firstHourly);
  for (const change of plan.rewrite) console.log(`${isoDay(change.daily.SK)} rewrite: ${describeChange(change)}`);
  if (plan.noHourly.length) console.log(`kept, no hourly reading: ${plan.noHourly.map(isoDay).join(", ")}`);
  if (plan.noDaily.length) console.log(`no daily record, left missing: ${plan.noDaily.map(isoDay).join(", ")}`);
  console.log(`${isoDay(from)} to ${isoDay(to)}: ${plan.rewrite.length} to rewrite, ${plan.unchanged.length} already first of day, ${plan.noHourly.length} without hourly readings, ${plan.noDaily.length} without a daily record`);

  if (!args.includes("--write")) {
    console.log("dry run, pass --write to apply");
    return;
  }
  if (!plan.rewrite.length) return;
  const backupFile = `rebuildDailyPeggedPrices-backup-${Date.now()}.json`;
  fs.writeFileSync(backupFile, JSON.stringify(plan.rewrite.map((change) => change.daily)));
  console.log(`saved the ${plan.rewrite.length} records being replaced to ${backupFile}`);
  for (const { daily: record, first } of plan.rewrite) await dynamodb.put({ ...record, prices: first.prices });
  console.log(`rewrote ${plan.rewrite.length} daily price records, now run STABLECOINS_CACHE_RESET_PRICES=true pnpm run api2-cron-task`);
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (e) => {
      console.error(e);
      process.exit(1);
    },
  );
}
