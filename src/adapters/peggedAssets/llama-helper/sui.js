const axios = require("axios");

const endpoint = "https://fullnode.mainnet.sui.io/";

async function getTokenSupply(token) {
  const { data: { result: { decimals } } } = await axios.post(endpoint, {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "suix_getCoinMetadata",
    "params": [token]
  });
  const { data: { result: { value: supply } } } = await axios.post(endpoint, {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "suix_getTotalSupply",
    "params": [token]
  });
  return supply / 10 ** decimals;
}

module.exports = {
  getTokenSupply,
};
