const test = require('node:test')
const assert = require('node:assert/strict')
const { cache } = require('../cache.ts')
const { craftStablecoinPricesResponse } = require('./getStablecoinPrices.ts')
const { craftChartsResponse } = require('./storeCharts.ts')

const day = 1761091200

function setPriceCache() {
  cache.historicalPrices = [{ PK: 'daily', SK: day, prices: { coin: 1 } }]
  cache.lastPrices = { PK: 'hourly', SK: day + 3600, prices: { coin: 2 } }
  cache.priceTimestamps = [day]
  cache.peggedAssetsData = {}
}

function assertCanonicalPricesUnchanged() {
  assert.deepEqual(cache.historicalPrices, [{ PK: 'daily', SK: day, prices: { coin: 1 } }])
  assert.deepEqual(cache.lastPrices, { PK: 'hourly', SK: day + 3600, prices: { coin: 2 } })
}

test('price response presents the latest hour without changing cached daily history', () => {
  setPriceCache()
  const response = craftStablecoinPricesResponse()
  assert.deepEqual(response, [{ date: day, prices: { coin: 2 } }])
  assertCanonicalPricesUnchanged()
})

test('chart construction leaves the shared daily and hourly price records intact', () => {
  setPriceCache()
  craftChartsResponse({ assetChainMap: {} })
  assertCanonicalPricesUnchanged()
})

test('price response handles an empty daily history without changing the hourly record', () => {
  setPriceCache()
  cache.historicalPrices = []
  assert.deepEqual(craftStablecoinPricesResponse(), [])
  assert.deepEqual(cache.lastPrices, { PK: 'hourly', SK: day + 3600, prices: { coin: 2 } })
})
