import { addChainExports,solanaMintedOrBridged } from "../helper/getSupply";
import {  PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts = {
    ethereum: {
      issued: ["0xdC035D45d973E3EC169d2276DDab16f1e407384F"],
    },
    base: {
      issued: ["0x820c137fa70c8691f0e44dc420a5e53c168921dc"],
    },
    arbitrum: {
      bridgedFromETH: ["0x6491c05A82219b8D1479057361ff1654749b876b"],
    },
  };
  
  
  const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts),
   
    solana: {
      ethereum: solanaMintedOrBridged(["USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA"]),
    },
  };
  
  export default adapter; 