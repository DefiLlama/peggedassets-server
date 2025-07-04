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
    optimism: {
      issued: ["0x4F13a96EC5C4Cf34e442b46Bbd98a0791F20edC3"],
    },
    unichain: {
      issued: ["0x7E10036Acc4B56d4dFCa3b77810356CE52313F9C"],
    },
  };
  
  
  const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts),
   
    solana: {
      ethereum: solanaMintedOrBridged(["USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA"]),
    },
  };
  
  export default adapter; 
