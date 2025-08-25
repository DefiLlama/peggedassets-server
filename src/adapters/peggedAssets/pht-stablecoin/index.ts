const sdk = require("@defillama/sdk");
import { addChainExports } from "../helper/getSupply";
import {
  ChainBlocks,
  ChainContracts,
  PeggedIssuanceAdapter
} from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xBe370Ad45D44eB45174C4Ec60b88839feF32C077"],
  },
  polygon: {
    bridgedFromETH: ["0xe75220cB014Dfb2D354bb59be26d7458bB8d0706"],
  },
  tron: {
    bridgedFromETH: ["TXdN5fvFjCdqjWJRvWmBzSRLBN7JLYmmrs"],
  }
};

export default addChainExports(chainContracts, undefined, { decimals: 18, pegType: "peggedVAR" });