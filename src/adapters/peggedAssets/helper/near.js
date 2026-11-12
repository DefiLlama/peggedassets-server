const { recordContract } = require("../../../peggedAssets/utils/contractRecorder");
const { chains } = require("@defillama/sdk");

// view call; returns the JSON decoded result (`NEAR_RPC` env overrides the endpoint list)
async function call(contract, method, args = {}) {
  if (/total_supply/.test(method)) recordContract(contract);
  return chains.near.call({ contract, method, args });
}

module.exports = {
  call,
};
