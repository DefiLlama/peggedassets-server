// import { addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter, Balances } from "../peggedAsset.type";
import { function_view } from "../helper/aptos";

const WEUSD_MODULE_ADDRESS = "0xed805e77c40d7e6ac5cd3e67514c485176621a2aa21e860cd515121d44a2f83d";

async function movementSupply(): Promise<Balances> {
  const balances = {} as Balances;
  
  const resp = await function_view({
    functionStr: `${WEUSD_MODULE_ADDRESS}::weusd::total_supply`,
    type_arguments: [],
    args: [],
  });
  
  balances["peggedUSD"] = Number(resp) / 1e6;
  
  return balances;
}

// const chainContracts = {
//   ethereum: {
//     issued: ["0xcacd6fd266af91b8aed52accc382b4e165586e29"],
//   },
//   base: {
//     issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
//   },
//   arbitrum: {
//     issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
//   },
//   bsc: {
//     issued: "0x80eede496655fb9047dd39d9f418d5483ed600df",
//   },
// };

const adapter: PeggedIssuanceAdapter = {
  // ...addChainExports(chainContracts),
  move: {
    minted: movementSupply,
  }
};

export default adapter; 
