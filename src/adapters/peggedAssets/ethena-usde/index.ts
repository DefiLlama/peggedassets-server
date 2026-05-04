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
  move: {
    bridgedFromETH: "0x9d146a4c9472a7e7b0dbc72da0eafb02b54173a956ef22a9fba29756f8661c6c",
  },
  tempo: {
    issued: ["0x20c0000000000000000000002f52d5cc21a3207b"], // USDe on Tempo Mainnet (Stargate Hydra OFT, decimals=6)
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
