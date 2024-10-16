import axios from 'axios';
import { sumSingleBalance } from './generalUtil';


const SOLIDWALLET_ENDPOINT = 'https://ctz.solidwallet.io/api/v3';

const hexToDecimal = (hexString: any) => hexString / 1e18

// This function takes the network id as an argument and returns the total supply of bnUSD minted on the external chain
export async function getXSupply(net: any) {
  const GET_X_SUPPLY = {
    "id": "1",
    "jsonrpc": "2.0",
    "method": "icx_call",
    "params": {
      "to": "cx88fd7df7ddff82f7cc735c871dc519838cb235bb", // bnUSD contract address
      "dataType": "call",
      "data": {
        "method": "xSupply", // Method to get the native bnUSD supply minted on external chain
        "params": {
          "net": net, // Network id to get the supply from
        }
      }
    }
  };

  const { data: { result: supply } } = await axios.post(SOLIDWALLET_ENDPOINT, GET_X_SUPPLY);


  let balances = {}
  sumSingleBalance(balances, "peggedUSD", hexToDecimal(supply), "issued", false);
  return balances;
}

// This function returns the total supply of bnUSD minted on ICON
export async function getICONSupply() {
  const GET_ICON_SUPPLY = {
    "id": "1",
    "jsonrpc": "2.0",
    "method": "icx_call",
    "params": {
      "to": "cx88fd7df7ddff82f7cc735c871dc519838cb235bb", // bnUSD contract address
      "dataType": "call",
      "data": {
        "method": "totalSupply", // Method to get the native bnUSD supply minted on ICON
      }
    }
  };

  const { data: { result: supply } } = await axios.post(SOLIDWALLET_ENDPOINT, GET_ICON_SUPPLY);

  let balances = {}
  sumSingleBalance(balances, "peggedUSD", hexToDecimal(supply), "issued", false);
  return balances;
}
