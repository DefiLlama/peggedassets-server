import * as sdk from "@defillama/sdk";
import peggedAssets from "../../src/peggedData/peggedData";
import sluggifyPegged from "../../src/peggedAssets/utils/sluggifyPegged";
import { pegTypeFxTicker } from "../../src/utils/fxRates";

export type Tuple = [number, number];
export type Resolution = "daily" | "weekly" | "monthly";
export const RESOLUTIONS: Resolution[] = ["daily", "weekly", "monthly"];

export type AssetInfo = {
  id: number;
  slug: string;
  name: string;
  symbol: string;
  geckoId: string | null;
  pegType: string;
  pegCurrency: string;
  pegMechanism: string | null;
  doublecounted: boolean;
  deprecated: boolean;
  delisted: boolean;
  yieldBearing: boolean;
  deadFrom: number | null;
  raw: any;
};

export type AssetRegistry = {
  bySlug: Map<string, AssetInfo>;
  byId: Map<string, AssetInfo>;
  byGeckoId: Map<string, AssetInfo>;
  bySymbol: Map<string, AssetInfo[]>;
  all: AssetInfo[];
  // entries that couldn't be keyed at all; build refuses to publish while non-empty
  issues: string[];
  // asset is fine but a secondary index is ambiguous; logged, not fatal
  warnings: string[];
};

let _registry: AssetRegistry | null = null;

// skips unusable peggedData entries into `issues` rather than throwing; build refuses to publish while `issues` is non-empty
export function assetRegistry(): AssetRegistry {
  if (_registry) return _registry;
  const bySlug = new Map<string, AssetInfo>();
  const byId = new Map<string, AssetInfo>();
  const byGeckoId = new Map<string, AssetInfo>();
  const bySymbol = new Map<string, AssetInfo[]>();
  const all: AssetInfo[] = [];
  const issues: string[] = [];
  const warnings: string[] = [];
  const ambiguousGeckoIds = new Set<string>();

  for (const pegged of peggedAssets as any[]) {
    const id = Number(pegged?.id);
    if (!Number.isFinite(id)) {
      issues.push(`asset id ${JSON.stringify(pegged?.id)} is not numeric`);
      continue;
    }
    if (typeof pegged.name !== "string" || !pegged.name) {
      issues.push(`asset id ${id} has no name (cannot be slugged)`);
      continue;
    }
    if (typeof pegged.pegType !== "string" || !pegged.pegType) {
      issues.push(`asset id ${id} ("${pegged.name}") has no pegType`);
      continue;
    }

    let slug = sluggifyPegged(pegged);
    if (bySlug.has(slug)) {
      // slug collision can't be resolved without diverging from v1 - record and skip so one doesn't silently overwrite the other's files
      issues.push(`slug collision on "${slug}" (ids ${bySlug.get(slug)!.id}, ${id}) - v1 keys by the same slug`);
      continue;
    }
    if (byId.has(String(id))) {
      issues.push(`duplicate asset id ${id} ("${pegged.name}")`);
      continue;
    }

    const info: AssetInfo = {
      id,
      slug,
      name: pegged.name,
      symbol: pegged.symbol,
      geckoId: pegged.gecko_id ?? null,
      pegType: pegged.pegType,
      pegCurrency: pegTypeFxTicker(pegged.pegType),
      pegMechanism: pegged.pegMechanism ?? null,
      doublecounted: pegged.doublecounted === true,
      deprecated: pegged.deprecated === true,
      delisted: pegged.delisted === true,
      yieldBearing: pegged.yieldBearing === true,
      deadFrom: pegged.deadFrom ?? null,
      raw: pegged,
    };
    bySlug.set(slug, info);
    byId.set(String(id), info);
    if (info.geckoId) {
      if (byGeckoId.has(info.geckoId)) {
        warnings.push(`gecko_id "${info.geckoId}" claimed by ids ${byGeckoId.get(info.geckoId)!.id} and ${id} - not resolvable to one asset`);
        ambiguousGeckoIds.add(info.geckoId);
      } else {
        byGeckoId.set(info.geckoId, info);
      }
    }
    const symbolKey = (pegged.symbol ?? "").toUpperCase();
    if (!bySymbol.has(symbolKey)) bySymbol.set(symbolKey, []);
    bySymbol.get(symbolKey)!.push(info);
    all.push(info);
  }
  for (const geckoId of ambiguousGeckoIds) byGeckoId.delete(geckoId);
  for (const issue of issues) console.error(`v2 registry: ${issue}`);
  for (const warning of warnings) console.warn(`v2 registry: ${warning}`);

  _registry = { bySlug, byId, byGeckoId, bySymbol, all, issues, warnings };
  return _registry;
}

// v2's public chain slug, derived from the display label - NOT v1's per-chain cache filename, which slugs the lowercased chain key instead
export function chainSlugFromLabel(label: string): string {
  return sdk.chainUtils.sluggifyString(label);
}

export const sumRecord = (rec: any): number => {
  let total = 0;
  for (const v of Object.values(rec ?? {})) if (typeof v === "number" && isFinite(v)) total += v;
  return total;
};

// null = unknown, 0 = measured zero - an empty/all-null record must not collapse to a fake $0
export const sumRecordOrNull = (rec: any): number | null => {
  if (!rec || typeof rec !== "object") return null;
  let total = 0;
  let seen = false;
  for (const v of Object.values(rec)) {
    if (typeof v === "number" && isFinite(v)) {
      total += v;
      seen = true;
    }
  }
  return seen ? Math.round(total) : null;
};

export function identitySeriesFields(info: AssetInfo) {
  return {
    id: info.id,
    slug: info.slug,
    name: info.name,
    symbol: info.symbol,
    ...(info.doublecounted ? { doublecounted: true } : {}),
  };
}

// weekly = Monday-start UTC, monthly = UTC calendar month; keeps the last point per bucket (period-end, no averaging)
function bucketOf(ts: number, resolution: Resolution): number {
  const day = Math.floor(ts / 86400);
  if (resolution === "weekly") return Math.floor((day - 4) / 7); // epoch day 4 = Monday 1970-01-05
  return monthIndexOfDay(day);
}

// UTC year*12+month via civil-calendar arithmetic - avoids allocating a Date per point
function monthIndexOfDay(day: number): number {
  const z = day + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const month = mp < 10 ? mp + 3 : mp - 9; // 1-12
  const year = yoe + era * 400 + (month <= 2 ? 1 : 0);
  return year * 12 + (month - 1);
}

// PRECONDITION: `data` is ascending by timestamp, so "last write wins" is the chronologically last point
export function sampleTuples(data: Tuple[], resolution: Resolution): Tuple[] {
  if (resolution === "daily") return data;
  const byBucket = new Map<number, Tuple>();
  for (const point of data) byBucket.set(bucketOf(point[0], resolution), point);
  return [...byBucket.values()];
}

// PRECONDITION: `data` is ascending by timestamp - binary search finds the contiguous range; hot path, must not be linear
export function sliceTuples(data: Tuple[], start?: number, end?: number): Tuple[] {
  if (start === undefined && end === undefined) return data;
  const from = start === undefined ? 0 : lowerBound(data, start);
  const to = end === undefined ? data.length : upperBound(data, end);
  if (to <= from) return [];
  if (from === 0 && to === data.length) return data; // fully covered: no copy
  return data.slice(from, to);
}

// first index whose timestamp is >= ts
function lowerBound(data: Tuple[], ts: number): number {
  let lo = 0;
  let hi = data.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (data[mid][0] < ts) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// first index whose timestamp is > ts (so `end` stays inclusive)
function upperBound(data: Tuple[], ts: number): number {
  let lo = 0;
  let hi = data.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (data[mid][0] <= ts) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function pointsToTuples(points: any[], field: string): Tuple[] {
  const out: Tuple[] = [];
  let ascending = true;
  for (const p of points ?? []) {
    if (!p) continue;
    const value = p[field];
    if (value === undefined || value === null || typeof value !== "object") continue;
    const ts = Number(p.date);
    if (!Number.isFinite(ts)) continue;
    if (out.length && ts < out[out.length - 1][0]) ascending = false;
    out.push([ts, Math.round(sumRecord(value))]);
  }
  if (!ascending) out.sort((a, b) => a[0] - b[0]);
  return out;
}
