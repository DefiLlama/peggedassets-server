// Default env values, applied only when the variable is not already set.
// `<CHAIN>_RPC` / `<CHAIN>_RPC_CHAIN_ID` are read by @defillama/sdk, so this is where chains the sdk does not know yet get an rpc.
// Import this file first in every entry point, before anything that makes rpc calls.
const DEFAULTS: { [key: string]: string } = {
  SOMNIA_TOKYO_RPC: "https://api.tokyo.infra.mainnet.somnia.network",
  SOMNIA_TOKYO_RPC_CHAIN_ID: "50321",
};

Object.keys(DEFAULTS).forEach((key) => {
  if (!process.env[key]) process.env[key] = DEFAULTS[key];
});

export function getEnv(key: string): string | undefined {
  return process.env[key] ?? DEFAULTS[key];
}
