const chainContracts = {
    ethereum: {
        issued: ["0xab5eb14c09d416f0ac63661e57edb7aecdb9befa"]
    },
    optimism: {
        issued : "0x9dabae7274d28a45f0b65bf8ed201a5731492ca0",
    },
    base: {
        issued: ["0x526728dbc96689597f85ae4cd716d4f7fccbae9d"],
      },
    plasma: {
        issued: ["0x29ad7fe4516909b9e498b5a65339e54791293234"],
      },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;