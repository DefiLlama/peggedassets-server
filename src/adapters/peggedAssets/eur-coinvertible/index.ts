const sdk = require("@defillama/sdk");
import { Balances, ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
import { chainContracts } from "../eur-coinvertible/config";
import { sumSingleBalance } from "../helper/generalUtil";
import { solanaMintedOrBridged } from "../helper/getSupply";
import { getTokenBalance } from "../helper/solana";

const getChainBalance =
  (chain: string, decimals: number, type: "minted" | "unreleased", owner?: string) =>
  async (_ts: number, _ethBlock: number, chainBlocks: ChainBlocks) => {
    const balances: Balances = {};
    for (const token of chainContracts[chain].issued) {
      const value =
        type === "minted"
          ? (
              await sdk.api.abi.call({
                abi: "erc20:totalSupply",
                target: token,
                block: chainBlocks[chain],
                chain,
              })
            ).output
          : (
              await sdk.api.erc20.balanceOf({
                target: token,
                owner: owner!,
                block: chainBlocks[chain],
                chain,
              })
            ).output;
      sumSingleBalance(balances, "peggedEUR", +value / 10 ** decimals, "issued", false);
    }
    return balances;
  };


const solanaUnreleased = async () => {
  const balances: Balances = {};
  for (const addr of chainContracts.solana.unreleased) {
    const amount = await getTokenBalance(chainContracts.solana.issued[0], addr);
    sumSingleBalance(balances, "peggedEUR", amount, addr, false);
  }
  return balances;
};

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: getChainBalance("ethereum", 18, "minted"),
    unreleased: getChainBalance("ethereum", 18, "unreleased", chainContracts.ethereum.unreleased[0]),
  },
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued, "peggedEUR"),
    unreleased: () => solanaUnreleased(),
  },
};

export default adapter;