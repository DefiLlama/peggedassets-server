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
    berachain: {
      issued: ["0xff12470a969Dd362EB6595FFB44C82c959Fe9ACc"]
    },
    mantle: {
      issued: ["0x075df695b8E7f4361FA7F8c1426C63f11B06e326"]
    },
    base: {
      issued: ["0x2840f9d9f96321435ab0f977e7fdbf32ea8b304f"]
    },
    era: {
      issued: ["0xB8d7d88D042880aE87Bb61DE2dFFF8441768766D"]
    },
    sei: {
      issued: ["0xff12470a969dd362eb6595ffb44c82c959fe9acc"]
    }
  };


const adapter: PeggedIssuanceAdapter = {
    ...addChainExports(chainContracts),
};

export default adapter;
