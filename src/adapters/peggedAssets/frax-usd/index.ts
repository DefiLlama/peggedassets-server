import { addChainExports,solanaMintedOrBridged } from "../helper/getSupply";
import {  PeggedIssuanceAdapter } from "../peggedAsset.type";
import { function_view } from "../helper/aptos";
import { Balances } from "../peggedAsset.type";
 
 async function moveSupply(): Promise<Balances> {
   const balances = {} as Balances;
   
   const resp = await function_view({
     functionStr: '0x1::fungible_asset::supply',
     type_arguments: ['0x1::object::ObjectCore'],
     args: ["0xe4354602aa4311f36240dd57f3f3435ffccdbd0cd2963f1a69da39a2dbcd59b5"],
   });
   balances["peggedUSD"] = Number(resp.vec[0]) / 1e6;
 
   return balances;
 }

const chainContracts = {
  ethereum: {
    issued: ["0xcacd6fd266af91b8aed52accc382b4e165586e29"],
  },
  fraxtal: {
    issued: ["0xfc00000000000000000000000000000000000001"],
  },
  blast: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  arbitrum: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  optimism: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  bsc: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  ink: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  sonic: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  mode: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  // metis: {
  //   issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  // },
  sei: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  xlayer: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  avax: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  polygon: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
  polygon_zkevm: {
    issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),

  move: {
    minted: moveSupply,
  }
};

export default adapter; 


// frxUSD, use LayerZero OFT (Mint-Burn) Modal to bridge 