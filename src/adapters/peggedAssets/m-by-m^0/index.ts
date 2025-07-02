import { addChainExports, solanaMintedOrBridged } from "../helper/getSupply";

const chainContracts = {
    ethereum: {
        issued: ["0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b"],
    },
    arbitrum: {
        bridgedFromEthereum: ["0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b"],
    },
    optimism: {
        bridgedFromEthereum: ["0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b"],
    },
    plume_mainnet: {
        bridgedFromEthereum: ["0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b"],
    },
    hyperliquid: {
        bridgedFromEthereum: ["0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b"],
    },
};

const adapter = addChainExports(chainContracts, {}, { decimals: 6 });
adapter.solana = {
    ethereum: solanaMintedOrBridged(["mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo"])
};

export default adapter;