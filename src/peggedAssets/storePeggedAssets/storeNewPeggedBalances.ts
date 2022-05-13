import dynamodb from "../../utils/shared/dynamodb";
import { PeggedAsset } from "../../protocols/peggedData";
import {
  HOUR,
  getDay,
  getTimestampAtStartOfDay,
  secondsInDay,
} from "../../utils/date";
import { PeggedAssetIssuance } from "../../types";
import getTVLOfRecordClosestToTimestamp from "../../utils/shared/getRecordClosestToTimestamp";
import { reportError } from "../../utils/error";
import { getLastRecord } from "../utils/getLastRecord";
import { humanizeNumber } from "@defillama/sdk/build/computeTVL/humanizeNumber";

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
      Math.abs(lastHourlyPeggedObject.SK - unixTimestamp) < 5 * HOUR &&
      lastHourlyCirculating * 5 < currentCirculating
    ) {
      throw new Error(
        `Pegged circulating for ${peggedAsset.name} has 5x (${change}) within one hour, disabling it`
      );
    } else {
      reportError(
        `Pegged circulating for ${peggedAsset.name} has >2x (${change})`,
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
        reportError(
          `Pegged circulating has dropped to 0 on chain "${chain}" (previous circulating was ${prevCirculating})`,
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
