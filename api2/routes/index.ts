
import * as HyperExpress from "hyper-express";
import { successResponse, errorResponse, errorWrapper as ew } from "./utils";
import { readRouteData } from "../file-cache";
import { normalizeChain } from "../../src/utils/normalizeChain";

const ACCEL_PREFIX = '/_internal/cache'
const behindNginx = !!process.env.API_STORAGE_HOST

const breakdownData: {
  [chain: string]: any
} = {}

export default function setRoutes(router: HyperExpress.Router) {

  router.get("/config", defaultFileHandler);
  router.get("/rates", defaultFileHandler);
  router.get("/stablecoinprices", defaultFileHandler);
  router.get("/stablecoinchains", defaultFileHandler);
  router.get("/stablecoins", defaultFileHandler);
  router.get("/stablecoin/:stablecoin", defaultFileHandler);

  router.get("/charts/all/:peggedID", ew(async (req: any, res: any) => {
    let { peggedID } = req.path_parameters;
    peggedID = normalizeChain(peggedID)
    return fileResponse('/charts/all/' + peggedID, res);
  }))

  router.get("/charts/:chain", ew(async (req: any, res: any) => {
    let { chain } = req.path_parameters;
    chain = normalizeChain(chain)
    return fileResponse('/charts/' + chain, res);
  }))

  router.get("/stablecoindominance/:chain", ew(async (req: any, res: any) => {
    let { chain } = req.path_parameters;
    chain = normalizeChain(chain)
    return fileResponse('/stablecoindominance/' + chain, res);
  }))
  router.get("/stablecoincharts2/:chain", ew(async (req: any, res: any) => {
    let { chain } = req.path_parameters;
    chain = decodeURIComponent(chain)
    chain = normalizeChain(chain)
    return fileResponse('/stablecoincharts2/' + chain, res);
  }));

  // TOO: nuke this route to reduce load on the server
  router.get("/stablecoincharts/:chain", ew(async (req: any, res: any) => {
    let { chain } = req.path_parameters
    chain = decodeURIComponent(chain)
    let { stablecoin, starts, startts } = req.query
    chain = normalizeChain(chain)
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

  function defaultFileHandler(req: HyperExpress.Request, res: HyperExpress.Response) {
    const fullPath = req.path;
    return fileResponse(fullPath, res);
  }

  async function fileResponse(filePath: string, res: HyperExpress.Response) {

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
