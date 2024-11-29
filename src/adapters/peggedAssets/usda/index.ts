import { addChainExports } from "../helper/getSupply";
import {  PeggedIssuanceAdapter } from "../peggedAsset.type";

// Avalon - USDa, use LayerZero OFT (Mint-Burn) Modal to bridge
const chainContracts = {
    ethereum: {
      issued: ["0x8A60E489004Ca22d775C5F2c657598278d17D9c2"],
    },
    bsc: {
      issued: ["0x9356086146be5158E98aD827E21b5cF944699894"],
    },
    taiko: {
      issued: ["0xff12470a969Dd362EB6595FFB44C82c959Fe9ACc"],
    },
  };


const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts),
};

export default adapter;
