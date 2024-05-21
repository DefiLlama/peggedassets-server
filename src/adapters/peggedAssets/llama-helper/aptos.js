const axios = require("axios");

const endpoint = 'https://aptos-mainnet.pontem.network';

async function getTokenSupply(token) {
  const { data } = await axios.get(`${endpoint}/v1/accounts/${token}/resources`);
  const coinInfo = data.find((coin) => coin.type.startsWith('0x1::coin::CoinInfo'));

  return coinInfo.data.supply.vec[0].integer.vec[0].value / 10 ** coinInfo.data.decimals;
}

module.exports = {
  getTokenSupply,
};
