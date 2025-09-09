import peggedAssets from "./peggedData/peggedData";
import { getCurrentUnixTimestamp } from "./utils/date";
import { sendMessage } from "./utils/discord";
import { getLastRecord } from "./utils/getLastRecord";
import { wrapScheduledLambda } from "./utils/shared/wrap";

function formatUSD(amount: number): string {
  if (amount >= 1e12) {
    return `$${(amount / 1e12).toFixed(1)}T`;
  } else if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(1)}B`;
  } else if (amount >= 1e6) {
    return `$${(amount / 1e6).toFixed(1)}M`;
  } else if (amount >= 1e3) {
    return `$${(amount / 1e3).toFixed(1)}K`;
  } else {
    return `$${amount.toFixed(1)}`;
  }
}

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
            
            const totalCirculating = last.totalCirculating;
            if (!totalCirculating || !totalCirculating.circulating) return null;
            
            // Only consider the circulating amount for the specific pegType of this asset
            const circulatingAmount = totalCirculating.circulating[asset.pegType];
            if (!circulatingAmount || typeof circulatingAmount !== 'number' || circulatingAmount <= 0) return null;
            
            if (circulatingAmount < HIGH_VALUE_THRESHOLD) return null;
            
            const hoursAgo = (now - last.SK) / 3600;
            
            return {
              name: asset.name,
              hoursAgo: hoursAgo,
              totalCirculatingUSD: circulatingAmount,
              lastUpdateTimestamp: last.SK
            };
          } catch (error) {
            console.error(`Error checking ${asset.name}:`, error);
            return null;
          }
        })
    )
  ).filter((a) => a !== null);
  
  console.log(`📊 Found ${outdatedHighValue.length} high-value stablecoins (>${formatUSD(HIGH_VALUE_THRESHOLD)}) that are outdated`);
  
  if (outdatedHighValue.length > 0) {
    const message = `🚨 ${outdatedHighValue.length} high-value stablecoins (>${formatUSD(HIGH_VALUE_THRESHOLD)}) failed to update in 4+ hours:\n` +
      outdatedHighValue
        .map((a) => `• ${a.name}: ${a.hoursAgo.toFixed(1)}h ago, was ${formatUSD(a.totalCirculatingUSD)}`)
        .join("\n");
    
    await sendMessage(message, process.env.OUTDATED_WEBHOOK!);
    console.log('🚨 Alert sent to Discord webhook');
  }
}

const handler = async () => {
  await alertOutdated();
};

export default wrapScheduledLambda(handler);