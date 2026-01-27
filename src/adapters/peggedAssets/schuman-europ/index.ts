const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x888883b5F5D21fb10Dfeb70e8f9722B9FB0E5E51"],
  },
  polygon: {
    issued: ["0x888883b5F5D21fb10Dfeb70e8f9722B9FB0E5E51"],
  },
  avax: {
    issued: ["0x8835a2f66a7aaccb297cb985831a616b75e2e16c"],
  },
  plasma: {
    issued: ["0x98658Bd74EF231158Cadc21d8AbA733a4E947e6a"],
  },
};



import { addChainExports } from "../helper/getSupply";
import { ChainContracts } from "../peggedAsset.type";
export default addChainExports(chainContracts, undefined, { pegType: 'peggedEUR'});
