const { chains } = require("@defillama/sdk");

// total supply of a mint as a ui amount (number); `<CHAIN>_RPC` env overrides the endpoint
async function getTokenSupply(token, chain = "solana") {
  const { uiAmount } = await chains.svm.getTokenSupply({ chain, token });
  return uiAmount;
}

// ui amount (number) of `token` held by `account`, summed over all of its token accounts
async function getTokenBalance(token, account, chain = "solana") {
  const accounts = await chains.svm.getTokenAccountsByOwner({ chain, owner: account, mint: token });
  if (!accounts.length) {
    // getSupply.ts string-matches this message to treat an empty reserve as 0
    throw new Error(`Solana RPC returned empty token accounts for owner ${account} (mint: ${token})`);
  }
  return accounts.reduce((total, i) => total + i.uiAmount, 0);
}

module.exports = {
  getTokenSupply,
  getTokenBalance,
};
