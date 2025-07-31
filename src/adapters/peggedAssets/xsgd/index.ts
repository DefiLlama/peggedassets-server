import { addChainExports } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, ChainContracts, ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

const chainContracts: ChainContracts = {
    ethereum: {
      issued: ["0x70e8de73ce538da2beed35d14187f6959a8eca96"]
    },
    arbitrum :{
      issued: ["0xe333e7754a2dc1e020a162ecab019254b9dab653"]
    },
    avax :{
      issued: ["0xb2f85b7ab3c2b6f62df06de6ae7d09c010a5096e"]
    },
    polygon: {
      issued: ["0xdc3326e71d45186f113a2f448984ca0e8d201995"]
    }
};

async function rippleMinted() {
  return async function (  ) {
    const balances = {} as Balances;
    
    const NODE_URL = "https://xrplcluster.com";
    const address = "rK67JczCpaYXVtfw3qJVmqwpSfa1bYTptw";
    const tokenCurrency = "5853474400000000000000000000000000000000"; // XSGD currency code
    
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
    
    if (res.data.result && res.data.result.obligations && res.data.result.obligations[tokenCurrency]) {
      const supplyStr = res.data.result.obligations[tokenCurrency];
      const supply = parseFloat(supplyStr);
      sumSingleBalance(balances, "peggedSGD", supply, "issued", false);
    }
    
    return balances;
  };
}

async function hederaMinted() {
  return async function (  ) {
    const balances = {} as Balances;
    const tokenId = "0.0.1985922"; // XSGD token on Hedera
    const decimals = 6;
    const url = `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${tokenId}`;
    const issuance = await retry(async (_bail: any) => axios.get(url));
    const supply = issuance?.data?.total_supply;
    if (supply) {
      const balance = parseFloat(supply) / 10 ** decimals;
      sumSingleBalance(balances, "peggedSGD", balance, "issued", false);
    }
    return balances;
  };
}

async function zilliqaMinted() {
  return async function (  ) {
    const balances = {} as Balances;
    
    // XSGD proxy contract address
    const proxyAddress = "0x173ca6770aa56eb00511dac8e6e13b3d7f16a5a5";
    
    const res = await axios.post("https://api.zilliqa.com/", {
      id: "1",
      jsonrpc: "2.0",
      method: "GetSmartContractState",
      params: [proxyAddress]
    });
    
    const state = res.data.result;
    const totalSupply = state.total_supply;
    
    if (totalSupply) {
      const supply = Number(totalSupply) / 1e6; // XSGD uses 6 decimals
      sumSingleBalance(balances, "peggedSGD", supply, "issued", false);
    }
    
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined, { decimals: 6, pegType: "peggedSGD"}),

  zilliqa: {
    minted: zilliqaMinted(),
  },

  ripple: {
    minted: rippleMinted(),
  },

  hedera: {
    minted: hederaMinted(),
  },
};

export default adapter;