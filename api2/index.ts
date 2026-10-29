import express, { NextFunction, Request, Response } from "express";
import { Server } from "http";
import { initCache } from "./cache";
import setRoutes from "./routes";
import { setupHealthRoutes } from "./routes/healthz";
import { errorResponse } from "./routes/utils";
import process from "process";
import fs from 'fs'

const webserver = express()
// keep hyper-express behavior: no etag/x-powered-by headers, case sensitive routes, no optional trailing slash
webserver.disable('x-powered-by')
webserver.disable('etag')
webserver.enable('case sensitive routing')
webserver.enable('strict routing')
let server: Server | undefined

const port = +(process.env.PORT ?? 5001)

async function main() {
  console.time('Api Server init')
  webserver.use((_req, res, next) => {
    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    next();
  });

  await Promise.all([
    initCache(),
  ])

  const router = express.Router({ caseSensitive: true, strict: true })
  webserver.use(router)

  setRoutes(router)
  webserver.get('/hash', (_req, res) => res.send(process.env.CURRENT_COMMIT_HASH))
  setupHealthRoutes(webserver)

  // express default error handler sends the stack trace (e.g. on malformed url encoding) unless NODE_ENV=production
  webserver.use((e: any, _req: Request, res: Response, _next: NextFunction) => errorResponse(res, 'Invalid request', { statusCode: e.status ?? 500 }))

  server = webserver.listen(port, (e?: Error) => {
    if (e) return console.log('Failed to start webserver on port ' + port, e)
    console.timeEnd('Api Server init')
    console.log('Webserver started on port ' + port)
    try {
      const currentCommitHash = fs.readFileSync(__dirname + '/../../.current_commit_hash', 'utf8')
      process.env.CURRENT_COMMIT_HASH = currentCommitHash
      console.log('current code hash: ', currentCommitHash)
      fs.writeFileSync(__dirname + '/../../.safe_commit_hash', currentCommitHash)
    } catch (e) { }
    process.send?.('ready') // only set when started by pm2 (IPC channel)
  })
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (e) => {
  console.error('Uncaught exception', e)
  shutdown()
})

function shutdown() {
  console.log('Shutting down gracefully...');
  setTimeout(() => process.exit(0), 5000); // wait 5 seconds before forcing shutdown
  server?.close(() => {
    console.log('Server has been shut down gracefully');
    process.exit(0);
  })
}

main()
