import { humanizeNumber } from "@defillama/sdk/build/computeTVL/humanizeNumber";
import * as fs from 'fs';
import * as path from 'path';
import { PeggedAsset } from "../../peggedData/peggedData";
import { PeggedAssetIssuance } from "../../types";
import {
  HOUR,
  getCurrentUnixTimestamp,
  getDay,
  getTimestampAtStartOfDay,
  secondsInDay,
} from "../../utils/date";
import { sendMessage } from "../../utils/discord";
import dynamodb from "../../utils/shared/dynamodb";
import getTVLOfRecordClosestToTimestamp from "../../utils/shared/getRecordClosestToTimestamp";
import { getLastRecord } from "../utils/getLastRecord";
import {
  createBlock,
  getActiveBlock,
  getRemainingBlockTime,
  removeBlock
} from "./assetBlocking";
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
    
    if (process.env.OUTDATED_WEBHOOK) {
      sendMessage(alertMessage, process.env.OUTDATED_WEBHOOK).catch(error => {
        console.error('Error sending promotion alert:', error);
      });
    }
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
  // FORCE_UPDATE should only be set by the CLI script forceUpdateAsset.ts
  let isForceUpdate = process.env.FORCE_UPDATE === 'true' && !process.env.AWS_LAMBDA_FUNCTION_NAME;
  const daySK = getTimestampAtStartOfDay(unixTimestamp);

  if (Object.keys(peggedBalances).length === 0) {
    return;
  }

  let lastHourlyPeggedObject: any;
  let lastHourlyCirculating = 0;
  const currentCirculating = peggedBalances.totalCirculating.circulating[pegType] ?? 0;

  const loadLastHourlyIfNeeded = async () => {
    if (isDryRun) {
      if (!lastHourlyPeggedObject) {
        lastHourlyPeggedObject = {
          SK: undefined,
          totalCirculating: {
            circulating: { [pegType]: 0 },
          },
        };
        lastHourlyCirculating = 0;
      }
      return;
    }
    if (!lastHourlyPeggedObject) {
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
      lastHourlyCirculating = lastHourlyPeggedObject.totalCirculating.circulating[pegType] ?? 0;
    } else {
      lastHourlyCirculating = lastHourlyPeggedObject.totalCirculating?.circulating?.[pegType] ?? 0;
    }
  };

  // Skip blocking checks in force update mode
  if (!isForceUpdate) {
    const activeBlock = await getActiveBlock(peggedAsset.id);
    if (activeBlock) {
      const blockExpiresAt = new Date(activeBlock.expiresAt * 1000).toISOString();
      const remainingTime = getRemainingBlockTime(activeBlock);
      const now = getCurrentUnixTimestamp();
      
      const timeSinceExpiration = now - activeBlock.expiresAt;
      const JUST_EXPIRED_THRESHOLD = 2 * HOUR;

      if (activeBlock.expiresAt <= now && timeSinceExpiration <= JUST_EXPIRED_THRESHOLD) {
        // Block just expired - automatically force update this asset once
        console.log(`🔄 [AUTO FORCE UPDATE] Block for ${peggedAsset.name} just expired - forcing update to reset baseline`);
        if (!isDryRun) {
          await removeBlock(peggedAsset.id);
        } else {
          console.log(`📢 [DRY RUN] Would remove expired block for ${peggedAsset.name}`);
        }
        isForceUpdate = true;
        console.log(`🔓 [AUTO FORCE UPDATE] Skipping spike/drop detection for this update`);
        
        if (process.env.OUTDATED_WEBHOOK) {
          const autoForceUpdateMessage = `🔄 **Auto Force Update**\n` +
            `**Asset:** ${peggedAsset.name} (${peggedAsset.id})\n` +
            `**Reason:** Block expired - automatically forcing update to reset baseline\n` +
            `**Previous Block Reason:** ${activeBlock.reason}\n` +
            `**Block Type:** ${activeBlock.blockType}\n` +
            `**Time Since Expiration:** ${(timeSinceExpiration / 60).toFixed(1)} minutes`;
          
          try {
            if (!isDryRun) {
              await sendMessage(autoForceUpdateMessage, process.env.OUTDATED_WEBHOOK);
            } else {
              console.log(`📢 [DRY RUN] Would send auto force-update notification:\n${autoForceUpdateMessage}`);
            }
          } catch (error) {
            console.error('Error sending auto force-update notification:', error);
          }
        }
      } else if (timeSinceExpiration > JUST_EXPIRED_THRESHOLD) {
        // Block expired a while ago -> clean it up
        if (!isDryRun) {
          await removeBlock(peggedAsset.id);
          console.log(`🧹 [BLOCK CLEANUP] Removed expired block for ${peggedAsset.name} (expired more than ${(JUST_EXPIRED_THRESHOLD / HOUR)} hours ago)`);
        } else {
          console.log(`📢 [DRY RUN] Would clean up expired block for ${peggedAsset.name}`);
        }
      } else if (activeBlock.expiresAt > now) {
        if (!isDryRun) {
          await loadLastHourlyIfNeeded();
          const baselineCirculating = lastHourlyPeggedObject.totalCirculating?.circulating?.[pegType] ?? 0;

          const spikeStillThere =
            baselineCirculating * 2 < currentCirculating && baselineCirculating !== 0;
          const dropStillThere =
            baselineCirculating / 2 > currentCirculating && currentCirculating !== 0;

          if (!spikeStillThere && !dropStillThere) {
            await removeBlock(peggedAsset.id);
            console.log(`✅ [UNBLOCK] Metrics normalized for ${peggedAsset.name}, block removed (was: ${activeBlock.reason})`);

            if (process.env.OUTDATED_WEBHOOK) {
              const unblockMessage = `✅ **Asset Unblocked**\n` +
                `**Asset:** ${peggedAsset.name} (${peggedAsset.id})\n` +
                `**Reason:** Metrics normalized (previous block: ${activeBlock.reason})\n` +
                `**Block Type:** ${activeBlock.blockType}\n` +
                `**Was Expiring At:** ${blockExpiresAt}`;
              try {
                await sendMessage(unblockMessage, process.env.OUTDATED_WEBHOOK);
              } catch (error) {
                console.error('Error sending unblock notification:', error);
              }
            }
          } else {
            const warningMessage = `⚠️ [${peggedAsset.name}|id=${peggedAsset.id}] Update blocked until ${blockExpiresAt}. Reason: ${activeBlock.reason}`;
            console.warn(warningMessage);
            
            if (process.env.OUTDATED_WEBHOOK) {
              const blockNotification = `🚫 **Asset Blocked**\n` +
                `**Asset:** ${peggedAsset.name} (${peggedAsset.id})\n` +
                `**Reason:** ${activeBlock.reason}\n` +
                `**Time Remaining:** ${remainingTime}\n` +
                `**Expires At:** ${blockExpiresAt}`;
              
              sendMessage(blockNotification, process.env.OUTDATED_WEBHOOK!).catch(error => {
                console.error('Error sending block notification:', error);
              });
            }
            
            return;
          }
        } else {
          const warningMessage = `⚠️ [${peggedAsset.name}|id=${peggedAsset.id}] (DRY RUN) Update would be blocked until ${blockExpiresAt}. Reason: ${activeBlock.reason}`;
          console.warn(warningMessage);
          return;
        }
      }
    }
  } else {
    console.log(`🔓 [FORCE UPDATE] Skipping blocking checks for ${peggedAsset.name}`);
  }

  if (!isDryRun) {
    await loadLastHourlyIfNeeded();

    // Skip spike/drop detection in force update mode
    if (!isForceUpdate) {
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
          const errorMessage = `Circulating for ${peggedAsset.name} has 5x (${change}) within one hour`;
          if (process.env.OUTDATED_WEBHOOK) {
            try {
              await sendMessage(errorMessage, process.env.OUTDATED_WEBHOOK);
            } catch (error) {
              console.error('Error sending Discord message:', error);
            }
          }
          
          const block = await createBlock(peggedAsset.id, `5x spike detected: ${change}`, "spike");
          console.warn(`🚫 Blocked ${peggedAsset.name} until ${new Date(block.expiresAt * 1000).toISOString()}`);
          return;
        } else {
          console.error(`Circulating for ${peggedAsset.name} has >2x (${change}) within one hour`, peggedAsset.name);
        }
      }
      
      if (
        lastHourlyCirculating / 2 > currentCirculating &&
        currentCirculating !== 0 &&
        Math.abs(lastHourlyPeggedObject.SK - unixTimestamp) < 12 * HOUR
      ) {
        const change = `${humanizeNumber(lastHourlyCirculating)} to ${humanizeNumber(currentCirculating)}`;
        const errorMessage = `Circulating for ${peggedAsset.name} has dropped >50% within one hour (${change})`;
        if (process.env.OUTDATED_WEBHOOK) {
          try {
            await sendMessage(errorMessage, process.env.OUTDATED_WEBHOOK);
          } catch (error) {
            console.error('Error sending Discord message:', error);
          }
        }
        
        const block = await createBlock(peggedAsset.id, `>50% drop detected: ${change}`, "drop");
        console.warn(`🚫 Blocked ${peggedAsset.name} until ${new Date(block.expiresAt * 1000).toISOString()}`);
        return;
      }
    } else {
      // In force update mode, log the change but don't block
      if (
        lastHourlyCirculating * 2 < currentCirculating &&
        lastHourlyCirculating !== 0
      ) {
        const change = `${humanizeNumber(lastHourlyCirculating)} to ${humanizeNumber(currentCirculating)}`;
        console.log(`⚠️ [FORCE UPDATE] Detected spike for ${peggedAsset.name} (${change}) - proceeding anyway`);
      }
      if (
        lastHourlyCirculating / 2 > currentCirculating &&
        currentCirculating !== 0
      ) {
        const change = `${humanizeNumber(lastHourlyCirculating)} to ${humanizeNumber(currentCirculating)}`;
        console.log(`⚠️ [FORCE UPDATE] Detected drop for ${peggedAsset.name} (${change}) - proceeding anyway`);
      }
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
    lastHourlyCirculating = 0;
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

    const hourlyFile = path.join(outputDir, `debug-${peggedID}-hourly-${unixTimestamp}.json`);
    fs.writeFileSync(hourlyFile, JSON.stringify(itemToStore, null, 2));

    const dailyFile = path.join(outputDir, `debug-${peggedID}-daily-${daySK}.json`);
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

