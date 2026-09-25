const { chains } = require("@defillama/sdk");
const { starknet } = chains;

// Cairo 0 style ERC20 abis (balanceOf / totalSupply / decimals ...), same shape as the old local copy
const defaultAbis = starknet.erc20Abis;

// `STARKNET_RPC` env overrides the endpoint list; the sdk serialises requests (STARKNET_RPC_CONCURRENCY)
async function call({ abi, target, params = [], allAbi = [] } = {}) {
  return starknet.call({ abi, target, params, allAbi });
}

async function multiCall({ abi, target, calls = [], allAbi = [] }) {
  return starknet.multiCall({ abi, target, calls, allAbi });
}

async function getTotalSupply(tokenAddress) {
  const decimals = await call({ target: tokenAddress, abi: defaultAbis.decimals, });
  const supply = await call({ target: tokenAddress, abi: defaultAbis.totalSupply, });
  return supply / 10 ** decimals;
}

async function getUnreleased({ issued, unreleased, balances, sumSingleBalance, pegType }) {
  for (const tokenAddress of issued) {
    const decimals = await call({ target: tokenAddress, abi: defaultAbis.decimals, });
    for (const unreleasedAddress of unreleased) {
      const balance = await call({ target: tokenAddress, abi: defaultAbis.balanceOf, params: [unreleasedAddress], });
      console.log(`Starknet - unreleased balance of token ${tokenAddress} in account ${unreleasedAddress}: ${balance / 10 ** decimals}`);
      sumSingleBalance(balances, pegType, balance / 10 ** decimals, 'unreleased', false);
    }
  }
  return balances
}

module.exports = {
  call,
  multiCall,
  getTotalSupply,
  getUnreleased,
  parseAddress: starknet.validateAndParseAddress,
  number: starknet.number,
};
