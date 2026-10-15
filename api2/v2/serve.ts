import crypto from "crypto";
import fs from "fs";
import zlib from "zlib";
import * as HyperExpress from "hyper-express";
import { getRouteDataPath } from "../file-cache";

const num = (v: string | undefined, fallback: number) => (v && /^\d+$/.test(v) ? Number(v) : fallback);

const epochOfHead = (head: string): number | undefined => {
  const match = head.match(/"generatedAt":\s*(\d+)/);
  return match ? Number(match[1]) : undefined;
};

const LRU_MAX = num(process.env.STABLECOINS_V2_LRU_ENTRIES, 32);
const LRU_MAX_BYTES = num(process.env.STABLECOINS_V2_LRU_BYTES, 192 * 1024 * 1024);
type Entry = { key: string; mtimeMs: number; brMtimeMs?: number; buf: Buffer; etag: string; br?: Buffer; parsed?: any; bytes: number };
const lru = new Map<string, Entry>();
let lruBytes = 0;

const mtimeOf = async (filePath: string): Promise<number | undefined> => {
  try {
    return (await fs.promises.stat(filePath)).mtimeMs;
  } catch {
    return undefined;
  }
};

function retain(entry: Entry) {
  const prev = lru.get(entry.key);
  if (prev) lruBytes -= prev.bytes;
  lru.delete(entry.key);
  lru.set(entry.key, entry);
  lruBytes += entry.bytes;
  evict();
}

function evict() {
  while (lru.size > LRU_MAX || (lruBytes > LRU_MAX_BYTES && lru.size > 1)) {
    const oldest = lru.keys().next().value;
    if (oldest === undefined) return;
    lruBytes -= lru.get(oldest)!.bytes;
    lru.delete(oldest);
  }
}

// dedupes concurrent misses on one file - avoids a post-cron stampede re-reading the same buffer
const inflight = new Map<string, Promise<Entry | null>>();

export async function loadV2File(subPath: string): Promise<Entry | null> {
  const filePath = getRouteDataPath(`v2/${subPath}`);
  const [mtimeMs, brMtimeMs] = await Promise.all([mtimeOf(filePath), mtimeOf(filePath + ".br")]);
  if (mtimeMs === undefined) return null;

  const existing = lru.get(subPath);
  if (existing && existing.mtimeMs === mtimeMs && existing.brMtimeMs === brMtimeMs) {
    lru.delete(subPath);
    lru.set(subPath, existing);
    return existing;
  }

  const key = `${subPath} ${mtimeMs} ${brMtimeMs ?? ""}`;
  let pending = inflight.get(key);
  if (!pending) {
    pending = readEntry(subPath, filePath).finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }
  return pending;
}

function brotliMatches(br: Buffer, digest: string): Promise<boolean> {
  return new Promise((resolve) => {
    const stream = zlib.createBrotliDecompress();
    const hash = crypto.createHash("md5");
    stream.on("data", (chunk: Buffer) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex") === digest));
    stream.on("error", () => resolve(false));
    stream.end(br);
  });
}

async function readEntry(subPath: string, filePath: string): Promise<Entry | null> {
  // read both, then re-stat both: if either moved, the pair may straddle two builds - retry
  for (let attempt = 0; attempt < 3; attempt++) {
    const [m0, b0] = await Promise.all([mtimeOf(filePath), mtimeOf(filePath + ".br")]);
    if (m0 === undefined) return null;
    const [buf, brRead] = await Promise.all([
      fs.promises.readFile(filePath),
      // an absent or unreadable .br just means "send it raw"
      b0 === undefined ? Promise.resolve(undefined) : fs.promises.readFile(filePath + ".br").catch(() => undefined),
    ]);
    const [m1, b1] = await Promise.all([mtimeOf(filePath), mtimeOf(filePath + ".br")]);
    if (m1 !== m0 || b1 !== b0) continue;

    // byte-identity also settles the epoch: a sibling left over from another run cannot match
    const digest = crypto.createHash("md5").update(buf).digest("hex");
    const br = brRead && (await brotliMatches(brRead, digest)) ? brRead : undefined;
    const entry: Entry = {
      key: subPath,
      mtimeMs: m0,
      brMtimeMs: b0,
      buf,
      br,
      bytes: buf.length + (br?.length ?? 0),
      etag: '"' + digest + '"',
    };
    retain(entry);
    return entry;
  }
  throw new Error(`v2: could not read a stable copy of ${subPath}`);
}

export function parsedOf(entry: Entry): any {
  if (entry.parsed === undefined) {
    entry.parsed = JSON.parse(entry.buf.toString("utf8"));
    if (lru.get(entry.key) === entry) {
      const cost = entry.buf.length * 4;
      entry.bytes += cost;
      lruBytes += cost;
      evict();
    }
  }
  return entry.parsed;
}

// freshness: serve only when a completed build exists, is within the age ceiling, and the file's
// epoch matches `_manifest`'s

// mark responses stale past this age; refuse to serve past the ceiling
export const V2_STALE_AFTER = num(process.env.STABLECOINS_V2_STALE_AFTER, 3 * 3600);
export const V2_MAX_AGE = num(process.env.STABLECOINS_V2_MAX_AGE, 24 * 3600);
if (V2_STALE_AFTER >= V2_MAX_AGE) {
  throw new Error(`v2: STABLECOINS_V2_STALE_AFTER (${V2_STALE_AFTER}) must be below STABLECOINS_V2_MAX_AGE (${V2_MAX_AGE})`);
}

export type Manifest = { generatedAt: number; files: number; assets: number; chains: number };

export async function loadManifest(): Promise<Manifest | null> {
  const entry = await loadV2File("_manifest");
  if (!entry) return null;
  try {
    const m = parsedOf(entry);
    return typeof m?.generatedAt === "number" ? m : null;
  } catch {
    return null;
  }
}

// an artifact's build epoch without a full parse; no generatedAt means it isn't a v2 artifact
export function storedEpoch(entry: Entry): number | undefined {
  return epochOfHead(entry.buf.subarray(0, 200).toString("utf8"));
}

export type Gate = { manifest: Manifest; age: number; stale: boolean };

// resolves the build state, or responds and returns null when nothing may be served
export async function buildGate(res: HyperExpress.Response): Promise<Gate | null> {
  const manifest = await loadManifest();
  if (!manifest) {
    // client-facing messages stay generic - the operational detail goes to the log, not the response
    console.error("v2: no readable _manifest, refusing to serve");
    sendV2Error(res, 503, "build_unavailable", "data is not available yet");
    return null;
  }
  const age = Math.floor(Date.now() / 1e3) - manifest.generatedAt;
  if (age > V2_MAX_AGE) {
    console.error(`v2: refusing to serve, data is ${age}s old against a ${V2_MAX_AGE}s ceiling`);
    sendV2Error(res, 503, "build_stale", "data is temporarily unavailable");
    return null;
  }
  return { manifest, age, stale: age > V2_STALE_AFTER };
}

export type CacheKind = "current" | "history";
const CACHE_TTL: Record<CacheKind, { maxAge: number; swr: number }> = {
  current: { maxAge: 300, swr: 600 },
  history: { maxAge: 1800, swr: 3600 },
};

function cacheControl(kind: CacheKind, gate?: Gate): string {
  const { maxAge, swr } = CACHE_TTL[kind];
  const budget = gate ? (gate.stale ? V2_MAX_AGE : V2_STALE_AFTER) - gate.age : Infinity;
  const cappedMaxAge = Math.min(maxAge, budget);
  return `public, max-age=${cappedMaxAge}, stale-while-revalidate=${Math.min(swr, budget - cappedMaxAge)}`;
}

function setCommonHeaders(res: HyperExpress.Response, kind: CacheKind, generatedAt: number | undefined, etag: string, gate?: Gate) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", cacheControl(kind, gate));
  res.setHeader("ETag", etag);
  // a shared cache must not key differently-encoded responses as one
  res.setHeader("Vary", "Accept-Encoding");
  if (generatedAt !== undefined) res.setHeader("x-generated-at", String(generatedAt));
  if (gate?.stale) {
    res.setHeader("Warning", `110 - "Response is Stale"`);
    res.setHeader("x-stale", "true");
    res.setHeader("x-build-age", String(gate.age));
  }
}

// RFC 7232 §3.2: comma-list + `*`, weak comparison - Cloudflare weakens ETags on compressed responses
function ifNoneMatchHits(header: string | undefined, etag: string): boolean {
  if (!header) return false;
  const opaque = (t: string) => t.trim().replace(/^W\//, "");
  if (header.trim() === "*") return true;
  const want = opaque(etag);
  return header.split(",").some((candidate) => opaque(candidate) === want);
}

// RFC 9110 §12.5.3: q=0 means not acceptable (`br;q=0` must not get brotli); explicit `br` outranks `*`
function acceptsBrotli(header: string | undefined): boolean {
  if (!header) return false;
  let wildcard = false;
  for (const part of header.split(",")) {
    const [token, ...params] = part.split(";");
    const name = token.trim().toLowerCase();
    if (name !== "br" && name !== "*") continue;
    const qParam = params.map((p) => p.trim().toLowerCase()).find((p) => p.startsWith("q="));
    const q = qParam ? Number(qParam.slice(2)) : 1;
    const acceptable = Number.isFinite(q) && q > 0;
    if (name === "br") return acceptable;
    wildcard = acceptable;
  }
  return wildcard;
}

// the whole-file path never parses, so this is the only thing stopping a truncated payload from going out as a cacheable 200
function endsClosed(buf: Buffer): boolean {
  for (let i = buf.length - 1; i >= 0 && i > buf.length - 8; i--) {
    const c = buf[i];
    if (c === 0x20 || c === 0x0a || c === 0x0d || c === 0x09) continue;
    return c === 0x7d; // }
  }
  return false;
}

// checks the file's epoch against the completed build; responds and returns undefined if unservable
export function checkedEpoch(res: HyperExpress.Response, entry: Entry, gate?: Gate): number | undefined {
  const epoch = storedEpoch(entry);
  if (epoch === undefined || !endsClosed(entry.buf)) {
    // not a v2 artifact, or one that doesn't close: never serve it as if it were
    console.error(`v2: refusing to serve "${entry.key}" - not a valid v2 payload`);
    sendV2Error(res, 500, "corrupt_artifact", "data is temporarily unavailable");
    return undefined;
  }
  if (gate && epoch !== gate.manifest.generatedAt) {
    // a file from a different run than the completed build - the set on disk is torn
    console.error(`v2: refusing to serve "${entry.key}" - epoch ${epoch} against manifest ${gate.manifest.generatedAt}`);
    sendV2Error(res, 503, "build_torn", "data is temporarily unavailable");
    return undefined;
  }
  return epoch;
}

export function sendV2Entry(req: HyperExpress.Request, res: HyperExpress.Response, entry: Entry, kind: CacheKind, gate?: Gate) {
  const epoch = checkedEpoch(res, entry, gate);
  if (epoch === undefined) return;
  // compressed and identity are different representations - they must not share an ETag
  const wantsBr = entry.br !== undefined && acceptsBrotli(String(req.headers["accept-encoding"] ?? ""));
  const etag = wantsBr ? entry.etag.slice(0, -1) + '-br"' : entry.etag;
  setCommonHeaders(res, kind, epoch, etag, gate);
  if (ifNoneMatchHits(req.headers["if-none-match"], etag)) return res.status(304).send("");
  if (wantsBr) {
    res.setHeader("Content-Encoding", "br");
    return res.send(entry.br as any);
  }
  return res.send(entry.buf as any);
}

// the ETag is derivable before the payload is built, so a 304 never parses, slices or hashes
export function sendV2Sliced(
  req: HyperExpress.Request,
  res: HyperExpress.Response,
  entry: Entry,
  discriminator: string,
  kind: CacheKind,
  gate: Gate | undefined,
  build: (epoch: number) => any
) {
  const epoch = checkedEpoch(res, entry, gate);
  if (epoch === undefined) return;
  const etag = '"' + crypto.createHash("md5").update(entry.etag).update(" ").update(discriminator).digest("hex") + '"';
  setCommonHeaders(res, kind, epoch, etag, gate);
  if (ifNoneMatchHits(req.headers["if-none-match"], etag)) return res.status(304).send("");
  return res.send(JSON.stringify(build(epoch)));
}

// A scoped entity that this metric simply has no data for is a permanently correct empty answer, not an origin failure
export function sendV2Empty(
  req: HyperExpress.Request,
  res: HyperExpress.Response,
  discriminator: string,
  kind: CacheKind,
  gate: Gate,
  payload: any
) {
  const epoch = gate.manifest.generatedAt;
  const etag = '"' + crypto.createHash("md5").update(`empty ${epoch} ${discriminator}`).digest("hex") + '"';
  setCommonHeaders(res, kind, epoch, etag, gate);
  if (ifNoneMatchHits(req.headers["if-none-match"], etag)) return res.status(304).send("");
  return res.send(JSON.stringify(payload));
}

export function sendV2Error(res: HyperExpress.Response, statusCode: number, code: string, message: string) {
  res.status(statusCode);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  return res.send(JSON.stringify({ error: { code, message } }));
}

export function sendV2Redirect(res: HyperExpress.Response, location: string) {
  res.status(301);
  res.setHeader("Location", location);
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.send("");
}

export function v2Wrapper(routeFn: any) {
  return async (req: HyperExpress.Request, res: HyperExpress.Response) => {
    try {
      await routeFn(req, res);
    } catch (e: any) {
      console.error("v2 route error", req?.url, e);
      if (!res.completed) sendV2Error(res, 500, "internal_error", "internal error serving a v2 response");
    }
  };
}
