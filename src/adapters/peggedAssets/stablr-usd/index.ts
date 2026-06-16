import { ChainApi } from "@defillama/sdk";
import { addChainExports } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";

const CONFIG = {
  issuedAddress: "0x7B43E3875440B44613DC3bC08E7763e6Da63C8f8",
  // Bounds of the known hacker activity window. Mints inside this window
  // are treated as malicious.
  HACK_FROM_BLOCK: 25161408,
  HACK_TO_BLOCK: 25172000,
  // Addresses known to be controlled by the hacker (EOA + identified recipients).
  // Any mint to one of these is flagged as malicious regardless of block.
  // Extend as more recipient addresses are identified off-chain.
  BLACKLISTED_RECIPIENTS: [
    "0xd4677b5a8b1b97ea213fdb876b0fcbab3f9f6cd1",
  ],

  TOPICS: {
    // Transfer(address indexed from, address indexed to, uint256 value)
    TRANSFER: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    ZERO: "0x0000000000000000000000000000000000000000000000000000000000000000",
    // DestroyedBlockedFunds(address indexed _blockedUser, uint256 _balance) —
    // USDT-style owner clawback that decrements totalSupply without emitting Transfer.
    DESTROYED_BLOCKED_FUNDS: "0x6a2859ae7902313752498feb80a014e6e7275fe964c79aa965db815db1c7f1e9",
  },
};

const chainContracts = {
  ethereum: {
    issued: [CONFIG.issuedAddress],
  },
};

// const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedUSD" });
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedUSD" });

adapter.ethereum.minted = async (api: ChainApi) => {
  const balances = {} as any;
  const currentBlock = (await api.getBlock()) - 100;

  const [supply, mintLogs, destroyedLogs] = await Promise.all([
    api.call({ abi: "erc20:totalSupply", target: CONFIG.issuedAddress }),
    api.getLogs({
      target: CONFIG.issuedAddress,
      topics: [CONFIG.TOPICS.TRANSFER, CONFIG.TOPICS.ZERO],
      fromBlock: CONFIG.HACK_FROM_BLOCK,
      toBlock: currentBlock,
      entireLog: true,
    }),
    api.getLogs({
      target: CONFIG.issuedAddress,
      topics: [CONFIG.TOPICS.DESTROYED_BLOCKED_FUNDS],
      fromBlock: CONFIG.HACK_FROM_BLOCK,
      toBlock: currentBlock,
      entireLog: true,
    }),
  ]);

  const sumLogValues = (logs: any[]) => logs.reduce((acc, l) => acc + BigInt(l.data), BigInt(0));
  const decodeAddr = (topic: string) => ("0x" + topic.slice(26)).toLowerCase();

  // Blocked recipients = hardcoded hacker-controlled addresses + addresses
  // the team has since frozen on-chain via DestroyedBlockedFunds.
  const blockedRecipients = new Set<string>(
    CONFIG.BLACKLISTED_RECIPIENTS.map((a) => a.toLowerCase())
  );
  for (const log of destroyedLogs as any[]) {
    blockedRecipients.add(decodeAddr(log.topics[1]));
  }

  // A mint is malicious if its recipient is blocked OR it falls inside the
  // hack window.
  const maliciousMints = (mintLogs as any[]).filter((log) => {
    if (blockedRecipients.has(decodeAddr(log.topics[2]))) return true;
    return log.blockNumber >= CONFIG.HACK_FROM_BLOCK && log.blockNumber <= CONFIG.HACK_TO_BLOCK;
  });
  const maliciousMintAmount = sumLogValues(maliciousMints);

  // Add back team destructions (totalSupply was decremented on destroy).
  const destroyedAmount = sumLogValues(destroyedLogs as any[]);
  const effectiveDestroyed = destroyedAmount < maliciousMintAmount ? destroyedAmount : maliciousMintAmount;

  const adjusted = (+supply - Number(maliciousMintAmount) + Number(effectiveDestroyed)) / 10 ** 6;
  sumSingleBalance(balances, "peggedUSD", adjusted, "issued", false);
  return balances;
};

export default adapter;
