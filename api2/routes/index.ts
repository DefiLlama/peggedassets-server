
import * as HyperExpress from "hyper-express";
import { successResponse, errorResponse, errorWrapper as ew } from "./utils";
import { readRouteData } from "../file-cache";
import { normalizeChain } from "../../src/utils/normalizeChain";

export default function setRoutes(router: HyperExpress.Router) {

  router.get("/config", defaultFileHandler);
  router.get("/rates", defaultFileHandler);
  router.get("/stablecoin", defaultFileHandler);
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
  // router.get("/stablecoincharts2/all-llama-app", defaultFileHandler);
  // router.get("/stablecoincharts2/all-dominance-chain-breakdown", defaultFileHandler);
  // router.get("/stablecoincharts2/recent-protocol-data", defaultFileHandler);

  // TOO: nuke this route to reduce load on the server
  router.get("/stablecoincharts/:chain", ew(async (req: any, res: any) => {
    const { chain } = req.path_parameters;
    let { stablecoin, starts, startts } = req.query;
    const startTimestamp = starts ?? startts

    let data = { breakdown: {}, aggregated: [] }
    try {
      data = await readRouteData('stablecoincharts2/' + normalizeChain(chain))
    } catch (e) { }

    data = (stablecoin ? data.breakdown[stablecoin] : data.aggregated) ?? []

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
      res.json(await readRouteData(filePath))
    } catch (e) {
      console.error(e);
      return errorResponse(res, 'Internal server error', { statusCode: 500 })
    }
  }

}
