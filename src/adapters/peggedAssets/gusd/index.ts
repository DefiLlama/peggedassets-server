import { addChainExports } from '../helper/getSupply'
import { PeggedIssuanceAdapter } from '../peggedAsset.type'

const chainContracts = {
  ethereum: {
    issued: ['0xaf6186b3521b60e27396b5d23b48abc34bf585c5'], // GUSD
  }
}

const adapter: PeggedIssuanceAdapter = addChainExports(chainContracts)

export default adapter
