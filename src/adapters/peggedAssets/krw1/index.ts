import { addChainExports } from "../helper/getSupply";

// Track the production contract reconciled to the issuer's transparency report.
// Older multichain proof-of-concept deployments are intentionally excluded.
const chainContracts = {
  ethereum: {
    issued: ["0xb83fc84df7028251066c25f5d61d12fd9d9c8be4"],
  },
};

const adapter = addChainExports(chainContracts, undefined, {
  pegType: "peggedKRW",
});

export default adapter;
