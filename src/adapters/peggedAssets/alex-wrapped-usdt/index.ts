import {getTotalSupply} from "../helper/stacks"

const adapter = {
  stacks: {
    minted: () => getTotalSupply('SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-susdt', 8)
  },
};

export default adapter;
