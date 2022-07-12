const TronWeb = require("tronweb");

const apiKeys = [
  "a4e25c66-b143-4d0b-91d2-0d9b2371d397",
  "1b2f1df4-c5bd-40b4-b416-118d7d6d3b51",
  "394bfb17-915c-4e38-82b0-61be1f8213c0",
];

const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  headers: { "TRON-PRO-API-KEY": apiKeys[Math.floor(Math.random() * 3)] },
});
tronWeb.setAddress("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");

async function unverifiedCall(contract, functionSelector, parameter) {
  var options = {};
  transaction = await tronWeb.transactionBuilder.triggerConstantContract(
    contract,
    functionSelector,
    options,
    parameter
  );
  return tronWeb.BigNumber("0x" + transaction["constant_result"][0]);
}

function getUnverifiedTokenBalance(token, account) {
  return unverifiedCall(token, "balanceOf(address)", [
    {
      type: "address",
      value: account,
    },
  ]);
}

async function getTotalSupply(token) {
  const contract = await tronWeb.contract().at(token);
  const [totalSupply, decimals] = await Promise.all([
    contract.totalSupply().call(),
    contract.decimals().call(),
  ]);
  return Number(totalSupply.toString() / 10 ** decimals);
}

async function getTokenBalance(token, account) {
  const contract = await tronWeb.contract().at(token);
  const [balance, decimals] = await Promise.all([
    contract.balanceOf
      ? contract.balanceOf(account).call()
      : getUnverifiedTokenBalance(token, account),
    contract.decimals
      ? contract.decimals().call()
      : unverifiedCall(token, "decimals()", []),
  ]);
  return Number(balance.toString()) / 10 ** decimals;
}

function getTrxBalance(account) {
  return tronWeb.trx.getAccount(account).then((response) => response.balance);
}

module.exports = {
  getTokenBalance,
  getTrxBalance,
  getUnverifiedTokenBalance,
  unverifiedCall,
  getTotalSupply,
};
