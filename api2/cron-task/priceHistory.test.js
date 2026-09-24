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

test('chart uses the hourly price and balance without changing cached daily or hourly records', () => {
  setPriceCache()
  const dailyBalance = { SK: day, totalCirculating: { circulating: { peggedUSD: 100 }, unreleased: { peggedUSD: 0 } } }
  const hourlyBalance = { SK: day + 3600, totalCirculating: { circulating: { peggedUSD: 150 }, unreleased: { peggedUSD: 0 } } }
  cache.peggedAssetsData['1'] = {
    balances: [dailyBalance],
    lastBalance: hourlyBalance,
  }
  const chart = craftChartsResponse({ assetChainMap: { '1': new Set(['ethereum']) } })
  assert.deepEqual(chart[0].totalCirculating, { peggedUSD: 150 })
  assert.deepEqual(chart[0].totalCirculatingUSD, { peggedUSD: 300 })
  assert.deepEqual(cache.peggedAssetsData['1'].balances, [dailyBalance])
  assert.equal(cache.peggedAssetsData['1'].balances[0].SK, day)
  assert.equal(cache.peggedAssetsData['1'].balances[0].totalCirculating.circulating.peggedUSD, 100)
  assert.equal(cache.peggedAssetsData['1'].lastBalance.SK, day + 3600)
  assert.equal(cache.peggedAssetsData['1'].lastBalance.totalCirculating.circulating.peggedUSD, 150)
  assertCanonicalPricesUnchanged()
})

test('price response handles an empty daily history without changing the hourly record', () => {
  setPriceCache()
  cache.historicalPrices = []
  assert.deepEqual(craftStablecoinPricesResponse(), [])
  assert.deepEqual(cache.lastPrices, { PK: 'hourly', SK: day + 3600, prices: { tether: 2 } })
})
