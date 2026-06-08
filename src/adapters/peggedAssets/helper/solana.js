const axios = require("axios");

const endpoint = process.env.SOLANA_RPC ?? "https://api.mainnet-beta.solana.com"
const getEndpoints = {
  solana: () => process.env.SOLANA_RPC ?? "https://api.mainnet-beta.solana.com",
  fogo: () => process.env.FOGO_RPC ?? "https://mainnet.fogo.io",
}

async function getTokenSupply(token, chain = "solana") {
  const endpoint = getEndpoints[chain]();
  const tokenSupply = await axios.post(endpoint, {
    jsonrpc: "2.0",
    id: 1,
    method: "getTokenSupply",
    params: [token],
  });
  return tokenSupply.data.result.value.uiAmount;
}

async function getTokenBalance(token, account, chain = "solana") {
  const endpoint = getEndpoints[chain]();
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
  const accounts = tokenBalance.data.result.value;
  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error(`Solana RPC returned empty token accounts for owner ${account} (mint: ${token})`);
  }
  return accounts.reduce(
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
