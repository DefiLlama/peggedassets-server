import axios from "axios";

export async function getZilliqaTokenSupply(contract: string): Promise<number> {
  try {
    const res = await axios.post("https://api.zilliqa.com/", {
      id: "1",
      jsonrpc: "2.0",
      method: "GetSmartContractState",
      params: [contract]
    });
    
    const state = res.data.result;
    
    // First try to find total_supply field
    if (state.total_supply) {
      const decimals = state.decimals ? Number(state.decimals) : 6; // Default to 6 if not found
      return Number(state.total_supply) / Math.pow(10, decimals);
    }
    
    // Fallback: try to find a field that matches total supply
    const supplyKey = Object.keys(state).find(
      k => k.toLowerCase().includes("supply")
    );
    
    if (supplyKey) {
      const supplyRaw = state[supplyKey];
      const supply = typeof supplyRaw === "string" ? supplyRaw : supplyRaw._balance;
      if (supply) {
        const decimals = state.decimals ? Number(state.decimals) : 6; // Default to 6 if not found
        return Number(supply) / Math.pow(10, decimals);
      }
    }
    
    console.log(`Could not determine supply for Zilliqa contract ${contract}`);
    return 0;
    
  } catch (error: any) {
    console.log(`Error fetching Zilliqa supply for ${contract}:`, error.message);
    return 0;
  }
} 