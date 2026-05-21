import * as HyperExpress from "hyper-express";
import { getLastRecord, hourlyPeggedBalances } from "../../src/peggedAssets/utils/getLastRecord";
import { getCurrentUnixTimestamp } from "../../src/utils/date";

export function setupHealthRoutes(webserver: HyperExpress.Server) {
  const HEALTHZ_TOKEN = process.env.HEALTHZ_TOKEN;

  webserver.get('/healthz/hourly', async (req, res) => {
    if (HEALTHZ_TOKEN && req.headers['x-healthz-token'] !== HEALTHZ_TOKEN) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    try {
      const [tether, usdc] = await Promise.all([
        getLastRecord(hourlyPeggedBalances("1")),
        getLastRecord(hourlyPeggedBalances("2")),
      ]);
      const now = getCurrentUnixTimestamp();
      const ageMin = (item: any) =>
        item?.SK ? Math.floor((now - item.SK) / 60) : null;

      res.setHeader('Cache-Control', 'no-store, max-age=0');
      res.json({
        now,
        tether: { latestSK: tether?.SK ?? null, ageMinutes: ageMin(tether) },
        usdc:   { latestSK: usdc?.SK   ?? null, ageMinutes: ageMin(usdc) },
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message ?? String(e) });
    }
  });
}
