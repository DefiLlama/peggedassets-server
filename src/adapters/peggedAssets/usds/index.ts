import { addChainExports,solanaMintedOrBridged } from "../helper/getSupply";
import {  PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts = {
    ethereum: {
      issued: ["0xdC035D45d973E3EC169d2276DDab16f1e407384F"],
    },
  };
  
  
  const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts),
   
    solana: {
      ethereum: solanaMintedOrBridged(["USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA"]),
    },
  };
  
  export default adapter; 