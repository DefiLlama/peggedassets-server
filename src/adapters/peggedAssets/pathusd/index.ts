// pathUSD is the first native TIP-20 stablecoin on Tempo, predeployed at
// genesis at the canonical address below. It is the chain's quote-token of
// last resort and the default fee token for users who haven't explicitly
// configured one.
//
//   Predeploy: https://docs.tempo.xyz/quickstart/predeployed-contracts
//   Token list: https://tokenlist.tempo.xyz/list/4217 (entry "PathUSD")
//
// Supply tracking: pathUSD implements the standard TIP-20 totalSupply()
// (semantically identical to ERC-20). Burn-blocked balances stay in
// totalSupply() until explicitly burned via burnBlocked(); pause does not
// reduce supply. addChainExports wraps balanceOf/totalSupply correctly.
const chainContracts = {
  tempo: {
    issued: ["0x20c0000000000000000000000000000000000000"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
