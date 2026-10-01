import { secondsInHour } from "../../src/utils/date";

// Display the latest hourly reading for the current day without replacing the
// canonical daily record or changing the timestamp of the hourly record.
export function getEffectiveDailyHistory<T extends { SK: number }>(history: T[], latest?: T): T[] {
  if (!history.length || !latest) return history;

  const last = history[history.length - 1];
  if (latest.SK <= last.SK || last.SK + secondsInHour * 25 <= latest.SK) return history;

  const response = history.slice();
  response[response.length - 1] = { ...latest, SK: last.SK };
  return response;
}
