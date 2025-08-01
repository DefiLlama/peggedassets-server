const chainContracts = {
    ethereum: {
      issued: "0xde17a000ba631c5d7c2bd9fb692efea52d90dee2",
    },
};

import { addChainExports } from "../helper/getSupply";

const adapter = addChainExports(chainContracts);
export default adapter;
