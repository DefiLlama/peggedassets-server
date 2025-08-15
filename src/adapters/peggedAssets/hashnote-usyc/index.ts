const chainContracts = {
  ethereum: {
    issued: ["0x136471a34f6ef19fe571effc1ca711fdb8e49f2b"],
  },
  bsc: {
    issued: ["0x8d0fa28f221eb5735bc71d3a0da67ee5bc821311"],
  }
};

// the USYC listing is flagged as doublecounted: true since 97% of it's supply sits in the Usual USD0 treasury: https://etherscan.io/address/0xdd82875f0840aad58a455a70b88eed9f59cec7c7 with a tiny amount also held in zoth zeusd

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;