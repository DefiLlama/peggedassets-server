export const starknetTotalSupplyAbi = {
  name: "total_supply",
  type: "function",
  inputs: [],
  outputs: [
    {
      type: "core::integer::u256",
    },
  ],
  state_mutability: "view",
};

export const starknetBalanceOfAbi = {
  name: "balance_of",
  type: "function",
  inputs: [
    {
      type: "core::starknet::contract_address::ContractAddress",
      name: "owner",
    },
  ],
  outputs: [
    {
      type: "core::integer::u256",
    },
  ],
  state_mutability: "view",
};
