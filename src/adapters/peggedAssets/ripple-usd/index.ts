import { sumSingleBalance } from "../helper/generalUtil";
import { addChainExports } from "../helper/getSupply";
import { Balances, ChainContracts, ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

const NODE_URL = "https://xrplcluster.com";

export async function rippleMinted(
  _timestamp: number,
  _ethBlock: number,
  _chainBlocks: ChainBlocks
): Promise<Balances> {
  const balances = {} as Balances;

  const address = "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De";
  const tokenCurrency = "524C555344000000000000000000000000000000";

  const payload = {
    method: "gateway_balances",
    params: [
      {
        account: address,
        ledger_index: "validated",
      },
    ],
  };

  const res = await retry(async (_bail: any) => axios.post(NODE_URL, payload));

  const supplyStr = res.data.result.obligations[tokenCurrency];
  const supply = parseFloat(supplyStr);

  sumSingleBalance(balances, "peggedUSD", supply, "issued");

  return balances;
}

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x8292bb45bf1ee4d140127049757c2e0ff06317ed"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined),

  ripple: {
    minted: rippleMinted,
  },
};

export default adapter;