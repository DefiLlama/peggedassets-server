import {  PeggedIssuanceAdapter } from "../peggedAsset.type";
import { function_view } from "../helper/aptos";
import { Balances } from "../peggedAsset.type";

 async function moveSupply(): Promise<Balances> {
   const balances = {} as Balances;
   
   const resp = await function_view({
     functionStr: '0x1::fungible_asset::supply',
     type_arguments: ['0x1::object::ObjectCore'],
     args: ["0x7c9d9f4972072b6ff7dfa48f259688e7286abac9ebd192bbda30fea910139024"],
   });
   balances["peggedUSD"] = Number(resp.vec[0]) / 1e6;
 
   return balances;
 }



const adapter: PeggedIssuanceAdapter = {
  move: {
    minted: moveSupply,
  },
};

export default adapter;