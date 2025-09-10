import { humanizeNumber } from "@defillama/sdk/build/computeTVL/humanizeNumber";
import * as fs from 'fs';
import * as path from 'path';
import { PeggedAsset } from "../../peggedData/peggedData";
import { PeggedAssetIssuance } from "../../types";
import {
  HOUR,
  getDay,
  getTimestampAtStartOfDay,
  secondsInDay,
} from "../../utils/date";
import { sendMessage } from "../../utils/discord";
import dynamodb from "../../utils/shared/dynamodb";
import getTVLOfRecordClosestToTimestamp from "../../utils/shared/getRecordClosestToTimestamp";
import { getLastRecord } from "../utils/getLastRecord";
import { executeAndIgnoreErrors } from "./errorDb";
import { reconcileDailyFromHourly } from "./reconcileDailyFromHourly";

type PKconverted = (id: string) => string;

function logPromote(peggedAsset: PeggedAsset, daySK: number, reason: string, isReplacement?: boolean) {
  const iso = new Date(daySK * 1000).toISOString().slice(0, 10);
  console.log(`✅ [${peggedAsset.name}|id=${peggedAsset.id}] Daily promoted from hourly for ${iso} – ${reason}`);
  
  if (isReplacement) {
    const alertMessage = `🔄 **Daily Promotion Alert**\n` +
      `**Asset:** ${peggedAsset.name} (${peggedAsset.id})\n` +
      `**Date:** ${iso}\n` +
      `**Reason:** ${reason}\n` +
      `**Type:** Replacing existing daily with hourly data`;
    
    sendMessage(alertMessage, process.env.OUTDATED_WEBHOOK!).catch(error => {
      console.error('Error sending promotion alert:', error);
    });
  }
}

async function checkAndReplaceDailyWithHourly(
  peggedAsset: PeggedAsset,
  unixTimestamp: number,
  currentHourlyData: any,
  dailyPeggedBalances: PKconverted,
  isDryRun: boolean = false,
  existingDailyOverride?: any
): Promise<{
  wasPromoted: boolean;
  preview?: { Key: { PK: string; SK: number }; Item?: any };
  reason?: string;
  isReplacement?: boolean;
}> {
  try {
    const result = await reconcileDailyFromHourly(
      currentHourlyData,
      dailyPeggedBalances,
      peggedAsset.id,
      { dryRun: isDryRun, existingDailyOverride }
    );

    if (result.action === "PROMOTE") {
      const daySK = getTimestampAtStartOfDay(unixTimestamp);
      logPromote(peggedAsset, daySK, result.reason, result.isReplacement);
      return { wasPromoted: true, preview: (result as any).preview, reason: result.reason, isReplacement: result.isReplacement };
    }
    return { wasPromoted: false, reason: result.reason };
  } catch (error) {
    console.error(`❌ Reconciliation error for ${peggedAsset.name}:`, error);
    return { wasPromoted: false };
  }
}

export default async (
  peggedAsset: PeggedAsset,
  unixTimestamp: number,
  peggedBalances: PeggedAssetIssuance,
  hourlyPeggedBalances: PKconverted,
  dailyPeggedBalances: PKconverted,
  extrapolationMetadata?: { extrapolated: boolean; extrapolatedChains: Array<{ chain: string; timestamp: number }> }
) => {
  const hourlyPK = hourlyPeggedBalances(peggedAsset.id);
  const pegType = peggedAsset.pegType;
  const peggedID = peggedAsset.gecko_id;
  const isDryRun = process.env.DRY_RUN_MODE === 'true';
  const daySK = getTimestampAtStartOfDay(unixTimestamp);

  if (Object.keys(peggedBalances).length === 0) {
    return;
  }

  // In DRY mode, avoid DynamoDB calls and heavy checks
  let lastHourlyPeggedObject: any;
  let lastHourlyCirculating = 0;
  const currentCirculating = peggedBalances.totalCirculating.circulating[pegType] ?? 0;

  if (!isDryRun) {
    const lastHourlyPeggedRecord = getLastRecord(hourlyPK).then(
      (result) =>
        result ?? {
          SK: undefined,
          totalCirculating: {
            circulating: {
              [pegType]: 0,
            },
          },
        }
    );
    lastHourlyPeggedObject = await lastHourlyPeggedRecord;
    lastHourlyCirculating = lastHourlyPeggedObject.totalCirculating.circulating[pegType];

    if (
      lastHourlyCirculating * 2 < currentCirculating &&
      lastHourlyCirculating !== 0
    ) {
      const change = `${humanizeNumber(
        lastHourlyCirculating
      )} to ${humanizeNumber(currentCirculating)}`;
      if (
        Math.abs(lastHourlyPeggedObject.SK - unixTimestamp) < 12 * HOUR &&
        lastHourlyCirculating * 5 < currentCirculating &&
        lastHourlyCirculating > 1000000
      ) {
        await executeAndIgnoreErrors("INSERT INTO `errors` VALUES (?, ?, ?)", [
          unixTimestamp,
          peggedID,
          `Circulating has 5x (${change}) within one hour, disabling it`,
        ]);
        const errorMessage = `Circulating for ${peggedAsset.name} has 5x (${change}) within one hour, disabling it`;
        await sendMessage(errorMessage, process.env.OUTDATED_WEBHOOK!);
        throw new Error(errorMessage);
      } else {
        await executeAndIgnoreErrors("INSERT INTO `errors` VALUES (?, ?, ?)", [
          unixTimestamp,
          peggedID,
          `Circulating has >2x (${change}) within one hour`,
        ]);
        console.error(
          `Circulating for ${peggedAsset.name} has >2x (${change}) within one hour`,
          peggedAsset.name
        );
      }
    }
    if (
      lastHourlyCirculating / 2 > currentCirculating &&
      currentCirculating !== 0 &&
      Math.abs(lastHourlyPeggedObject.SK - unixTimestamp) < 12 * HOUR
    ) {
      const errorMessage = `Circulating for ${peggedAsset.name} has dropped >50% within one hour, disabling it`;
      await sendMessage(errorMessage, process.env.OUTDATED_WEBHOOK!);
      throw new Error(errorMessage);
    }
    await Promise.all(
      Object.entries(peggedBalances).map(async ([chain, issuance]) => {
        const prevCirculating = lastHourlyPeggedObject[chain]
          ? lastHourlyPeggedObject[chain].circulating[pegType]
          : 0;
        if (
          issuance.circulating[pegType] === 0 &&
          prevCirculating !== 0 &&
          prevCirculating !== undefined
        ) {
          await executeAndIgnoreErrors("INSERT INTO `errors` VALUES (?, ?, ?)", [
            unixTimestamp,
            peggedID,
            `Circulating has dropped to 0 on chain "${chain}" (previous circulating was ${prevCirculating})`,
          ]);
          console.error(
            `Circulating has dropped to 0 on chain "${chain}" (previous circulating was ${prevCirculating})`,
            peggedAsset.name
          );
        }
      })
    );
  } else {
    // DRY mode: default baseline
    lastHourlyPeggedObject = {
      SK: undefined,
      totalCirculating: {
        circulating: { [pegType]: 0 },
      },
    };
  }

  const itemToStore: any = {
    PK: hourlyPK,
    SK: unixTimestamp,
    ...peggedBalances,
  };

  if (extrapolationMetadata?.extrapolated) {
    itemToStore.extrapolated = true;
    itemToStore.extrapolatedChains = extrapolationMetadata.extrapolatedChains;
    itemToStore.extrapolatedChainsCount = extrapolationMetadata.extrapolatedChains?.length || 0;
  }

  if (isDryRun) {
    const outputDir = './dry-run-output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const hourlyFile = path.join(outputDir, `debug-${peggedAsset.gecko_id}-hourly-${unixTimestamp}.json`);
    fs.writeFileSync(hourlyFile, JSON.stringify(itemToStore, null, 2));

    const dailyFile = path.join(outputDir, `debug-${peggedAsset.gecko_id}-daily-${daySK}.json`);
    let existingDailyOverride: any | undefined = undefined;
    if (fs.existsSync(dailyFile)) {
      try {
        existingDailyOverride = JSON.parse(fs.readFileSync(dailyFile, "utf8"));
      } catch {
        existingDailyOverride = undefined;
      }
    }

    const recon = await checkAndReplaceDailyWithHourly(
      peggedAsset,
      unixTimestamp,
      itemToStore,
      dailyPeggedBalances,
      true,
      existingDailyOverride
    );

    if (recon.wasPromoted && recon.preview?.Item) {
      fs.writeFileSync(dailyFile, JSON.stringify(recon.preview.Item, null, 2));
    }

    return;
  }

  await dynamodb.put(itemToStore);

  const { wasPromoted } = await checkAndReplaceDailyWithHourly(
    peggedAsset,
    unixTimestamp,
    itemToStore,
    dailyPeggedBalances,
    false
  );

  const closestDailyRecord = await getTVLOfRecordClosestToTimestamp(
    dailyPeggedBalances(peggedAsset.id),
    unixTimestamp,
    secondsInDay * 1.5
  );

  if (!wasPromoted && getDay(closestDailyRecord?.SK) !== getDay(unixTimestamp)) {
    const dailyItemToStore: any = {
      PK: dailyPeggedBalances(peggedAsset.id),
      SK: daySK,
      ...peggedBalances,
    };

    if (extrapolationMetadata?.extrapolated) {
      dailyItemToStore.extrapolated = true;
      dailyItemToStore.extrapolatedChains = extrapolationMetadata.extrapolatedChains;
      dailyItemToStore.extrapolatedChainsCount = extrapolationMetadata.extrapolatedChains?.length || 0;
    }

    await dynamodb.put(dailyItemToStore);
  }
};
