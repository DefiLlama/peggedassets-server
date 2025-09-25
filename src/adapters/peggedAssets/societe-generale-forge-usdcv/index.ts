const sdk = require("@defillama/sdk");
import {Balances, ChainBlocks, PeggedAssetType, PeggedIssuanceAdapter} from "../peggedAsset.type";
import {chainContracts} from "../societe-generale-forge-eurcv/config";
import {getTokenBalance as solanaGetTokenBalance, getTokenSupply as solanaGetTokenSupply} from "../helper/solana";
import {sumSingleBalance} from "../helper/generalUtil";



async function chainMinted(chain: string, decimals: number) {
    return async function (
        _timestamp: number,
        _ethBlock: number,
        _chainBlocks: ChainBlocks
    ) {
        let balances = {} as Balances;
        for (let issued of chainContracts[chain].issued) {
            const totalSupply = (
                await sdk.api.abi.call({
                    abi: "erc20:totalSupply",
                    target: issued,
                    block: _chainBlocks?.[chain],
                    chain: chain,
                })
            ).output;
            sumSingleBalance(
                balances,
                "peggedUSD",
                totalSupply / 10 ** decimals,
                "issued",
                false
            );
        }
        return balances;
    };
}

async function chainUnreleased(chain: string, decimals: number, owner: string) {
    return async function (
        _timestamp: number,
        _ethBlock: number,
        _chainBlocks: ChainBlocks
    ) {
        let balances = {} as Balances;
        for (let issued of chainContracts[chain].issued) {
            const reserve = (
                await sdk.api.erc20.balanceOf({
                    target: issued,
                    owner: owner,
                    block: _chainBlocks?.[chain],
                    chain: chain,
                })
            ).output;
            sumSingleBalance(balances, "peggedUSD", reserve / 10 ** decimals, "issued", false);
        }
        return balances;
    };
}

export function solanaMintedOrBridged(
    targets: string[]
) {
    return async function (
        _timestamp: number,
        _ethBlock: number,
        _chainBlocks: ChainBlocks
    ) {
        let balances = {} as Balances;
        for (let target of targets) {
            const totalSupply = await solanaGetTokenSupply(target);
            sumSingleBalance(balances, "peggedUSD", totalSupply, target, false);
        }
        return balances;
    };
}

async function solanaUnreleased() {
    return async function (
        _timestamp: number,
        _ethBlock: number,
        _chainBlocks: ChainBlocks
    ) {
        let balances = {} as Balances;
        for (let unreleasedAddress of chainContracts["solana"].unreleased) {
            sumSingleBalance(balances, "peggedUSD", await solanaGetTokenBalance(
                chainContracts["solana"].issued[0],
                unreleasedAddress
            ),unreleasedAddress, false);
        }
        return balances;
    };
}

const adapter: PeggedIssuanceAdapter = {
    ethereum: {
        minted: chainMinted("ethereum", 18),
        unreleased: chainUnreleased(
            "ethereum",
            18,
            chainContracts.ethereum.unreleased[0]
        ),
    },
    solana: {
        minted: solanaMintedOrBridged(chainContracts.solana.issued),
        unreleased: solanaUnreleased()
    },
}

export default adapter;