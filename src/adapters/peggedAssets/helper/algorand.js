// documentation: https://developer.algorand.org/docs/get-details/indexer/
// `ALGORAND_INDEXER` env overrides the indexer url; requests are rate limited by the sdk

const { chains } = require("@defillama/sdk");
const { algorand } = chains;

/**
 * `{ application }`, the raw indexer response shape
 * @param {number | string} appId
 * @returns {Promise<any>}
 */
async function lookupApplications(appId) {
  return { application: await algorand.lookupApplication({ appId }) }
}

/**
 * `{ account }`, the raw indexer response shape (`account` is undefined for unknown addresses)
 * @param {string} address
 * @returns {Promise<any>}
 */
async function lookupAccountByID(address) {
  return { account: await algorand.lookupAccount({ address }) }
}

/** @returns {Promise<any>} one page: `{ accounts, 'next-token' }` */
async function searchAccounts({ appId, limit = 1000, nexttoken, }) {
  return algorand.searchAccounts({ appId, limit, nextToken: nexttoken })
}

module.exports = {
  getApplicationAddress: algorand.getApplicationAddress,
  lookupApplications,
  lookupAccountByID,
  searchAccounts,
}
