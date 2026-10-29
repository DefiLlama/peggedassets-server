import { Request, Response } from "express";
import * as sdk from '@defillama/sdk'

function getTimeInFutureMinutes(minutes: number) {
  const date = new Date();
  // add five minutes to the current time
  date.setMinutes(date.getMinutes() + minutes);
  return date.toUTCString()
}

export function successResponse(res: Response, data: any, cacheMinutes: number = 30, {
  isJson = true,
  isPost = false,
} = {}) {
  res.set({
    "Expires": getTimeInFutureMinutes(cacheMinutes) // cache for 5 minutes
  })
  if (isPost)
    res.removeHeader("Expires")
  
  isJson ? res.json(data) : res.send(data)
}

export function errorResponse(res: Response, data: any = 'Internal server error', {
  statusCode = 400,
} = {}) {
  res.status(statusCode).send(data)
}

export function errorWrapper(routeFn: any) {
  return async (req: Request, res: Response) => {
    try {
      await routeFn(req, res)
    } catch (e) {
      sdk.log(e)
      return res.status(500).send('Internal Error')
    }
  }
}