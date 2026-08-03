import * as HyperExpress from "hyper-express";
import { Resolution, assetRegistry, sliceTuples } from "./shared";
import {
  Gate,
  V2_MAX_AGE,
  V2_STALE_AFTER,
  buildGate,
  loadManifest,
  loadV2File,
  parsedOf,
  sendV2Entry,
  sendV2Error,
  sendV2Redirect,
  sendV2Sliced,
  v2Wrapper,
} from "./serve";

const MAX_SAFE = 9007199254740991; // 2^53 - 1
const GROUP_BY: Record<string, string[]> = {
  "market-cap": ["asset", "chain"],
  volume: ["asset", "chain", "pegCurrency"],
  supply: ["chain"],
};
const PARAM_ORDER = ["asset", "chain", "groupBy", "includeUnreleased", "resolution", "start", "end"];
const SAFE_SLUG = /^[a-z0-9][a-z0-9._+()-]*$/;

type Query = { [key: string]: string };

function validate(req: HyperExpress.Request, res: HyperExpress.Response, metric: string, allowed: string[]): Query | undefined {
  const query: Query = {};
  for (const [key, value] of Object.entries(req.query ?? {})) {
    if (!allowed.includes(key)) {
      sendV2Error(res, 400, "unknown_param", `unknown parameter "${key}"`);
      return;
    }
    if (Array.isArray(value)) {
      sendV2Error(res, 400, "invalid_param", `parameter "${key}" given more than once`);
      return;
    }
    query[key] = String(value);
  }

  if (metric === "supply" && !query.asset) {
    sendV2Error(res, 400, "missing_param", "supply requires an asset parameter");
    return;
  }
  if (query.groupBy !== undefined && !GROUP_BY[metric]?.includes(query.groupBy)) {
    sendV2Error(res, 400, "invalid_param", `groupBy must be one of: ${GROUP_BY[metric].join(", ")}`);
    return;
  }
  if ((query.groupBy === "asset" && query.asset) || (query.groupBy === "chain" && query.chain)) {
    sendV2Error(res, 400, "invalid_combination", `cannot scope and group by ${query.groupBy}`);
    return;
  }
  if (metric === "volume" && query.groupBy === "pegCurrency" && query.asset) {
    sendV2Error(res, 400, "invalid_combination", "asset scope with groupBy=pegCurrency is not supported (an asset has a single peg currency)");
    return;
  }
  for (const key of ["start", "end"]) {
    if (query[key] === undefined) continue;
    if (!/^\d+$/.test(query[key]) || Number(query[key]) > MAX_SAFE) {
      sendV2Error(res, 400, "invalid_param", `${key} must be a Unix-seconds integer`);
      return;
    }
  }
  if (query.start !== undefined && query.end !== undefined && Number(query.start) > Number(query.end)) {
    sendV2Error(res, 400, "invalid_range", "start must be <= end");
    return;
  }
  if (query.resolution !== undefined && !["daily", "weekly", "monthly"].includes(query.resolution)) {
    sendV2Error(res, 400, "invalid_param", "resolution must be daily, weekly or monthly");
    return;
  }
  if (query.includeUnreleased !== undefined && !["true", "false"].includes(query.includeUnreleased)) {
    sendV2Error(res, 400, "invalid_param", "includeUnreleased must be true or false");
    return;
  }

  // canonicalize: lowercase slugs, fixed order, defaults elided -> one CDN entry per resource
  const canonical: Query = {};
  for (const key of PARAM_ORDER) {
    if (query[key] === undefined) continue;
    let value = query[key];
    if (key === "asset" || key === "chain") {
      value = value.toLowerCase();
      if (!SAFE_SLUG.test(value)) {
        sendV2Error(res, 400, "invalid_param", `${key} is not a valid slug`);
        return;
      }
    }
    if (key === "resolution" && value === "daily") continue;
    if (key === "includeUnreleased" && value === "false") continue;
    canonical[key] = value;
  }
  const canonicalQs = Object.entries(canonical)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  const rawQs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?") + 1) : "";
  if (rawQs !== canonicalQs) {
    sendV2Redirect(res, req.path + (canonicalQs ? `?${canonicalQs}` : ""));
    return;
  }
  return canonical;
}

// resolves an asset slug; responds 404 and returns undefined when unknown
function resolveAsset(res: HyperExpress.Response, slug: string) {
  const info = assetRegistry().bySlug.get(slug);
  if (!info) sendV2Error(res, 404, "not_found", `unknown asset "${slug}"`);
  return info;
}

// chain identity: union of the `chains` snapshot and market-cap per-chain files; cached per build epoch
let chainSlugCache: { epoch: number; slugs: Set<string> } | null = null;
async function knownChains(gate: Gate): Promise<Set<string>> {
  if (chainSlugCache?.epoch === gate.manifest.generatedAt) return chainSlugCache.slugs;
  const entry = await loadV2File("chains");
  const slugs = new Set<string>();
  if (entry) for (const c of parsedOf(entry).chains ?? []) if (c?.slug) slugs.add(c.slug);
  chainSlugCache = { epoch: gate.manifest.generatedAt, slugs };
  return slugs;
}
async function chainExists(slug: string, gate: Gate): Promise<boolean> {
  if ((await knownChains(gate)).has(slug)) return true;
  return (await loadV2File(`history/market-cap/daily/total-chain/${slug}`)) !== null;
}

async function serveHistory(
  req: HyperExpress.Request,
  res: HyperExpress.Response,
  filePath: string,
  query: Query,
  { extractChainSlug, unit, gate }: { extractChainSlug?: string; unit: string; gate: Gate }
) {
  const entry = await loadV2File(filePath);
  if (!entry) {
    // scope was validated so the entity exists
    return sendV2Error(res, 503, "data_unavailable", `the last build did not produce data for this request (${filePath})`);
  }
  const start = query.start !== undefined ? Number(query.start) : undefined;
  const end = query.end !== undefined ? Number(query.end) : undefined;

  if (extractChainSlug === undefined && start === undefined && end === undefined) {
    return sendV2Entry(req, res, entry, "history", gate);
  }

  // unknown chain must 404, not return empty
  if (extractChainSlug !== undefined && !(parsedOf(entry).series ?? []).some((s: any) => s.slug === extractChainSlug)) {
    if (!(await chainExists(extractChainSlug, gate))) return sendV2Error(res, 404, "not_found", `unknown chain "${extractChainSlug}"`);
  }

  const discriminator = `${filePath}|${extractChainSlug ?? ""}|${start ?? ""}|${end ?? ""}|${unit}`;
  return sendV2Sliced(req, res, entry, discriminator, "history", gate, (epoch) => {
    const parsed = parsedOf(entry);
    const outUnit = parsed.unit ?? unit;
    if (extractChainSlug !== undefined) {
      const series = (parsed.series ?? []).find((s: any) => s.slug === extractChainSlug);
      return { generatedAt: epoch, unit: outUnit, data: series ? sliceTuples(series.data, start, end) : [] };
    }
    if (parsed.data) return { generatedAt: epoch, unit: outUnit, data: sliceTuples(parsed.data, start, end) };
    return { generatedAt: epoch, unit: outUnit, series: (parsed.series ?? []).map((s: any) => ({ ...s, data: sliceTuples(s.data, start, end) })) };
  });
}

export function setV2Routes(router: HyperExpress.Router) {
  const resolutionOf = (query: Query): Resolution => (query.resolution as Resolution) ?? "daily";

  router.get("/v2/assets", v2Wrapper(async (req: any, res: any) => {
    const query = validate(req, res, "assets", ["chain"]);
    if (!query) return;
    const gate = await buildGate(res);
    if (!gate) return;

    const file = query.chain ? `assets-chain/${query.chain}` : "assets";
    const entry = await loadV2File(file);
    if (!entry) {
      if (query.chain) return sendV2Error(res, 404, "not_found", `unknown chain "${query.chain}"`);
      return sendV2Error(res, 503, "data_unavailable", "the last build did not produce the asset snapshot");
    }

    return sendV2Entry(req, res, entry, "current", gate);
  }));

  router.get("/v2/assets/:asset", v2Wrapper(async (req: any, res: any) => {
    if (Object.keys(req.query ?? {}).length) return sendV2Error(res, 400, "unknown_param", "this endpoint takes no query parameters");

    const rawSlug = decodeURIComponent(req.path_parameters.asset);
    const slug = rawSlug.toLowerCase();
    if (slug !== rawSlug) return sendV2Redirect(res, `/v2/assets/${encodeURIComponent(slug)}`);

    const info = resolveAsset(res, slug);
    if (!info) return;
    const gate = await buildGate(res);
    if (!gate) return;

    const entry = await loadV2File(`asset/${info.slug}`);
    // the asset is in the registry
    if (!entry) return sendV2Error(res, 503, "data_unavailable", `the last build did not produce data for asset "${slug}"`);

    return sendV2Entry(req, res, entry, "current", gate);
  }));

  router.get("/v2/chains", v2Wrapper(async (req: any, res: any) => {
    if (Object.keys(req.query ?? {}).length) return sendV2Error(res, 400, "unknown_param", "this endpoint takes no query parameters");
    const gate = await buildGate(res);
    if (!gate) return;

    const entry = await loadV2File("chains");
    if (!entry) return sendV2Error(res, 503, "data_unavailable", "the last build did not produce the chains snapshot");

    return sendV2Entry(req, res, entry, "current", gate);
  }));

  router.get("/v2/history/market-cap", v2Wrapper(async (req: any, res: any) => {
    const query = validate(req, res, "market-cap", ["asset", "chain", "groupBy", "start", "end", "resolution"]);
    if (!query) return;
    const gate = await buildGate(res);
    if (!gate) return;

    const res_ = resolutionOf(query);
    if (query.asset && !resolveAsset(res, query.asset)) return;

    const base = `history/market-cap/${res_}`;
    if (query.chain && !(await chainExists(query.chain, gate))) return sendV2Error(res, 404, "not_found", `unknown chain "${query.chain}"`);

    if (query.groupBy === "asset") {
      return serveHistory(req, res, query.chain ? `${base}/by-asset-chain/${query.chain}` : `${base}/by-asset`, query, { unit: "usd", gate });
    }

    if (query.groupBy === "chain") {
      const file = query.asset ? `${base}/by-chain-asset/${query.asset}` : `${base}/by-chain`;
      return serveHistory(req, res, file, query, { unit: "usd", gate });
    }

    if (query.asset && query.chain) {
      return serveHistory(req, res, `${base}/by-chain-asset/${query.asset}`, query, { extractChainSlug: query.chain, unit: "usd", gate });
    }

    if (query.asset) return serveHistory(req, res, `${base}/total-asset/${query.asset}`, query, { unit: "usd", gate });

    if (query.chain) return serveHistory(req, res, `${base}/total-chain/${query.chain}`, query, { unit: "usd", gate });

    return serveHistory(req, res, `${base}/total`, query, { unit: "usd", gate });
  }));

  router.get("/v2/history/volume", v2Wrapper(async (req: any, res: any) => {
    const query = validate(req, res, "volume", ["asset", "chain", "groupBy", "start", "end", "resolution"]);
    if (!query) return;
    const gate = await buildGate(res);
    if (!gate) return;

    const res_ = resolutionOf(query);
    if (query.asset && !resolveAsset(res, query.asset)) return;

    if (query.chain && !(await chainExists(query.chain, gate))) return sendV2Error(res, 404, "not_found", `unknown chain "${query.chain}"`);

    const base = `history/volume/${res_}`;
    if (query.groupBy === "pegCurrency") {
      const file = query.chain ? `${base}/chain/${query.chain}/by-pegcurrency` : `${base}/by-pegcurrency`;
      return serveHistory(req, res, file, query, { unit: "usd", gate });
    }

    if (query.groupBy === "asset") {
      const file = query.chain ? `${base}/chain/${query.chain}/by-asset` : `${base}/by-asset`;
      return serveHistory(req, res, file, query, { unit: "usd", gate });
    }

    if (query.groupBy === "chain") {
      const file = query.asset ? `${base}/asset/${query.asset}/by-chain` : `${base}/by-chain`;
      return serveHistory(req, res, file, query, { unit: "usd", gate });
    }

    if (query.asset && query.chain) {
      return serveHistory(req, res, `${base}/asset/${query.asset}/by-chain`, query, { extractChainSlug: query.chain, unit: "usd", gate });
    }

    if (query.asset) return serveHistory(req, res, `${base}/asset/${query.asset}/total`, query, { unit: "usd", gate });

    if (query.chain) return serveHistory(req, res, `${base}/chain/${query.chain}/total`, query, { unit: "usd", gate });

    return serveHistory(req, res, `${base}/total`, query, { unit: "usd", gate });
  }));

  router.get("/v2/history/supply", v2Wrapper(async (req: any, res: any) => {
    const query = validate(req, res, "supply", ["asset", "chain", "groupBy", "includeUnreleased", "start", "end", "resolution"]);
    if (!query) return;
    const gate = await buildGate(res);
    if (!gate) return;

    const res_ = resolutionOf(query);
    const info = resolveAsset(res, query.asset);
    if (!info) return;

    const suffix = query.includeUnreleased === "true" ? "-unreleased" : "";
    const base = `history/supply/${res_}/${info.slug}`;

    if (query.groupBy === "chain") return serveHistory(req, res, `${base}/by-chain${suffix}`, query, { unit: "count", gate });

    if (query.chain) return serveHistory(req, res, `${base}/by-chain${suffix}`, query, { extractChainSlug: query.chain, unit: "count", gate });

    return serveHistory(req, res, `${base}/total${suffix}`, query, { unit: "count", gate });
  }));
}
