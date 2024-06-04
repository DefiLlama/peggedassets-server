import fs from 'fs';
import path from 'path';
import getEnv from './env';
import { log } from '@defillama/sdk'

const CACHE_DIR = getEnv().api2CacheDir;
export const ROUTES_DATA_DIR = path.join(CACHE_DIR!, 'build')

const pathExistsMap: any = {}

async function ensureDirExists(folder: string) {

  if (!pathExistsMap[folder]) pathExistsMap[folder] = createPathIfMissing()
  return pathExistsMap[folder]

  async function createPathIfMissing() {
    try {
      await fs.promises.access(folder);
    } catch {
      try {
        await fs.promises.mkdir(folder, { recursive: true });
      } catch (e) {
        console.error(e)
      }
    }
  }
}

export async function storeRouteData(subPath: string, data: any) {
  subPath = `build/${subPath}`
  return storeData(subPath, data)
}

export async function readRouteData(subPath: string) {
  subPath = `build/${subPath}`
  return readFileData(subPath)
}

async function storeData(subPath: string, data: any) {
  const filePath = path.join(CACHE_DIR!, subPath)
  const dirPath = path.dirname(filePath)
  await ensureDirExists(dirPath)
  return fs.promises.writeFile(filePath, JSON.stringify(data))
}

async function readFileData(subPath: string) {
  const filePath = path.join(CACHE_DIR!, subPath)
  try {
    const data = await fs.promises.readFile(filePath, 'utf8')
    return JSON.parse(data.toString())
  } catch (e) {
    log((e as any)?.message)
    return null
  }
}

async function deleteFileData(subPath: string) {
  const filePath = path.join(CACHE_DIR!, subPath)
  return fs.promises.unlink(filePath)
}

function getCacheFile(key: string) {
  return `pg-cache/${key}`
}

export async function readFromPGCache(key: string, { withTimestamp = false } = {}) {
  const item: any = await readFileData(getCacheFile(key))
  if (!item) return null
  if (withTimestamp) return item
  return item.data
}

export async function writeToPGCache(key: string, data: any) {
  const id = getCacheFile(key)
  return storeData(id, {id, timestamp: Math.floor(Date.now() / 1e3), data})
}

export async function deleteFromPGCache(key: string) {
  log('Deleting from db cache:', key)
  const id = getCacheFile(key)
  return deleteFileData(id)
}
