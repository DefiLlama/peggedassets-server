const axios = require('axios');
const BigNumber = require('bignumber.js');

const SOLIDWALLET_ENDPOINT = 'https://ctz.solidwallet.io/api/v3';

const hexToDecimal = (hexString) => {
    return new BigNumber(hexString).div(10**18).toFixed(0)
};

// This function takes the network id as an argument and returns the total supply of bnUSD minted on the external chain
async function getXSupply(net) {
  const GET_X_SUPPLY = {
    "id": new Date().getTime(),
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

  try {
    const { data: { result: supply } } = await axios.post(SOLIDWALLET_ENDPOINT, GET_X_SUPPLY, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!supply) {
      throw new Error('No result found');
    }

    return hexToDecimal(supply);
  } catch (error) {
    console.error("Error fetching total supply:", error);
    throw error; 
  }
}

// This function returns the total supply of bnUSD minted on ICON
async function getICONSupply() {
    const GET_ICON_SUPPLY = {
      "id": new Date().getTime(),
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
  
    try {
      const { data: { result: supply } } = await axios.post(SOLIDWALLET_ENDPOINT, GET_ICON_SUPPLY, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!supply) {
        throw new Error('No result found');
      }

      return hexToDecimal(supply);
    } catch (error) {
      console.error("Error fetching total supply:", error);
      throw error; 
    }
}

module.exports = {
  getXSupply,
  getICONSupply
};
