const sdk = require('@defillama/sdk')

// a fresh api per call: a module level ChainApi would pin the block/timestamp of the first run
const getApi = () => new sdk.ChainApi({ chain: 'tron' })

async function getTotalSupply(token) {
  const api = getApi()
  const supply = await api.call({ target: token, abi: 'erc20:totalSupply' })
  const decimals = await api.call({ target: token, abi: 'erc20:decimals' })
  return supply / 10 ** decimals;
}

async function getTokenBalance(token, account) {
  const api = getApi()
  const balance = await api.call({ target: token, abi: 'erc20:balanceOf', params: [account] })
  const decimals = await api.call({ target: token, abi: 'erc20:decimals' })
  return balance / 10 ** decimals;
}

module.exports = {
  getTokenBalance,
  getTotalSupply,
};
