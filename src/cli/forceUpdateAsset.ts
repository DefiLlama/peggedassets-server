import * as sdk from "@defillama/sdk";
import { alertOutdated } from "../alertOutdated";
import { removeBlock } from "../peggedAssets/storePeggedAssets/assetBlocking";
import storePeggedAssets from "./../peggedAssets/storePeggedAssets/storePegged";
import peggedAssets from "./../peggedData/peggedData";

const INTERNAL_CACHE_FILE = 'pegged-assets-cache/sdk-cache.json'

async function initializeSdkInternalCache() {
  let currentCache = await sdk.cache.readCache(INTERNAL_CACHE_FILE)
  sdk.log('cache size:', JSON.stringify(currentCache).length, 'chains:', Object.keys(currentCache))
  const ONE_MONTH = 60 * 60 * 24 * 30
  if (!currentCache || !currentCache.startTime || (Date.now() / 1000 - currentCache.startTime > ONE_MONTH)) {
    currentCache = {
      startTime: Math.round(Date.now() / 1000),
    }
    await sdk.cache.writeCache(INTERNAL_CACHE_FILE, currentCache)
  }
  sdk.sdkCache.startCache(currentCache)
}

async function saveSdkInternalCache() {
  await sdk.cache.writeCache(INTERNAL_CACHE_FILE, sdk.sdkCache.retriveCache())
}

const handler = async () => {
  const args = process.argv.slice(2);
  const identifier = args[0];
  
  if (!identifier) {
    console.error('❌ Usage: npm run force-update -- <asset-id|module|gecko-id>');
    console.error('   Examples:');
    console.error('     npm run force-update -- 217');
    console.error('     npm run force-update -- reservoir-stablecoin  (module)');
    console.error('     npm run force-update -- tether  (gecko_id)');
    process.exit(1);
  }

  const normalizedIdentifier = identifier.toLowerCase().replace(/\s+/g, '-');
  
  let assetIndex = peggedAssets.findIndex(asset => 
    asset.id === identifier || 
    (asset.module && asset.module === normalizedIdentifier) ||
    asset.gecko_id === normalizedIdentifier ||
    asset.name.toLowerCase().replace(/\s+/g, '-') === normalizedIdentifier
  );
  
  if (assetIndex === -1) {
    assetIndex = peggedAssets.findIndex(asset => 
      (asset.module && asset.module.includes(normalizedIdentifier)) ||
      asset.name.toLowerCase().includes(normalizedIdentifier) ||
      asset.gecko_id.includes(normalizedIdentifier)
    );
  }
  
  if (assetIndex === -1) {
    console.error(`❌ Asset "${identifier}" not found`);
    console.error(`   Try using:`);
    console.error(`   - ID: ${peggedAssets.slice(0, 5).map(a => a.id).join(', ')}...`);
    const withModule = peggedAssets.filter(a => a.module).slice(0, 3);
    if (withModule.length > 0) console.error(`   - module: ${withModule.map(a => a.module).join(', ')}...`);
    console.error(`   - gecko_id: ${peggedAssets.slice(0, 5).map(a => a.gecko_id).join(', ')}...`);
    console.error(`   - name: ${peggedAssets.slice(0, 5).map(a => a.name).join(', ')}...`);
    process.exit(1);
  }

  const asset = peggedAssets[assetIndex];
  const moduleInfo = asset.module ? `module: ${asset.module}` : `gecko_id: ${asset.gecko_id}`;
  console.log(`🔄 Force updating asset: ${asset.name} (ID: ${asset.id}, ${moduleInfo})`);

  await removeBlock(asset.id);
  console.log(`✅ Removed any existing block for asset ID: ${asset.id}`);

  process.env.FORCE_UPDATE = 'true';

  await initializeSdkInternalCache();
  
  try {
    await storePeggedAssets([assetIndex]);
    console.log(`✅ Successfully force updated ${asset.name}`);
  } catch (e) {
    console.error(`❌ Error force updating ${asset.name}:`, e);
    process.exit(1);
  }
  
  if (process.env.OUTDATED_WEBHOOK) {
    try {
      console.log('🔍 Checking for outdated stablecoins...');
      await alertOutdated();
    } catch (error) {
      console.error('❌ Error checking outdated stablecoins:', error);
    }
  }
};

handler().catch(console.error).then(async () => {
  delete process.env.FORCE_UPDATE;
  console.log("✅ Done");
  console.log("💾 Saving cache");
  await saveSdkInternalCache();
  process.exit(0);
});

