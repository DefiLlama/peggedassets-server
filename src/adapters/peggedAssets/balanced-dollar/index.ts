import { getXSupply, getICONSupply } from "../helper/icon"

const adapter = {
    icon: {
        minted: getICONSupply()
    },
    // ICON chains where bnUSD is minted natively
    havah: {
        minted: getXSupply("0x100.icon"),
    },
    // COSMOS chains where bnUSD is minted natively
    injective: {
        minted: getXSupply("injective-1"),
    },
    archway: {
        minted: getXSupply("archway-1"),
    },
    // EVM chains where bnUSD is minted natively
    avalanche: {
        minted: getXSupply("0xa86a.avax"),
    },
    arbitrum: {
        minted: getXSupply("0xa4b1.arbitrum"),
    },
    base: {
        minted: getXSupply("0x2105.base"),
    },
    optimism: {
        minted: getXSupply("0xa.optimism"),
    },
    bsc: {
        minted: getXSupply("0x38.bsc"),
    }, 
  };
  
  export default adapter;