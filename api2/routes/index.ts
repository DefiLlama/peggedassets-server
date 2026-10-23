
import { Request, Response, Router } from "express";
import { successResponse, errorResponse, errorWrapper as ew } from "./utils";
import { readRouteData } from "../file-cache";
import { normalizeChain } from "../../src/utils/normalizeChain";
import { chainCacheSlug } from "../utils/cachePath";

const ACCEL_PREFIX = '/_internal/cache'
const behindNginx = !!process.env.API_STORAGE_HOST

// express decodes path params (%2f -> /), so only allow chars used by chain labels, token symbols and ids
// e.g. "Arbitrum Nova", "re.al", "USD+", "ETH:GUSDTQ", "plume-(deprecated)"
const VALID_PARAM = /^(?!\.+$)[\w .:+()-]+$/
const PATH_PARAMS = ['stablecoin', 'peggedID', 'chain', 'token']

const breakdownData: {
  [chain: string]: any
} = {}

export default function setRoutes(router: Router) {

  for (const param of PATH_PARAMS)
    router.param(param, (_req, res, next, value) => VALID_PARAM.test(value) ? next() : errorResponse(res, 'Invalid request'))

  router.get("/config", defaultFileHandler);
  router.get("/rates", defaultFileHandler);
  router.get("/stablecoinprices", defaultFileHandler);
  router.get("/stablecoinchains", defaultFileHandler);
  router.get("/stablecoins", defaultFileHandler);
  router.get("/stablecoin/:stablecoin", defaultFileHandler);

  router.get("/charts/all/:peggedID", ew(async (req: any, res: any) => {
    let { peggedID } = req.params;
    peggedID = normalizeChain(peggedID)
    return fileResponse('/charts/all/' + peggedID, res);
  }))

  router.get("/charts/:chain", ew(async (req: any, res: any) => {
    let { chain } = req.params;
    chain = chainCacheSlug(chain)
    return fileResponse('/charts/' + chain, res);
  }))

  router.get("/stablecoindominance/:chain", ew(async (req: any, res: any) => {
    let { chain } = req.params;
    chain = chainCacheSlug(chain)
    return fileResponse('/stablecoindominance/' + chain, res);
  }))
  router.get("/stablecoincharts2/:chain", ew(async (req: any, res: any) => {
    let { chain } = req.params;
    chain = chainCacheSlug(chain)
    return fileResponse('/stablecoincharts2/' + chain, res);
  }));

  router.get("/chart/volume", ew(async (req: any, res: any) => fileResponse('/volume/chart-total', res)));
  router.get("/chart/volume/chain-breakdown", ew(async (req: any, res: any) => fileResponse('/volume/chart-total-chain-breakdown', res)));
  router.get("/chart/volume/token-breakdown", ew(async (req: any, res: any) => fileResponse('/volume/chart-total-token-breakdown', res)));
  router.get("/chart/volume/currency-breakdown", ew(async (req: any, res: any) => fileResponse('/volume/chart-total-currency-breakdown', res)));
  router.get("/chart/volume/chain/:chain", ew(async (req: any, res: any) => {
    const chain = chainCacheSlug(req.params.chain);
    return fileResponse(`/volume/chart-chain-${chain}`, res);
  }));
  router.get("/chart/volume/chain/:chain/token-breakdown", ew(async (req: any, res: any) => {
    const chain = chainCacheSlug(req.params.chain);
    return fileResponse(`/volume/chart-chain-${chain}-token-breakdown`, res);
  }));
  router.get("/chart/volume/chain/:chain/currency-breakdown", ew(async (req: any, res: any) => {
    const chain = chainCacheSlug(req.params.chain);
    return fileResponse(`/volume/chart-chain-${chain}-currency-breakdown`, res);
  }));
  router.get("/chart/volume/token/:token", ew(async (req: any, res: any) => {
    const { token } = req.params;
    return fileResponse(`/volume/chart-token-${token}`, res);
  }));
  router.get("/chart/volume/token/:token/chain-breakdown", ew(async (req: any, res: any) => {
    const { token } = req.params;
    return fileResponse(`/volume/chart-token-${token}-chain-breakdown`, res);
  }));

  // TOO: nuke this route to reduce load on the server
  router.get("/stablecoincharts/:chain", ew(async (req: any, res: any) => {
    let { chain } = req.params
    let { stablecoin, starts, startts } = req.query
    chain = chainCacheSlug(chain)
    if (!stablecoin) return fileResponse('/stablecoincharts/' + chain, res);
    const startTimestamp = starts ?? startts

    let data = []
    try {
      if (!breakdownData[chain]) {
        breakdownData[chain] = readRouteData('stablecoincharts2/' + chain)
        breakdownData[chain] = (await breakdownData[chain] as any).breakdown || {}
      }
      data = breakdownData[chain][stablecoin]
    } catch (e) {
      console.error(e)
    }


    if (startTimestamp)
      data = (data as any).filter((d: any) => d.timestamp >= startTimestamp)

    return successResponse(res, data);
  }));

  function defaultFileHandler(req: Request, res: Response) {
    const fullPath = req.path;
    return fileResponse(fullPath, res);
  }

  async function fileResponse(filePath: string, res: Response) {

    res.setHeader('Content-Type', 'application/json')

    if (behindNginx) {
      res.setHeader('X-Accel-Redirect', ACCEL_PREFIX + filePath)
      return res.status(200).send('')
    }

    try {
      res.set('Cache-Control', 'public, max-age=1800'); // Set caching to 30 minutes
      res.json(await readRouteData(filePath))
    } catch (e) {
      return errorResponse(res, 'Invalid request', { statusCode: 404 })
    }
  }

}
