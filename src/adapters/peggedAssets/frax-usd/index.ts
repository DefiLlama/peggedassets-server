import { addChainExports,solanaMintedOrBridged } from "../helper/getSupply";
import {  PeggedIssuanceAdapter } from "../peggedAsset.type";
import { function_view } from "../helper/aptos";
import { Balances, ChainBlocks } from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
const sdk = require("@defillama/sdk");
 
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

async function ethereumMinted() {
  return async function(_: any, _1: any, chainBlocks: ChainBlocks) {
    let balances = {} as Balances;
    
    // Get total supply from the issued contract
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.ethereum.issued[0],
        block: chainBlocks?.["ethereum"],
        chain: "ethereum",
      })
    ).output;
    
    // Get balance of the address to subtract
    const balanceToSubtract = (
      await sdk.api.erc20.balanceOf({
        target: chainContracts.ethereum.issued[0],
        owner: "0x34c0bd5877a5ee7099d0f5688d65f4bb9158bde2",
        block: chainBlocks?.["ethereum"],
        chain: "ethereum",
      })
    ).output;
    
    // Calculate net supply (total - balance to subtract)
    const netSupply = (Number(totalSupply) - Number(balanceToSubtract)) / 1e18;
    
    sumSingleBalance(balances, "peggedUSD", netSupply, "issued", false);
    return balances;
  };
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
  base: {
    issued: "0xe5020A6d073a794B6E7f05678707dE47986Fb0b6",
  },
  katana: {
    issued: "0x80Eede496655FB9047dd39d9f418d5483ED600df",
  },
  solana: {
    issued: "GzX1ireZDU865FiMaKrdVB1H6AE8LAqWYCg6chrMrfBw",
  },
  linea: {
    issued: "0xC7346783f5e645aa998B106Ef9E7f499528673D8",
  },
  unichain: {
    issued: "0x80Eede496655FB9047dd39d9f418d5483ED600df",
  },
  plume_mainnet: {
    issued: "0x80Eede496655FB9047dd39d9f418d5483ED600df",
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),

  ethereum: {
    minted: ethereumMinted(),
  },
  move: {
    minted: moveSupply,
  },
  solana: {
    minted: solanaMintedOrBridged([chainContracts.solana.issued], "peggedUSD"),
  },
};

export default adapter; 


// frxUSD, use LayerZero OFT (Mint-Burn) Modal to bridge 