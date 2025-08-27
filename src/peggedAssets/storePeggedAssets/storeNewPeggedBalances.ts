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

type PKconverted = (id: string) => string;

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
  if (Object.keys(peggedBalances).length === 0) {
    return;
  }
  // In DRY mode, avoid DynamoDB calls and error checks
  let lastHourlyPeggedObject: any;
  let lastHourlyCirculating = 0;
  let currentCirculating = peggedBalances.totalCirculating.circulating[pegType] ?? 0;
  
  if (process.env.DRY_RUN_MODE !== 'true') {
    // Normal mode: perform checks and DynamoDB calls
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
    // DRY mode: use default values
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

  if (extrapolationMetadata && extrapolationMetadata.extrapolated) {
    itemToStore.extrapolated = extrapolationMetadata.extrapolated;
    itemToStore.extrapolatedChains = extrapolationMetadata.extrapolatedChains;
    itemToStore.extrapolatedChainsCount = extrapolationMetadata.extrapolatedChains?.length || 0;
  }

  // DEBUG LOCK: If DRY_RUN_MODE is enabled, store locally instead of pushing to DB
  if (process.env.DRY_RUN_MODE === 'true') {
    const outputDir = './dry-run-output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    
    // Save hourly object
    const hourlyFile = path.join(outputDir, `debug-${peggedAsset.gecko_id}-hourly-${timestamp}.json`);
    fs.writeFileSync(hourlyFile, JSON.stringify(itemToStore, null, 2));
    
    // Save daily object
    const dailyItemToStore: any = {
      PK: dailyPeggedBalances(peggedAsset.id),
      SK: getTimestampAtStartOfDay(unixTimestamp),
      ...peggedBalances,
    };

    if (extrapolationMetadata && extrapolationMetadata.extrapolated) {
      dailyItemToStore.extrapolated = extrapolationMetadata.extrapolated;
      dailyItemToStore.extrapolatedChains = extrapolationMetadata.extrapolatedChains;
      dailyItemToStore.extrapolatedChainsCount = extrapolationMetadata.extrapolatedChains?.length || 0;
    }
    
    const dailyFile = path.join(outputDir, `debug-${peggedAsset.gecko_id}-daily-${timestamp}.json`);
    fs.writeFileSync(dailyFile, JSON.stringify(dailyItemToStore, null, 2));
    
    console.log(`🔒 DEBUG: ${peggedAsset.name} - Hourly: ${hourlyFile}, Daily: ${dailyFile}`);
    return; // Exit without pushing to DB
  }

  // Normal DB storage
  await dynamodb.put(itemToStore);

  const closestDailyRecord = await getTVLOfRecordClosestToTimestamp(
    dailyPeggedBalances(peggedAsset.id),
    unixTimestamp,
    secondsInDay * 1.5
  );
  if (getDay(closestDailyRecord?.SK) !== getDay(unixTimestamp)) {
    // First write of the day
    const dailyItemToStore: any = {
      PK: dailyPeggedBalances(peggedAsset.id),
      SK: getTimestampAtStartOfDay(unixTimestamp),
      ...peggedBalances,
    };

    if (extrapolationMetadata && extrapolationMetadata.extrapolated) {
      dailyItemToStore.extrapolated = extrapolationMetadata.extrapolated;
      dailyItemToStore.extrapolatedChains = extrapolationMetadata.extrapolatedChains;
      dailyItemToStore.extrapolatedChainsCount = extrapolationMetadata.extrapolatedChains?.length || 0;
    }

    // In DRY mode, daily is already saved, no need to do it here
    if (process.env.DRY_RUN_MODE !== 'true') {
      await dynamodb.put(dailyItemToStore);
    }
  }
};
