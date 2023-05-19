import SDK from "@defillama/sdk"
const sdk: typeof SDK = require("@defillama/sdk")
import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type"
import { sumSingleBalance, mergeBalances } from "../helper/generalUtil"

const NUARS_ADDRESS = "0x65517425ac3ce259a34400bb67ceb39ff3ddc0bd"
const NUARS = {
    target: NUARS_ADDRESS,
    decimals: 18,
    chain: 'polygon'
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
        parseFloat(minted),
        "issued",
        false
    )

    console.log(balances)

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
        parseFloat(minted_not_issued_balance),
        "not_issued",
        false
    )
    sumSingleBalance(
        distributor_balances,
        'peggedVAR',
        parseFloat(distributor_balance),
        "not_issued",
        false
    )
    sumSingleBalance(
        burned_balances,
        'peggedVAR',
        parseFloat(burned_balance),
        "burnt",
        false
    )

    let total_balances = {} as Balances

    mergeBalances(total_balances, 'peggedVAR', not_issued_balances)
    mergeBalances(total_balances, 'peggedVAR', distributor_balances)
    mergeBalances(total_balances, 'peggedVAR', burned_balances)

    console.log(not_issued_balances)
    console.log(distributor_balances)
    console.log(burned_balances)

    return total_balances
}

const adapter: PeggedIssuanceAdapter = {
    polygon : {
        minted,
        unreleased
    }
}

export default adapter