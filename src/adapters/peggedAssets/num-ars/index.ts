import sdk from "@defillama/sdk"
import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type"
import { sumSingleBalance } from "../helper/generalUtil"
import { mergeBalances } from "@defillama/sdk/build/generalUtil"



const NUARS_ADDRESS = "0x65517425ac3ce259a34400bb67ceb39ff3ddc0bd"
const NUARS = {
    target: NUARS_ADDRESS,
    decimals: 18
}

const MINTED_NOT_ISSUED_WALLET = "0x8388A0f91875e74Dc4705Abf2C9bBDD1bD40C585"
const DISTRIBUTOR_WALLET = "0xe5Fa666D84661D47D0891ee2f48BB666481973e0"
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const minted = async () => {
    const {output: minted} = await sdk.api.erc20.totalSupply(NUARS)
    const balances = {} as Balances
    
    sumSingleBalance(
        balances,
        'peggedVAR',
        minted,
        "issued",
        false
    )

    return balances
}

const unreleased = async () => {
    const {output: minted_not_issued_balance} = await sdk.api.erc20.balanceOf({
        owner: MINTED_NOT_ISSUED_WALLET,
        ...NUARS
    })
    const {output: distributor_balance} = await sdk.api.erc20.balanceOf({
        owner: DISTRIBUTOR_WALLET,
        ...NUARS
    })
    const {output: burned_balance} = await sdk.api.erc20.balanceOf({
        owner: ZERO_ADDRESS,
        ...NUARS
    })

    let not_issued_balances = {} as Balances
    let distributor_balances = {} as Balances
    let burned_balances = {} as Balances

    sumSingleBalance(
        not_issued_balances,
        'peggedVAR',
        minted_not_issued_balance,
        "not_issued",
        false
    )
    sumSingleBalance(
        distributor_balances,
        'peggedVAR',
        distributor_balance,
        "not_issued",
        false
    )
    sumSingleBalance(
        burned_balances,
        'peggedVAR',
        burned_balance,
        "burnt",
        false
    )

    let total_balances = {} as Balances

    mergeBalances(total_balances, not_issued_balances)
    mergeBalances(total_balances, distributor_balances)
    mergeBalances(total_balances, burned_balances)

    return total_balances
}

const adapter: PeggedIssuanceAdapter = {
    ['polygon'] : {
        minted,
        unreleased
    }
}

export default adapter