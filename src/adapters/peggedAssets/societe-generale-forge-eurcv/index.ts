import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";
import { chainContracts } from "./config";
import { addChainExports } from "../helper/getSupply";
import { getTokenBalance as solanaGetTokenBalance } from "../helper/solana";
import { sumSingleBalance } from "../helper/generalUtil";
const axios = require("axios");
const retry = require("async-retry");

const XRPL_NODE_URL = "https://xrplcluster.com";
const STELLAR_EXPERT_API = "https://api.stellar.expert/explorer/public";

function solanaUnreleased() {
  return async function () {
    let balances = {} as Balances;
    for (const unreleasedAddress of chainContracts.solana.unreleased) {
      const balance = await solanaGetTokenBalance(
        chainContracts.solana.issued[0],
        unreleasedAddress
      );
      sumSingleBalance(balances, "peggedEUR", balance, unreleasedAddress, false);
    }
    return balances;
  };
}

async function rippleMinted() {
  const balances = {} as Balances;
  const [currencyCode, issuer] = chainContracts.ripple.issued[0].split(".");
  const response = await retry(() =>
    axios.post(XRPL_NODE_URL, {
      method: "gateway_balances",
      params: [{ account: issuer, ledger_index: "validated" }],
    })
  );
  const supply = Number(response.data.result?.obligations?.[currencyCode] ?? 0);

  sumSingleBalance(balances, "peggedEUR", supply, "issued", false);
  return balances;
}

async function stellarMinted() {
  const balances = {} as Balances;
  const contract = chainContracts.stellar.issued[0];
  const contractResponse = await retry(() =>
    axios.get(`${STELLAR_EXPERT_API}/contract/${contract}`)
  );
  const asset = contractResponse.data.asset;
  const assetResponse = await retry(() =>
    axios.get(`${STELLAR_EXPERT_API}/asset/${asset}`)
  );
  const supply =
    Number(assetResponse.data.supply) / 10 ** assetResponse.data.decimals;

  sumSingleBalance(balances, "peggedEUR", supply, "issued", false);
  return balances;
}

const adapter: PeggedIssuanceAdapter = addChainExports(
  chainContracts,
  {
    solana: {
      unreleased: solanaUnreleased(),
    },
    ripple: {
      minted: rippleMinted,
    },
    stellar: {
      minted: stellarMinted,
    },
  },
  { pegType: "peggedEUR" }
);

export default adapter;
