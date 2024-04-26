const sdk = require('@defillama/sdk')

export async function getTotalSupply(address: string) {
  const api = new sdk.ChainApi({ chain: 'kava' })
  const supply = await api.call({  abi: 'erc20:totalSupply', target: address})
  const decimals = await api.call({  abi: 'erc20:decimals', target: address})
  return supply / 10 ** decimals;
}
