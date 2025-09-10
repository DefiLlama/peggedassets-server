import { getTimestampAtStartOfDay } from "../../utils/date";
import dynamodb from "../../utils/shared/dynamodb";

type Amounts = Record<string, number | null>;
type AnyRecord = Record<string, unknown>;

type PeggedDoc = {
  PK: string;
  SK: number;
  extrapolated?: boolean;
  extrapolatedChains?: Array<{ chain: string; timestamp: number }>;
  extrapolatedChainsCount?: number;
  totalCirculating?: { circulating: Amounts; unreleased: Amounts };
} & AnyRecord;

type DailyKey = { PK: string; SK: number };

type PromoteResult = {
  action: "PROMOTE";
  reason: string;
  key?: DailyKey;
  preview?: { Key: DailyKey; Item: PeggedDoc };
  currentQuality?: number;
  incomingQuality?: number;
};

type SkipResult = {
  action: "SKIP";
  reason: string;
  preview?: { Key: DailyKey };
  currentQuality?: number;
  incomingQuality?: number;
};

type ReconcileResult = PromoteResult | SkipResult;

function completenessPenalty(doc?: PeggedDoc): number {
  if (!doc) return Number.POSITIVE_INFINITY;

  let bad = 0;
  for (const [k, v] of Object.entries(doc)) {
    if (
      k === "PK" ||
      k === "SK" ||
      k === "totalCirculating" ||
      k === "extrapolated" ||
      k === "extrapolatedChains" ||
      k === "extrapolatedChainsCount"
    ) continue;

    if (!v || typeof v !== "object") continue;
    const chain = v as Record<string, unknown>;

    for (const f of ["minted", "circulating", "unreleased", "bridgedTo"] as const) {
      const obj = chain[f] as unknown;
      if (!obj || typeof obj !== "object") continue;

      for (const [kk, vv] of Object.entries(obj as Record<string, unknown>)) {
        if (kk === "bridges") continue;
        if (vv === null) bad += 1;
        else if (typeof vv === "number" && vv === 0) bad += 1;
      }
    }
  }
  return bad;
}

function qualityScore(doc?: PeggedDoc): number {
  if (!doc) return Number.POSITIVE_INFINITY;
  const base =
    doc.extrapolated === true
      ? 1000 + (typeof doc.extrapolatedChainsCount === "number" ? doc.extrapolatedChainsCount : 999)
      : 0;
  const penalty = completenessPenalty(doc);
  return base + penalty / 1000;
}

function buildDailyFromHourly(hourly: PeggedDoc, daySK: number): PeggedDoc {
  const out: PeggedDoc = { ...hourly, SK: daySK };
  return out;
}

function shouldPromote(existingDaily: PeggedDoc | undefined, incomingHourly: PeggedDoc): boolean {
  if (!existingDaily) return true;

  const existingIsEx = existingDaily.extrapolated === true;
  const incomingIsEx = incomingHourly.extrapolated === true;

  const curPenalty = completenessPenalty(existingDaily);
  const incPenalty = completenessPenalty(incomingHourly);

  if (!existingIsEx && curPenalty === 0) return false;

  if (existingIsEx && !incomingIsEx) return true;

  if (existingIsEx && incomingIsEx) {
    const curCnt =
      typeof existingDaily.extrapolatedChainsCount === "number"
        ? existingDaily.extrapolatedChainsCount
        : Number.POSITIVE_INFINITY;
    const incCnt =
      typeof incomingHourly.extrapolatedChainsCount === "number"
        ? incomingHourly.extrapolatedChainsCount
        : Number.POSITIVE_INFINITY;

    if (incCnt < curCnt) return true;
    if (incCnt === curCnt && incPenalty < curPenalty) return true;
    return false;
  }

  if (!existingIsEx && !incomingIsEx) {
    if (curPenalty > 0 && incPenalty < curPenalty) return true;
    return false;
  }

  return false;
}

function explainDecision(existingDaily: PeggedDoc | undefined, incoming: PeggedDoc): string {
  if (!existingDaily) return "No existing daily → promote.";
  const curPen = completenessPenalty(existingDaily);
  const incPen = completenessPenalty(incoming);

  if (existingDaily.extrapolated !== true) {
    if (curPen === 0) return "Existing daily is clean & complete.";
    if (incoming.extrapolated === true) return "Existing daily is clean (but has gaps); incoming is extrapolated → keep.";
    if (incPen < curPen) return `Existing daily has gaps (${curPen}); hourly has fewer (${incPen}) → promote.`;
    return `Existing daily has gaps (${curPen}); hourly not better (${incPen}) → keep.`;
  }

  if (incoming.extrapolated !== true) return "Existing daily extrapolated; incoming hourly is clean → promote.";

  const cur = existingDaily.extrapolatedChainsCount ?? Infinity;
  const inc = incoming.extrapolatedChainsCount ?? Infinity;
  if (inc < cur) return `Hourly extrapolates fewer chains (${inc} < ${cur}) → promote.`;
  if (inc === cur && incPen < curPen) return `Same extrapolation breadth (${inc}); hourly has fewer gaps (${incPen} < ${curPen}) → promote.`;
  return `Hourly not better (chains ${inc} ≥ ${cur}; gaps ${incPen} ≥ ${curPen}).`;
}

export async function reconcileDailyFromHourly(
  incomingHourly: PeggedDoc,
  dailyPeggedBalances: (id: string) => string,
  peggedAssetId: string,
  opts?: {
    dryRun?: boolean;
    existingDailyOverride?: PeggedDoc;
  }
): Promise<ReconcileResult> {
  const daySK = getTimestampAtStartOfDay(incomingHourly.SK);
  const dailyPK = dailyPeggedBalances(peggedAssetId);
  const dailyKey: DailyKey = { PK: dailyPK, SK: daySK };

  let existingDaily: PeggedDoc | undefined;
  if (opts?.dryRun) {
    existingDaily = opts.existingDailyOverride;
  } else {
    existingDaily = await dynamodb
      .get(dailyKey)
      .then((r) => r.Item as PeggedDoc | undefined);
  }

  const promote = shouldPromote(existingDaily, incomingHourly);
  const reason = explainDecision(existingDaily, incomingHourly);

  const toWrite = promote ? buildDailyFromHourly(incomingHourly, daySK) : undefined;

  if (opts?.dryRun) {
    const previewItem = toWrite ? { ...toWrite, PK: dailyPK, SK: daySK } : undefined;
    return promote
      ? {
          action: "PROMOTE",
          reason,
          preview: { Key: dailyKey, Item: previewItem! },
          currentQuality: qualityScore(existingDaily),
          incomingQuality: qualityScore(incomingHourly),
        }
      : {
          action: "SKIP",
          reason,
          preview: { Key: dailyKey },
          currentQuality: qualityScore(existingDaily),
          incomingQuality: qualityScore(incomingHourly),
        };
  }

  if (!promote || !toWrite) {
    return { action: "SKIP", reason };
  }

  await dynamodb.put({
    ...toWrite,
    PK: dailyPK,
    SK: daySK,
  });

  return { action: "PROMOTE", reason, key: dailyKey };
}

if (require.main === module) {
  (async () => {
    const [, , hourlyPath, flag] = process.argv;
    if (!hourlyPath) {
      console.error("Usage: ts-node reconcileDailyFromHourly.ts /path/hourly.json [--dry]");
      process.exit(1);
    }
    const fs = await import("node:fs/promises");
    const hourly = JSON.parse(await fs.readFile(hourlyPath, "utf8")) as PeggedDoc;
    const dryRun = flag === "--dry" || flag === "--dry-run";
    const mockDailyPeggedBalances = (id: string) => `dailyPeggedBalances#${id}`;
    const res = await reconcileDailyFromHourly(hourly, mockDailyPeggedBalances, "test-asset", { dryRun });
    console.log(JSON.stringify(res, null, 2));
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
