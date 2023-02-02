import dynamodb from "../../utils/shared/dynamodb";
import { PeggedAsset } from "../../peggedData/peggedData";
import {
  HOUR,
  getDay,
  getTimestampAtStartOfDay,
  secondsInDay,
} from "../../utils/date";
import { PeggedAssetIssuance } from "../../types";
import getTVLOfRecordClosestToTimestamp from "../../utils/shared/getRecordClosestToTimestamp";
import { getLastRecord } from "../utils/getLastRecord";
import { humanizeNumber } from "@defillama/sdk/build/computeTVL/humanizeNumber";
import { executeAndIgnoreErrors } from "./errorDb";

type PKconverted = (id: string) => string;

export default async (
  peggedAsset: PeggedAsset,
  unixTimestamp: number,
  peggedBalances: PeggedAssetIssuance,
  hourlyPeggedBalances: PKconverted,
  dailyPeggedBalances: PKconverted
) => {
  const hourlyPK = hourlyPeggedBalances(peggedAsset.id);
  const pegType = peggedAsset.pegType;
  const peggedID = peggedAsset.gecko_id;
  if (Object.keys(peggedBalances).length === 0) {
    return;
  }
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
  const lastHourlyPeggedObject = await lastHourlyPeggedRecord;
  const lastHourlyCirculating =
    lastHourlyPeggedObject.totalCirculating.circulating[pegType];
  const currentCirculating =
    peggedBalances.totalCirculating.circulating[pegType] ?? 0;
  if (
    lastHourlyCirculating * 2 < currentCirculating &&
    lastHourlyCirculating !== 0
  ) {
    const change = `${humanizeNumber(
      lastHourlyCirculating
    )} to ${humanizeNumber(currentCirculating)}`;
    if (
      Math.abs(lastHourlyPeggedObject.SK - unixTimestamp) < 24 * HOUR &&
      lastHourlyCirculating * 5 < currentCirculating &&
      lastHourlyCirculating > 1000000
    ) {
      await executeAndIgnoreErrors("INSERT INTO `errors` VALUES (?, ?, ?)", [
        unixTimestamp,
        peggedID,
        `Circulating has 5x (${change}) within one hour, disabling it`,
      ]);
      throw new Error(
        `Circulating for ${peggedAsset.name} has 5x (${change}) within one hour, disabling it`
      );
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

  await dynamodb.put({
    PK: hourlyPK,
    SK: unixTimestamp,
    ...peggedBalances,
  });

  const closestDailyRecord = await getTVLOfRecordClosestToTimestamp(
    dailyPeggedBalances(peggedAsset.id),
    unixTimestamp,
    secondsInDay * 1.5
  );
  if (getDay(closestDailyRecord?.SK) !== getDay(unixTimestamp)) {
    // First write of the day
    await dynamodb.put({
      PK: dailyPeggedBalances(peggedAsset.id),
      SK: getTimestampAtStartOfDay(unixTimestamp),
      ...peggedBalances,
    });
  }
};
