import * as fs from 'fs';
import * as path from 'path';
import { getCurrentUnixTimestamp, HOUR } from "../../utils/date";

const DEFAULT_BLOCK_DURATION = 12 * HOUR;

const BLOCKS_FILE = process.env.LAMBDA_TASK_ROOT 
  ? path.join('/tmp', 'asset-blocks.json')
  : path.join(process.cwd(), 'asset-blocks.json');

function getBlockDuration(): number {
  const envDuration = process.env.BLOCK_DURATION_HOURS;
  if (envDuration) {
    const hours = parseInt(envDuration, 10);
    if (!isNaN(hours) && hours > 0) {
      return hours * HOUR;
    }
  }
  return DEFAULT_BLOCK_DURATION;
}

export interface AssetBlock {
  assetId: string;
  blockedAt: number;
  expiresAt: number;
  reason: string;
  blockType: "spike" | "drop" | "other";
}

interface BlocksFile {
  blocks: { [assetId: string]: AssetBlock };
  lastUpdated: number;
}

function loadBlocks(): { [assetId: string]: AssetBlock } {
  try {
    if (fs.existsSync(BLOCKS_FILE)) {
      const content = fs.readFileSync(BLOCKS_FILE, 'utf8');
      const data: BlocksFile = JSON.parse(content);
      return data.blocks || {};
    }
  } catch (error) {
    console.error('Error loading blocks file:', error);
  }
  return {};
}

function saveBlocks(blocks: { [assetId: string]: AssetBlock }): void {
  try {
    const data: BlocksFile = { blocks, lastUpdated: getCurrentUnixTimestamp() };
    fs.writeFileSync(BLOCKS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving blocks file:', error);
  }
}

function cleanExpiredBlocks(blocks: { [assetId: string]: AssetBlock }): { [assetId: string]: AssetBlock } {
  const now = getCurrentUnixTimestamp();
  const cleaned: { [assetId: string]: AssetBlock } = {};
  
  for (const [assetId, block] of Object.entries(blocks)) {
    if (block.expiresAt > now) cleaned[assetId] = block;
  }
  return cleaned;
}

export async function getActiveBlock(assetId: string): Promise<AssetBlock | null> {
  try {
    let blocks = loadBlocks();
    const originalCount = Object.keys(blocks).length;
    blocks = cleanExpiredBlocks(blocks);
    
    if (Object.keys(blocks).length < originalCount) saveBlocks(blocks);
    
    const block = blocks[assetId];
    if (!block) return null;
    
    const now = getCurrentUnixTimestamp();
    if (block.expiresAt <= now) {
      delete blocks[assetId];
      saveBlocks(blocks);
      return null;
    }
    
    return block;
  } catch (error) {
    console.error(`Error checking block for asset ${assetId}:`, error);
    return null;
  }
}

export async function createBlock(
  assetId: string,
  reason: string,
  blockType: "spike" | "drop" | "other" = "other",
  duration?: number
): Promise<AssetBlock> {
  const blockDuration = duration ?? getBlockDuration();
  const now = getCurrentUnixTimestamp();
  const block: AssetBlock = {
    assetId,
    blockedAt: now,
    expiresAt: now + blockDuration,
    reason,
    blockType,
  };

  const blocks = cleanExpiredBlocks(loadBlocks());
  blocks[assetId] = block;
  saveBlocks(blocks);
  
  return block;
}

export async function removeBlock(assetId: string): Promise<void> {
  try {
    const blocks = loadBlocks();
    delete blocks[assetId];
    saveBlocks(blocks);
  } catch (error) {
    console.error(`Error removing block for asset ${assetId}:`, error);
  }
}

export async function canUpdateAsset(assetId: string): Promise<boolean> {
  const block = await getActiveBlock(assetId);
  return block === null;
}

export function getRemainingBlockTime(block: AssetBlock): string {
  const now = getCurrentUnixTimestamp();
  const remainingSeconds = block.expiresAt - now;
  
  if (remainingSeconds <= 0) {
    return "0m";
  }
  
  const hours = Math.floor(remainingSeconds / HOUR);
  const minutes = Math.floor((remainingSeconds % HOUR) / 60);
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

