const sdk = require('@defillama/sdk')
const api = new sdk.ChainApi({ chain: 'tron'})

async function getTotalSupply(token) {
  const supply = await api.call({ target: token, abi: 'erc20:totalSupply' })
  const decimals = await api.call({ target: token, abi: 'erc20:decimals' })
  return supply / 10 ** decimals;
}

async function getTokenBalance(token, account) {
  const balance = await api.call({ target: token, abi: 'erc20:balanceOf', params: [account]})
  const decimals = await api.call({ target: token, abi: 'erc20:decimals' })
  return balance / 10 ** decimals;
}

module.exports = {
  getTokenBalance,
  getTotalSupply,
};
