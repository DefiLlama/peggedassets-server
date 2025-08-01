const NIBIRU_RPC = "https://evm-rpc.archive.nibiru.fi/";

interface CallParams {
  target: string;
  abi: { name: string };
  params?: any[];
  block?: number;
}

interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: string;
  error?: {
    code: number;
    message: string;
  };
}

export async function call(params: CallParams): Promise<string> {
  const { target, abi, params: contractParams = [], block } = params
  const functionSig = abi.name
  let data: string

  // Handle common ERC20 functions with direct selectors
  switch (functionSig) {
    case 'totalSupply':
      data = '0x18160ddd'
      break
    case 'balanceOf':
      data = '0x70a08231' + encodeParameter('address', contractParams[0])
      break
    case 'owner':
      data = '0x8da5cb5b'
      break
    default:
      throw new Error(`Unsupported function: ${functionSig}`)
  }

  const response = await fetch(NIBIRU_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{
        to: target,
        data,
      }, block ? '0x' + block.toString(16) : 'latest']
    })
  }).then(r => r.json()) as JsonRpcResponse

  if (response.error) {
    throw new Error(`Nibiru RPC error: ${response.error.message}`)
  }

  if (!response.result) {
    throw new Error('No result returned from RPC call')
  }

  return response.result
}

function encodeParameter(type: string, value: string): string {
  if (type === 'address') {
    // Remove '0x' prefix if present and pad to 32 bytes
    return value.replace('0x', '').padStart(64, '0')
  }
  throw new Error(`Unsupported parameter type: ${type}`)
} 