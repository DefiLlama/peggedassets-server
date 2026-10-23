import { addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

// QVTX USD (QUSD), issued by QUANTVESTRIX, INC.
// Two issuances share the ticker: the cascade coin and the corridor coin. Both are counted
// where they carry supply. The corridor deployments on Base and Arbitrum are intentionally
// omitted - they are live contracts holding 0.00, and the BSC corridor holds 0.25, so
// including them would add rows that track nothing.
const chainContracts = {
  polygon: {
    issued: [
      "0xA225D99ED91c3592bE1396324B81A52A184b30E2", // cascade
      "0xb57bf3c50f20096723b46645f741f632aef220fa", // corridor
    ],
  },
  bsc: {
    issued: [
      "0x5a8BA77Fcc84f6766f6EB54477149C7b9Aa0A2fa", // cascade
    ],
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
};

export default adapter;
