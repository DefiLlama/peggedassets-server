import { addChainExports } from '../helper/getSupply'
import { PeggedIssuanceAdapter } from '../peggedAsset.type'

const chainContracts = {
  avax: {
    issued: ['0xDBc5192A6B6FfEe7451301bb4ec312f844F02B4A'], // UTY
  }
}

const adapter: PeggedIssuanceAdapter = addChainExports(chainContracts)

export default adapter
