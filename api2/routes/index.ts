
import * as HyperExpress from "hyper-express";
import { successResponse, errorResponse, errorWrapper as ew } from "./utils";
import { getRouteDataPath, readRouteData } from "../file-cache";
import { normalizeChain } from "../../src/utils/normalizeChain";
import { createReadStream } from 'fs'

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

  router.get("/stablecoindominance/:chain", ew(async (req: any, res: any) => {
    let { chain } = req.path_parameters;
    chain = normalizeChain(chain)
    return fileResponse('/stablecoindominance/' + chain, res);
  }))
  router.get("/stablecoincharts2/:chain", ew(async (req: any, res: any) => {
    let { chain } = req.path_parameters;
    chain = normalizeChain(chain)
    return fileResponse('/stablecoincharts2/' + chain, res);
  }));

  // TOO: nuke this route to reduce load on the server
  router.get("/stablecoincharts/:chain", ew(async (req: any, res: any) => {
    let { chain } = req.path_parameters;
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
    try {
      res.set('Cache-Control', 'public, max-age=1800'); // Set caching to 30 minutes
      // set response headers as json
      res.setHeader('Content-Type', 'application/json');
      // res.json(await readRouteData(filePath))
      const fileStream = createReadStream(getRouteDataPath(filePath))
      fileStream.pipe(res)
    } catch (e) {
      console.error(e);
      return errorResponse(res, 'Internal server error', { statusCode: 500 })
    }
  }

}
