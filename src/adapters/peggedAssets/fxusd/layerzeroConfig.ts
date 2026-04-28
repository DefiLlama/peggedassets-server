import type { LayerZeroConfig } from "../helper/bridgeConfig";

const layerzeroConfig: LayerZeroConfig = {
  sourceChain: "ethereum",
  tokens: [
    { chain: "base", address: "0x55380fe7a1910dff29a47b622057ab4139da42c5", decimals: 18 },
  ],
};

export default layerzeroConfig;
