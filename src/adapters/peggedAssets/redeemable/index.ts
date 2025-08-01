import { addChainExports } from "../helper/getSupply";

const assetIDs = {
  cardano: {
    issued: [
      "cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc678652656465656d61626c65",
    ],
  },
};

export default addChainExports(assetIDs)