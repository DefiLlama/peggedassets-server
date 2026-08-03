import fs from "fs";
import path from "path";
import zlib from "zlib";
import * as sdk from "@defillama/sdk";
import { readRouteData, getRouteDataPath } from "../file-cache";
import { pegTypeFxTicker } from "../../src/utils/fxRates";
import {
  AssetInfo,
  RESOLUTIONS,
  Resolution,
  Tuple,
  assetRegistry,
  chainSlugFromLabel,
  identitySeriesFields,
  pointsToTuples,
  sampleTuples,
  sumRecord,
  sumRecordOrNull,
} from "./shared";

const round = Math.round;

function toTuple(ts: any, value: any): Tuple | null {
  const t = typeof ts === "number" ? ts : Number(ts);
  if (!Number.isFinite(t) || typeof value !== "number" || !Number.isFinite(value)) return null;
  return [t, round(value)];
}

function sortDedupe(tuples: Tuple[]): Tuple[] {
  tuples.sort((a, b) => a[0] - b[0]);
  const out: Tuple[] = [];
  for (const t of tuples) {
    if (out.length && out[out.length - 1][0] === t[0]) out[out.length - 1] = t;
    else out.push(t);
  }
  return out;
}

let writtenPaths = new Set<string>();

const BR_MIN_BYTES = 1024;
const brotli = (buf: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) =>
    zlib.brotliCompress(
      buf,
      { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length } },
      (err: any, out: Buffer) => (err ? reject(err) : resolve(out))
    )
  );

async function writeAtomic(filePath: string, buf: Buffer) {
  const tmp = filePath + ".tmp";
  await fs.promises.writeFile(tmp, buf);
  await fs.promises.rename(tmp, filePath);
}

async function writeV2(subPath: string, data: any) {
  const filePath = getRouteDataPath(`v2/${subPath}`);
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  const buf = Buffer.from(JSON.stringify(data));
  // .br is written/removed before the plain file is visible, so reads never see a mismatched pair
  if (buf.length >= BR_MIN_BYTES) {
    await writeAtomic(filePath + ".br", await brotli(buf));
    writtenPaths.add(subPath + ".br");
  } else {
    await fs.promises.unlink(filePath + ".br").catch(() => {});
  }
  await writeAtomic(filePath, buf);
  writtenPaths.add(subPath);
}

const IO_CONCURRENCY = 8;
async function mapPool<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    for (let i = next++; i < items.length; i = next++) out[i] = await fn(items[i], i);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function sweepOrphans(): Promise<string[]> {
  const root = getRouteDataPath("v2");
  const removed: string[] = [];
  const walk = async (dir: string) => {
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
        continue;
      }
      const rel = path.relative(root, full);
      if (rel === "_manifest") continue;
      if (writtenPaths.has(rel)) continue;
      const gone = await fs.promises
        .unlink(full)
        .then(() => true)
        .catch(() => false);
      if (gone) removed.push(rel);
    }
  };
  await walk(root);
  return removed;
}

const exists = (filePath: string): Promise<boolean> =>
  fs.promises
    .access(filePath)
    .then(() => true)
    .catch(() => false);

async function assertSourcesNotRegressed(chainLabels: string[], listed: [any, AssetInfo][]) {
  const lostChains = (
    await mapPool(chainLabels, IO_CONCURRENCY, async (label) => {
      const slug = chainSlugFromLabel(label);
      if (await exists(getRouteDataPath(`stablecoincharts2/${slug}`))) return null;
      // no source now - was there an artifact from a previous build?
      return (await exists(getRouteDataPath(`v2/history/market-cap/daily/by-asset-chain/${slug}`))) ? slug : null;
    })
  ).filter(Boolean);
  const lostAssets = (
    await mapPool(listed, IO_CONCURRENCY, async ([, info]) => {
      if (await exists(getRouteDataPath(`stablecoin/${info.id}`))) return null;
      return (await exists(getRouteDataPath(`v2/asset/${info.slug}`))) ? info.slug : null;
    })
  ).filter(Boolean);
  if (!lostChains.length && !lostAssets.length) return;
  const detail = `chains [${lostChains.join(", ") || "none"}], assets [${lostAssets.join(", ") || "none"}]`;
  if (process.env.STABLECOINS_V2_ALLOW_SOURCE_REGRESSION === "1") {
    console.error(`v2 build: source regression accepted via STABLECOINS_V2_ALLOW_SOURCE_REGRESSION: ${detail}`);
    return;
  }
  throw new Error(
    `v2 build: ${lostChains.length + lostAssets.length} source(s) that previously published artifacts are now ` +
      `unreadable - refusing to publish a build with holes in it: ${detail}. ` +
      `The previous build is left intact and will be served until it ages out. If this is a genuine delisting, ` +
      `rerun once with STABLECOINS_V2_ALLOW_SOURCE_REGRESSION=1.`
  );
}

type SeriesEntry = { data: Tuple[]; [key: string]: any };

function sortSeries(series: SeriesEntry[]): SeriesEntry[] {
  const last = (s: SeriesEntry) => (s.data.length ? s.data[s.data.length - 1][1] : -Infinity);
  return series.filter((s) => s.data.length).sort((a, b) => last(b) - last(a));
}

// writes {unit, data} or {unit, series} under every resolution
async function writeHistory(pathFor: (res: Resolution) => string, generatedAt: number, unit: string, payload: { data?: Tuple[]; series?: SeriesEntry[] }) {
  await mapPool(RESOLUTIONS, RESOLUTIONS.length, async (res) => {
    const out: any = { generatedAt, unit };
    if (payload.data) out.data = sampleTuples(payload.data, res);
    else out.series = sortSeries((payload.series ?? []).map((s) => ({ ...s, data: sampleTuples(s.data, res) })));
    await writeV2(pathFor(res), out);
  });
}

export async function buildV2Files() {
  const generatedAt = Math.floor(Date.now() / 1e3);
  const reg = assetRegistry();
  const stats = {
    written: 0,
    missingChainFiles: [] as string[],
    missingAssetFiles: [] as string[],
    removed: 0,
    droppedPoints: 0,
    sweepSkipped: false,
    derivedVolume: 0,
  };
  writtenPaths = new Set<string>();

  const [stablecoins, stablecoinChains, chartsAll, domFile, rates] = await Promise.all([
    readRouteData("stablecoins"),
    readRouteData("stablecoinchains"),
    readRouteData("stablecoincharts2/all"),
    readRouteData("stablecoincharts2/all-dominance-chain-breakdown"),
    readRouteData("rates"),
  ]);

  // guard on content not key presence - an empty-but-present source would otherwise publish an empty dataset as healthy
  const sourceAssets: any[] = Array.isArray(stablecoins?.peggedAssets) ? stablecoins.peggedAssets : [];
  const breakdownIds = chartsAll?.breakdown && typeof chartsAll.breakdown === "object" ? Object.keys(chartsAll.breakdown) : [];
  if (!sourceAssets.length) throw new Error("v2 build: /stablecoins has no peggedAssets - refusing to publish an empty dataset");
  if (!breakdownIds.length) throw new Error("v2 build: stablecoincharts2/all has an empty breakdown - refusing to publish an empty dataset");
  if (!Array.isArray(stablecoinChains) || !stablecoinChains.length) {
    throw new Error("v2 build: /stablecoinchains is empty - refusing to publish an empty dataset");
  }

  const previousManifest = await readRouteData("v2/_manifest");
  const previousAssets = await readRouteData("v2/assets");
  const previousCount =
    typeof previousManifest?.assets === "number"
      ? previousManifest.assets
      : Array.isArray(previousAssets?.assets)
      ? previousAssets.assets.length
      : 0;
  if (previousCount && sourceAssets.length < previousCount / 2) {
    throw new Error(`v2 build: asset count collapsed ${previousCount} -> ${sourceAssets.length} - refusing to publish`);
  }

  const latestRates: Record<string, number> = rates?.[rates.length - 1]?.rates ?? {};
  const referenceUsdFor = (info: AssetInfo): number | null => {
    if (info.pegType === "peggedUSD") return 1;
    if (info.pegType === "peggedVAR") return null;
    const rate = latestRates[pegTypeFxTicker(info.pegType)];
    return rate && isFinite(1 / rate) ? 1 / rate : null;
  };

  const chainLabels: string[] = (stablecoinChains ?? []).map((c: any) => c.name);
  const doubleIds = new Set<string>((chartsAll.doublecountedIds ?? []).map(String));

  // ---------- current-data snapshots ----------

  const snapshotOf = (a: any, info: AssetInfo, scope?: any) => ({
    id: info.id,
    slug: info.slug,
    name: info.name,
    symbol: info.symbol,
    geckoId: info.geckoId,
    pegCurrency: info.pegCurrency,
    pegMechanism: info.pegMechanism,
    priceUsd: typeof a.price === "number" ? a.price : null,
    referenceUsd: referenceUsdFor(info),
    circulatingUsd: sumRecordOrNull(scope ? scope.current : a.circulating) ?? 0,
    circulatingUsdPrevDay: sumRecordOrNull(scope ? scope.circulatingPrevDay : a.circulatingPrevDay),
    circulatingUsdPrevWeek: sumRecordOrNull(scope ? scope.circulatingPrevWeek : a.circulatingPrevWeek),
    circulatingUsdPrevMonth: sumRecordOrNull(scope ? scope.circulatingPrevMonth : a.circulatingPrevMonth),
    chains: (a.chains ?? []).map(chainSlugFromLabel),
    ...(info.doublecounted ? { doublecounted: true } : {}),
    ...(info.deprecated ? { deprecated: true } : {}),
    ...(info.delisted ? { delisted: true } : {}),
    ...(info.yieldBearing ? { yieldBearing: true } : {}),
  });

  const listed: [any, AssetInfo][] = [];
  for (const a of stablecoins.peggedAssets) {
    const info = reg.byId.get(String(a.id));
    if (!info) {
      console.error(`v2 build: /stablecoins asset id ${a.id} missing from peggedData`);
      continue;
    }
    listed.push([a, info]);
  }

  // pre-flight: refuse to publish if sources regressed (skipping just the sweep isn't enough); only counts as regression if a previous build published that entity
  await assertSourcesNotRegressed(chainLabels, listed);

  await writeV2("assets", {
    generatedAt,
    assets: listed.map(([a, info]) => snapshotOf(a, info)).sort((x, y) => y.circulatingUsd - x.circulatingUsd),
  });
  stats.written++;

  for (const label of chainLabels) {
    const scoped = listed
      .map(([a, info]) => {
        const chainScope = a.chainCirculating?.[label];
        if (!chainScope) return null;
        return snapshotOf(a, info, chainScope);
      })
      .filter(Boolean) as any[];
    await writeV2(`assets-chain/${chainSlugFromLabel(label)}`, {
      generatedAt,
      assets: scoped.sort((x, y) => y.circulatingUsd - x.circulatingUsd),
    });
    stats.written++;
  }

  // chains snapshot: totals from /stablecoinchains, prev* from the per-chain series, dominant asset from dominanceMap
  const chainChartMap = domFile?.chainChartMap ?? {};
  const dominanceMap = domFile?.dominanceMap ?? {};
  const valueAtOffset = (tuples: Tuple[], last: number, offsetDays: number): number | null => {
    const target = last - offsetDays * 86400;
    let best: Tuple | null = null;
    for (const t of tuples) {
      // closest record within 1.5 days, same tolerance class as v1 snapshot offsets
      if (Math.abs(t[0] - target) <= 86400 * 1.5 && (!best || Math.abs(t[0] - target) < Math.abs(best[0] - target))) best = t;
    }
    return best ? best[1] : null;
  };
  const chainsOut = (stablecoinChains ?? []).map((c: any) => {
    const tuples = pointsToTuples(chainChartMap[c.name] ?? [], "totalCirculatingUSD");
    const lastTs = tuples.length ? tuples[tuples.length - 1][0] : 0;
    const domPoints = dominanceMap[c.name] ?? [];
    const greatest = domPoints.length ? domPoints[domPoints.length - 1]?.greatestMcap : null;
    const domAsset = greatest?.gecko_id ? reg.byGeckoId.get(greatest.gecko_id) : null;
    return {
      slug: chainSlugFromLabel(c.name),
      name: c.name,
      circulatingUsd: round(sumRecord(c.totalCirculatingUSD)),
      circulatingUsdPrevDay: tuples.length ? valueAtOffset(tuples, lastTs, 1) : null,
      circulatingUsdPrevWeek: tuples.length ? valueAtOffset(tuples, lastTs, 7) : null,
      circulatingUsdPrevMonth: tuples.length ? valueAtOffset(tuples, lastTs, 30) : null,
      dominantAsset: greatest
        ? { slug: domAsset?.slug ?? null, symbol: greatest.symbol, circulatingUsd: round(greatest.mcap) }
        : null,
    };
  });
  await writeV2("chains", { generatedAt, chains: chainsOut.sort((a: any, b: any) => b.circulatingUsd - a.circulatingUsd) });
  stats.written++;

  // ---------- market-cap histories ----------

  // global total excludes doublecounted (v1 aggregated does not - sum the clean series instead)
  const globalByDate = new Map<number, number>();
  const assetSeriesGlobal: SeriesEntry[] = [];
  for (const [id, points] of Object.entries(chartsAll.breakdown)) {
    const info = reg.byId.get(id);
    if (!info) continue;
    const tuples = pointsToTuples(points as any[], "totalCirculatingUSD");
    assetSeriesGlobal.push({ ...identitySeriesFields(info), data: tuples });
    if (!doubleIds.has(id)) for (const [ts, v] of tuples) globalByDate.set(ts, (globalByDate.get(ts) ?? 0) + v);
    await writeHistory((r) => `history/market-cap/${r}/total-asset/${info.slug}`, generatedAt, "usd", { data: tuples });
    stats.written += 3;
  }
  const globalTotal: Tuple[] = [...globalByDate.entries()].sort((a, b) => a[0] - b[0]).map(([t, v]) => [t, round(v)]);
  await writeHistory((r) => `history/market-cap/${r}/total`, generatedAt, "usd", { data: globalTotal });
  await writeHistory((r) => `history/market-cap/${r}/by-asset`, generatedAt, "usd", { series: assetSeriesGlobal });
  stats.written += 6;

  const chainSeriesGlobal: SeriesEntry[] = Object.entries(chainChartMap).map(([label, points]) => ({
    slug: chainSlugFromLabel(label),
    name: label,
    data: pointsToTuples(points as any[], "totalCirculatingUSD"),
  }));
  await writeHistory((r) => `history/market-cap/${r}/by-chain`, generatedAt, "usd", { series: chainSeriesGlobal });
  stats.written += 3;
  for (const s of chainSeriesGlobal) {
    await writeHistory((r) => `history/market-cap/${r}/total-chain/${s.slug}`, generatedAt, "usd", { data: s.data });
    stats.written += 3;
  }

  // per-chain asset breakdowns + per-asset chain breakdowns, one pass over the v1 chain files
  const perAssetChains = new Map<string, SeriesEntry[]>();
  for (const label of chainLabels) {
    const chainSlug = chainSlugFromLabel(label);
    const chainFile = await readRouteData(`stablecoincharts2/${chainSlug}`);
    if (!chainFile?.breakdown) {
      stats.missingChainFiles.push(chainSlug);
      continue;
    }
    const series: SeriesEntry[] = [];
    for (const [id, points] of Object.entries(chainFile.breakdown)) {
      const info = reg.byId.get(id);
      if (!info) continue;
      const tuples = pointsToTuples(points as any[], "totalCirculatingUSD");
      if (!tuples.length) continue;
      series.push({ ...identitySeriesFields(info), data: tuples });
      if (!perAssetChains.has(id)) perAssetChains.set(id, []);
      perAssetChains.get(id)!.push({ slug: chainSlug, name: label, data: tuples });
    }
    await writeHistory((r) => `history/market-cap/${r}/by-asset-chain/${chainSlug}`, generatedAt, "usd", { series });
    stats.written += 3;
  }
  for (const [id, series] of perAssetChains) {
    const info = reg.byId.get(id)!;
    await writeHistory((r) => `history/market-cap/${r}/by-chain-asset/${info.slug}`, generatedAt, "usd", { series });
    stats.written += 3;
  }

  // ---------- supply histories (raw token counts, from the v1 asset detail files) ----------

  // one unit of work per asset; misses are collected and folded back afterwards for deterministic stats
  const assetMisses = await mapPool(listed, IO_CONCURRENCY, async ([listedAsset, info]) => {
    const detail = await readRouteData(`stablecoin/${info.id}`);
    if (!detail) return info.slug;
    // both variants share one walk of the token array: they differ only by the unreleased addend
    const tuplesBoth = (tokens: any[]): { plain: Tuple[]; unreleased: Tuple[] } => {
      const plain: Tuple[] = [];
      const unreleased: Tuple[] = [];
      for (const t of tokens ?? []) {
        if (!t || t.circulating === undefined) continue;
        const circulating = sumRecord(t.circulating);
        const a = toTuple(t.date, circulating);
        const b = toTuple(t.date, circulating + sumRecord(t.unreleased));
        if (a && b) {
          plain.push(a);
          unreleased.push(b);
        } else stats.droppedPoints++;
      }
      return { plain: sortDedupe(plain), unreleased: sortDedupe(unreleased) };
    };
    const totals = tuplesBoth(detail.tokens);
    const chainEntries = Object.entries(detail.chainBalances ?? {}).map(([label, v]: [string, any]) => ({
      slug: chainSlugFromLabel(label),
      name: label,
      both: tuplesBoth(v?.tokens ?? []),
    }));
    const chainSeriesFor = (key: "plain" | "unreleased"): SeriesEntry[] =>
      chainEntries.map((c) => ({ slug: c.slug, name: c.name, data: c.both[key] }));
    await writeHistory((r) => `history/supply/${r}/${info.slug}/total`, generatedAt, "count", { data: totals.plain });
    await writeHistory((r) => `history/supply/${r}/${info.slug}/total-unreleased`, generatedAt, "count", { data: totals.unreleased });
    await writeHistory((r) => `history/supply/${r}/${info.slug}/by-chain`, generatedAt, "count", { series: chainSeriesFor("plain") });
    await writeHistory((r) => `history/supply/${r}/${info.slug}/by-chain-unreleased`, generatedAt, "count", { series: chainSeriesFor("unreleased") });
    stats.written += 4 * RESOLUTIONS.length;

    // circulatingUsd must match /v2/assets' source or directory and detail pages disagree; only unpriced quantities are converted here
    const priceUsd = typeof detail.price === "number" ? detail.price : null;
    const refUsd = referenceUsdFor(info);
    const price = priceUsd ?? refUsd ?? 0;
    const lastOf = (tokens: any[]) => (tokens?.length ? tokens[tokens.length - 1] : null);
    const chainsCurrent = Object.entries(detail.chainBalances ?? {})
      .map(([label, v]: [string, any]) => {
        const last = lastOf(v?.tokens ?? []);
        if (!last) return null;
        const scope = listedAsset.chainCirculating?.[label];
        return {
          slug: chainSlugFromLabel(label),
          name: label,
          circulatingUsd: scope ? sumRecordOrNull(scope.current) ?? 0 : round(sumRecord(last.circulating) * price),
          unreleasedUsd: round(sumRecord(last.unreleased) * price),
          bridgedInUsd: round(sumRecord(last.bridgedTo) * price),
          mintedUsd: round(sumRecord(last.minted) * price),
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.circulatingUsd - a.circulatingUsd);
    const globalLast = lastOf(detail.tokens);
    const raw = info.raw;
    await writeV2(`asset/${info.slug}`, {
      generatedAt,
      id: info.id,
      slug: info.slug,
      name: info.name,
      symbol: info.symbol,
      geckoId: info.geckoId,
      cmcId: raw.cmcId ?? null,
      address: raw.address ?? null,
      pegCurrency: info.pegCurrency,
      pegMechanism: info.pegMechanism,
      priceSource: raw.priceSource ?? null,
      priceUsd,
      referenceUsd: refUsd,
      description: raw.description ?? null,
      mintRedeemDescription: raw.mintRedeemDescription ?? null,
      url: raw.url ?? null,
      twitter: raw.twitter ?? null,
      wiki: raw.wiki ?? null,
      auditLinks: raw.auditLinks ?? raw.audit_links ?? [],
      onCoinGecko: raw.onCoinGecko === "true" || raw.onCoinGecko === true,
      circulatingUsd: sumRecordOrNull(listedAsset.circulating) ?? 0,
      unreleasedUsd: globalLast ? round(sumRecord(globalLast.unreleased) * price) : 0,
      ...(info.doublecounted ? { doublecounted: true } : {}),
      ...(info.deprecated ? { deprecated: true } : {}),
      ...(info.delisted ? { delisted: true } : {}),
      ...(info.yieldBearing ? { yieldBearing: true } : {}),
      ...(info.deadFrom ? { deadFrom: info.deadFrom } : {}),
      chains: chainsCurrent,
    });
    stats.written++;
    return null;
  });
  for (const slug of assetMisses) if (slug) stats.missingAssetFiles.push(slug);

  // ---------- volume histories (1:1 transforms of the v1 volume files) ----------
  await buildVolume(generatedAt, reg, stats);

  // sweep only runs if no sources regressed vs the previous build - a missing source could be delisted or just unreadable, and deleting on the latter is catastrophic
  const prevMissingChains = typeof previousManifest?.missingChainSources === "number" ? previousManifest.missingChainSources : Infinity;
  const prevMissingAssets = typeof previousManifest?.missingAssetSources === "number" ? previousManifest.missingAssetSources : Infinity;
  const degraded = stats.missingChainFiles.length > prevMissingChains || stats.missingAssetFiles.length > prevMissingAssets;
  if (degraded) {
    stats.sweepSkipped = true;
    console.error(
      `v2 build: SOURCES REGRESSED (chains ${prevMissingChains} -> ${stats.missingChainFiles.length}, ` +
        `assets ${prevMissingAssets} -> ${stats.missingAssetFiles.length}) - skipping orphan sweep to avoid ` +
        `deleting still-good data. Missing chains: ${stats.missingChainFiles.join(", ") || "none"}; ` +
        `missing assets: ${stats.missingAssetFiles.join(", ") || "none"}`
    );
  }
  const removed = degraded ? [] : await sweepOrphans();
  stats.removed = removed.length;

  // `_manifest` is written LAST - it's the only proof a run completed; serving relies on that
  await writeV2("_manifest", {
    generatedAt,
    files: writtenPaths.size,
    assets: listed.length,
    chains: chainLabels.length,
    missingChainSources: stats.missingChainFiles.length,
    missingAssetSources: stats.missingAssetFiles.length,
  });

  console.log(
    `v2 build done: ${stats.written} files, ${removed.length} orphans removed` +
      (stats.missingChainFiles.length ? `; missing chain sources: ${stats.missingChainFiles.length}` : "") +
      (stats.missingAssetFiles.length ? `; missing asset sources: ${stats.missingAssetFiles.length}` : "")
  );
  return stats;
}

async function buildVolume(generatedAt: number, reg: ReturnType<typeof assetRegistry>, stats: any) {
  const volumeDir = getRouteDataPath("volume");
  let files: string[] = [];
  try {
    files = await fs.promises.readdir(volumeDir);
  } catch {
    console.error("v2 build: no volume files found, skipping volume endpoints");
    return;
  }
  // filter to names the v1 writer actually produces - a stray .tmp/.br file would leak into a route path
  files = files.filter((f) => !/\.(tmp|br)$/.test(f));
  const readVolume = (name: string) => readRouteData(`volume/${name}`);

  const totalTuples = (rows: any[]): Tuple[] => {
    const out: Tuple[] = [];
    for (const r of rows ?? []) {
      const tuple = Array.isArray(r) ? toTuple(r[0], r[1]) : null;
      if (tuple) out.push(tuple);
      else stats.droppedPoints++;
    }
    return sortDedupe(out);
  };

  // breakdown rows [[ts, {key: value}]] -> one series per key
  const breakdownSeries = (rows: any[], identityFor: (key: string) => any): SeriesEntry[] => {
    const byKey = new Map<string, Tuple[]>();
    for (const row of rows ?? []) {
      if (!Array.isArray(row)) {
        stats.droppedPoints++;
        continue;
      }
      const [ts, values] = row;
      for (const [key, value] of Object.entries(values ?? {})) {
        const tuple = toTuple(ts, value);
        if (!tuple) {
          stats.droppedPoints++;
          continue;
        }
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key)!.push(tuple);
      }
    }
    return [...byKey.entries()].map(([key, data]) => ({ ...identityFor(key), data: sortDedupe(data) }));
  };

  const assetIdentity = (symbol: string) => {
    const matches = reg.bySymbol.get(symbol.toUpperCase()) ?? [];
    // volume source data is keyed by token symbol; only a unique match gets asset identity
    if (matches.length === 1) return { id: matches[0].id, slug: matches[0].slug, name: matches[0].name, symbol: matches[0].symbol };
    return { slug: null, name: symbol, symbol };
  };
  // breakdown keys are chain keys ("optimism"); resolve to a display label
  const chainIdentity = (key: string) => {
    const name = sdk.chainUtils.getChainLabelFromKey(key);
    return { slug: chainSlugFromLabel(name), name };
  };
  // slugs from volume filenames are label-slugs, not chain keys - resolve via chain list, not getChainLabelFromKey (mangles them, e.g. "op-mainnet" -> "Op-mainnet")
  const labelBySlug = new Map<string, string>();
  for (const label of Object.values(sdk.chainUtils.chainKeyToChainLabelMap ?? {}) as string[]) {
    if (label) labelBySlug.set(chainSlugFromLabel(label), label);
  }
  const chainIdentityFromSlug = (slug: string) => ({ slug, name: labelBySlug.get(slug) ?? sdk.chainUtils.getChainLabelFromKey(slug) });
  const currencyIdentity = (code: string) => ({ slug: code.toLowerCase(), name: code.toUpperCase() });

  const writeIf = async (rows: any, pathFor: (r: Resolution) => string, payload: { data?: Tuple[]; series?: SeriesEntry[] }) => {
    if (!rows) return;
    await writeHistory(pathFor, generatedAt, "usd", payload);
    stats.written += 3;
  };

  const [totalRows, chainBreakdown, tokenBreakdown, currencyBreakdown] = await Promise.all([
    readVolume("chart-total"),
    readVolume("chart-total-chain-breakdown"),
    readVolume("chart-total-token-breakdown"),
    readVolume("chart-total-currency-breakdown"),
  ]);
  // each breakdown is pivoted once, reused by its own endpoint and the derived families below
  const chainSeries = chainBreakdown ? breakdownSeries(chainBreakdown, chainIdentity) : [];
  const tokenSeries = tokenBreakdown ? breakdownSeries(tokenBreakdown, assetIdentity) : [];
  if (totalRows) await writeIf(totalRows, (r) => `history/volume/${r}/total`, { data: totalTuples(totalRows) });
  if (chainBreakdown) await writeIf(chainBreakdown, (r) => `history/volume/${r}/by-chain`, { series: chainSeries });
  if (tokenBreakdown) await writeIf(tokenBreakdown, (r) => `history/volume/${r}/by-asset`, { series: tokenSeries });
  if (currencyBreakdown) await writeIf(currencyBreakdown, (r) => `history/volume/${r}/by-pegcurrency`, { series: breakdownSeries(currencyBreakdown, currencyIdentity) });

  // asset -> per-chain volume series, pivoted out of the per-chain token breakdowns below
  const perAssetChainVolume = new Map<string, SeriesEntry[]>();

  for (const file of files) {
    if (file.startsWith("chart-chain-")) {
      const rest = file.slice("chart-chain-".length);
      if (rest.endsWith("-token-breakdown")) {
        const chainSlug = rest.slice(0, -"-token-breakdown".length);
        const rows = await readVolume(file);
        const series = breakdownSeries(rows, assetIdentity);
        await writeIf(rows, (r) => `history/volume/${r}/chain/${chainSlug}/by-asset`, { series });
        for (const s of series) {
          if (!s.slug || !s.data.length) continue; // ambiguous symbol: not attributable to one asset
          if (!perAssetChainVolume.has(s.slug)) perAssetChainVolume.set(s.slug, []);
          perAssetChainVolume.get(s.slug)!.push({ ...chainIdentityFromSlug(chainSlug), data: s.data });
        }
      } else if (rest.endsWith("-currency-breakdown")) {
        const chainSlug = rest.slice(0, -"-currency-breakdown".length);
        const rows = await readVolume(file);
        await writeIf(rows, (r) => `history/volume/${r}/chain/${chainSlug}/by-pegcurrency`, { series: breakdownSeries(rows, currencyIdentity) });
      } else {
        const rows = await readVolume(file);
        await writeIf(rows, (r) => `history/volume/${r}/chain/${rest}/total`, { data: totalTuples(rows) });
      }
    } else if (file.startsWith("chart-token-")) {
      const rest = file.slice("chart-token-".length);
      const isChainBreakdown = rest.endsWith("-chain-breakdown");
      const symbol = isChainBreakdown ? rest.slice(0, -"-chain-breakdown".length) : rest;
      const matches = reg.bySymbol.get(symbol.toUpperCase()) ?? [];
      if (matches.length !== 1) continue; // ambiguous or unknown symbol: not routable by asset slug
      const slug = matches[0].slug;
      const rows = await readVolume(file);
      if (isChainBreakdown) await writeIf(rows, (r) => `history/volume/${r}/asset/${slug}/by-chain`, { series: breakdownSeries(rows, chainIdentity) });
      else await writeIf(rows, (r) => `history/volume/${r}/asset/${slug}/total`, { data: totalTuples(rows) });
    }
  }

  // derives routes with no dedicated v1 source file from the breakdowns above; dedicated files take precedence when present
  const derive = async (subPath: (r: Resolution) => string, payload: { data?: Tuple[]; series?: SeriesEntry[] }) => {
    if (writtenPaths.has(subPath("daily"))) return; // an authoritative source file already wrote it
    await writeHistory(subPath, generatedAt, "usd", payload);
    stats.written += 3;
    stats.derivedVolume = (stats.derivedVolume ?? 0) + 3;
  };

  for (const s of chainSeries) {
    if (!s.slug || !s.data.length) continue;
    await derive((r) => `history/volume/${r}/chain/${s.slug}/total`, { data: s.data });
  }
  for (const s of tokenSeries) {
    if (!s.slug || !s.data.length) continue;
    await derive((r) => `history/volume/${r}/asset/${s.slug}/total`, { data: s.data });
  }
  for (const [slug, series] of perAssetChainVolume) {
    await derive((r) => `history/volume/${r}/asset/${slug}/by-chain`, { series });
  }
}
