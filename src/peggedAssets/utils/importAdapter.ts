import { PeggedAsset } from "../../peggedData/types";
import path from "path";
import { addBridgeConfigs } from "../../adapters/peggedAssets/helper/bridgeConfig";
import { PeggedIssuanceAdapter } from "../../adapters/peggedAssets/peggedAsset.type";

export async function importAdapter(asset: PeggedAsset, adapter?: any): Promise<PeggedIssuanceAdapter> {
  let key = asset.module ?? asset.gecko_id
  const modulePath = path.join(__dirname, '../../adapters/peggedAssets', key);
  
  if (!adapter) {
    adapter = (await import(modulePath)).default;
  }

  if (asset.bridgeConfig?.lzConfig) {
    const lzConfigPath = path.join(modulePath, 'layerzeroConfig');
    try {
      const layerzeroConfig = (await import(lzConfigPath)).default;
      addBridgeConfigs(adapter, { layerzero: layerzeroConfig });
    } catch (e) {
      console.warn(
        `[${asset.name}] bridgeConfig.lzConfig declared but ${key}/layerzeroConfig.ts not found; skipping. Run the generator: npx ts-node src/adapters/peggedAssets/helper/scripts/generateLzConfig.ts --asset ${asset.gecko_id}`
      );
    }
  }

  if (asset.bridgeConfig?.hyperlaneConfig) {
    const hyperlaneConfigPath = path.join(modulePath, 'hyperlaneConfig');
    try {
      const hyperlaneConfig = (await import(hyperlaneConfigPath)).default;
      addBridgeConfigs(adapter, { hyperlane: hyperlaneConfig });
    } catch (e) {
      console.warn(
        `[${asset.name}] bridgeConfig.hyperlaneConfig declared but ${key}/hyperlaneConfig.ts not found; skipping. Run the generator: npx ts-node src/adapters/peggedAssets/helper/scripts/generateHyperlaneConfig.ts --asset ${asset.gecko_id}`
      );
    }
  }

  if (asset.bridgeConfig?.wormholeConfig) {
    const wormholeConfigPath = path.join(modulePath, 'wormholeConfig');
    try {
      const wormholeConfig = (await import(wormholeConfigPath)).default;
      addBridgeConfigs(adapter, { wormhole: wormholeConfig });
    } catch (e) {
      console.warn(
        `[${asset.name}] bridgeConfig.wormholeConfig declared but ${key}/wormholeConfig.ts not found; skipping. Run the generator: npx ts-node src/adapters/peggedAssets/helper/scripts/generateWormholeConfig.ts --asset ${asset.gecko_id}`
      );
    }
  }

  return adapter;
}
