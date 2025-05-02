import { addChainExports,solanaMintedOrBridged, tonTokenSupply } from "../helper/getSupply";
import {  PeggedIssuanceAdapter } from "../peggedAsset.type";
import { function_view } from "../helper/aptos";
import { Balances } from "../peggedAsset.type";

 async function moveSupply(): Promise<Balances> {
   const balances = {} as Balances;
   
   const resp = await function_view({
     functionStr: '0x1::fungible_asset::supply',
     type_arguments: ['0x1::object::ObjectCore'],
     args: [chainContracts.move.bridgedFromETH[0]],
   });
   balances["peggedUSD"] = Number(resp.vec[0]) / 1e6;
 
   return balances;
 }

const chainContracts = {
  ethereum: {
    issued: ["0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"],
  },
  mantle: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  blast: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  arbitrum: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  optimism: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  base: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  era: {
    bridgedFromETH: "0x39Fe7a0DACcE31Bd90418e3e659fb0b5f0B3Db0d",
  },
  bsc: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  linea: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  manta: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  scroll: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  fraxtal: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  mode: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  metis: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  kava: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  xlayer: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  berachain: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  zircuit: {
    bridgedFromETH: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  move: {
    bridgedFromETH: "0x9d146a4c9472a7e7b0dbc72da0eafb02b54173a956ef22a9fba29756f8661c6c",
  },
  
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
 
  solana: {
    ethereum: solanaMintedOrBridged(["DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT"]),
  },
  move: {
    ethereum: moveSupply,
  },
  ton: {
    ethereum: tonTokenSupply("EQAIb6KmdfdDR7CN1GBqVJuP25iCnLKCvBlJ07Evuu2dzP5f"),
  },
};

export default adapter; 
