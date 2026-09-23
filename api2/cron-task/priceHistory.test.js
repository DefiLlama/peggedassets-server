const test = require('node:test')
const assert = require('node:assert/strict')
const { cache } = require('../cache.ts')
const { craftStablecoinPricesResponse } = require('./getStablecoinPrices.ts')
const { craftChartsResponse } = require('./storeCharts.ts')

const day = 1761091200

function setPriceCache() {
  cache.historicalPrices = [{ PK: 'daily', SK: day, prices: { tether: 1 } }]
  cache.lastPrices = { PK: 'hourly', SK: day + 3600, prices: { tether: 2 } }
  cache.priceTimestamps = [day]
  cache.peggedAssetsData = {}
}

function assertCanonicalPricesUnchanged() {
  assert.deepEqual(cache.historicalPrices, [{ PK: 'daily', SK: day, prices: { tether: 1 } }])
  assert.deepEqual(cache.lastPrices, { PK: 'hourly', SK: day + 3600, prices: { tether: 2 } })
}

test('price response presents the latest hour without changing cached daily history', () => {
  setPriceCache()
  const response = craftStablecoinPricesResponse()
  assert.deepEqual(response, [{ date: day, prices: { tether: 2 } }])
  assertCanonicalPricesUnchanged()
})

test('chart construction leaves the shared daily and hourly price records intact', () => {
  setPriceCache()
  cache.peggedAssetsData['1'] = {
    balances: [{ SK: day, totalCirculating: { circulating: { peggedUSD: 100 }, unreleased: { peggedUSD: 0 } } }],
  }
  const chart = craftChartsResponse({ assetChainMap: { '1': new Set(['ethereum']) } })
  assert.deepEqual(chart[0].totalCirculatingUSD, { peggedUSD: 200 })
  assertCanonicalPricesUnchanged()
})

test('price response handles an empty daily history without changing the hourly record', () => {
  setPriceCache()
  cache.historicalPrices = []
  assert.deepEqual(craftStablecoinPricesResponse(), [])
  assert.deepEqual(cache.lastPrices, { PK: 'hourly', SK: day + 3600, prices: { tether: 2 } })
})
