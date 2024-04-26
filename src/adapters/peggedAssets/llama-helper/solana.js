const axios = require("axios");

const endpoint = process.env.SOLANA_RPC ?? "https://api.mainnet-beta.solana.com";

async function getTokenSupply(token) {
  const tokenSupply = await axios.post(endpoint, {
    jsonrpc: "2.0",
    id: 1,
    method: "getTokenSupply",
    params: [token],
  });
  return tokenSupply.data.result.value.uiAmount;
}

async function getTokenBalance(token, account) {
  const tokenBalance = await axios.post(endpoint, {
    jsonrpc: "2.0",
    id: 1,
    method: "getTokenAccountsByOwner",
    params: [
      account,
      {
        mint: token,
      },
      {
        encoding: "jsonParsed",
      },
    ],
  });
  return tokenBalance.data.result.value.reduce(
    (total, account) =>
      total + account.account.data.parsed.info.tokenAmount.uiAmount,
    0
  );
}

module.exports = {
  getTokenSupply,
  getTokenBalance,
  endpoint
};
