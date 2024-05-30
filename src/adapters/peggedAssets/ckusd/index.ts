const axios = require("axios");
import {
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

async function fetchEthereumTotalSupply(): Promise<Balances> {
  let balances = {} as Balances;
  try {
    const url = 'https://xevnm-gaaaa-aaaar-qafnq-cai.raw.icp0.io/metrics';
    const response = await axios.get(url, { responseType: 'text' });
    const totalSupplyMatch = response.data.match(/ledger_total_supply\s+(\d+)/);
    if (!totalSupplyMatch) {
      throw new Error('Failed to extract ledger_total_supply from the API response');
    }

    const totalSupply = Number(totalSupplyMatch[1]);

    if (!isNaN(totalSupply)) {
      balances["peggedUSD"] = totalSupply / 1e6; // convert to correct unit
    } else {
      console.error("Error converting ledger total supply to a number:", totalSupplyMatch[1]);
    }
  } catch (error) {
    console.error("Error fetching Ethereum total supply:", error);
  }
  return balances;
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: fetchEthereumTotalSupply, 
  },
};

export default adapter;
