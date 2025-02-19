import { addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

const adapter: PeggedIssuanceAdapter = {
    ...addChainExports({
        arbitrum: {
            issued: ["0x2Ea0bE86990E8Dac0D09e4316Bb92086F304622d"]
        }
    })
}

export default adapter; 
