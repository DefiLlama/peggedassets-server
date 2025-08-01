const chainContracts = {
    solana: {
      issued: ["5H4voZhzySsVvwVYDAKku8MZGuYBC7cXaBKDPW4YHWW1"],
      pegType: 'peggedGBP',
    },
    celo: {
      issued: ["0x7ae4265ecfc1f31bc0e112dfcfe3d78e01f4bb7f"],
      pegType: 'peggedGBP',
    },
    base: {
      issued: ["0xaeb4bb7debd1e5e82266f7c3b5cff56b3a7bf411"],
      pegType: 'peggedGBP',
    },
    ethereum: {
      issued: ["0x34C9C643Becd939c950bB9F141E35777559817CB"],
      pegType: 'peggedGBP',
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;