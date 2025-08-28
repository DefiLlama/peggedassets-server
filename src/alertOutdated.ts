import peggedAssets from "./peggedData/peggedData";
import { getCurrentUnixTimestamp } from "./utils/date";
import { sendMessage } from "./utils/discord";
import { getLastRecord } from "./utils/getLastRecord";
import { wrapScheduledLambda } from "./utils/shared/wrap";

export async function alertOutdated() {
  const now = getCurrentUnixTimestamp();
  const fourHoursAgo = now - 4 * 3600;
  
  // Threshold for high-value stablecoins
  const HIGH_VALUE_THRESHOLD = 100_000_000; // $100M USD
  
  const ignoredStablecoins = new Set(['TerraClassicUSD']);
  
  console.log(`🔍 Checking ${peggedAssets.length} stablecoins for outdated updates...`);
  
  // Check DynamoDB for each stablecoin
  const outdatedHighValue = (
    await Promise.all(
      peggedAssets
        .filter(asset => !asset.delisted && !ignoredStablecoins.has(asset.name))
        .map(async (asset) => {
          try {
            const last = await getLastRecord(`hourlyPeggedBalances#${asset.id}`);
            
            if (!last || !last.SK) return null;
            
            if (last.SK >= fourHoursAgo) return null;
            
            const circulating = last.circulating;
            if (!circulating) return null;
            

            let totalCirculatingUSD = 0;
            
            for (const [_pegType, amount] of Object.entries(circulating)) {
              if (typeof amount === 'number' && amount > 0) {
                totalCirculatingUSD += amount;
              }
            }
            
            if (totalCirculatingUSD < HIGH_VALUE_THRESHOLD) return null;
            
            const hoursAgo = (now - last.SK) / 3600;
            
            return {
              name: asset.name,
              hoursAgo: hoursAgo,
              totalCirculatingUSD: totalCirculatingUSD,
              lastUpdateTimestamp: last.SK
            };
          } catch (error) {
            console.error(`Error checking ${asset.name}:`, error);
            return null;
          }
        })
    )
  ).filter((a) => a !== null);
  
  console.log(`📊 Found ${outdatedHighValue.length} high-value stablecoins (>$${(HIGH_VALUE_THRESHOLD/1e6).toFixed(0)}M) that are outdated`);
  
  if (outdatedHighValue.length > 0) {
    const message = `🚨 ${outdatedHighValue.length} high-value stablecoins (>$${(HIGH_VALUE_THRESHOLD/1e6).toFixed(0)}M) failed to update in 4+ hours:\n` +
      outdatedHighValue
        .map((a) => `• ${a.name}: ${a.hoursAgo.toFixed(1)}h ago, was $${(a.totalCirculatingUSD/1e6).toFixed(1)}M USD`)
        .join("\n");
    
    await sendMessage(message, process.env.OUTDATED_WEBHOOK!);
  }
}

const handler = async () => {
  await alertOutdated();
};

export default wrapScheduledLambda(handler);