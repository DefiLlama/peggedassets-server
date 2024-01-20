import http from '../llama-helper/http';
import { getEnv } from '../helper/env';


interface CallOptions {
    withMetadata?: boolean;
  }
  
  const endpoint = (): string => getEnv('SUI_RPC');
  
  async function getObject(objectId: string): Promise<any> {
    return (await call('sui_getObject', [objectId, {
      "showType": true,
      "showOwner": true,
      "showContent": true,
    }])).content;
  }
   
  async function call(method: string, params: any, { withMetadata = false }: CallOptions = {}): Promise<any> {
    if (!Array.isArray(params)) params = [params];
    const {
      result
    } = await http.post(endpoint(), { jsonrpc: "2.0", id: 1, method, params });
    return withMetadata ? result : result.data;
  }


export {
  endpoint,
  call,
  getObject,
};
