import { wrapScheduledLambda } from "./utils/shared/wrap";
import peggedAssets from "./peggedData/peggedData";
import { getLastRecord } from "./utils/getLastRecord";
import { getCurrentUnixTimestamp } from "./utils/date";
import { sendMessage } from "./utils/discord";

const handler = async () => {
  const now = getCurrentUnixTimestamp();
  const outdated = (
    await Promise.all(
      peggedAssets.map(async (asset) => {
        const last = await getLastRecord(`hourlyPeggedBalances#${asset.id}`);
        if (last?.SK < now - 5 * 3600) {
          return {
            name: asset.name,
            hoursAgo: (now - last?.SK) / 3600,
          };
        }
        return null;
      })
    )
  ).filter((a) => a !== null);
  if (outdated.length > 0) {
    await sendMessage(
      outdated
        .map((a) => `[stablecoin - alert outdated] ${a!.name} - ${a!.hoursAgo.toFixed(2)} hours ago`)
        .join("\n"),
      process.env.OUTDATED_WEBHOOK!
    );
  }
};

export default wrapScheduledLambda(handler);
