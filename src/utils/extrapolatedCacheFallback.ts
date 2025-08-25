import * as fs from 'fs';
import * as path from 'path';
import peggedAssets from '../peggedData/peggedData';

const DEFAULT_MAX_LOOKBACK_SECONDS =
  Number(process.env.PEGGED_FALLBACK_LOOKBACK_SECONDS || 72 * 60 * 60); // 3 days

function normalizeName(s: string): string {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function pickClosest(tokens: any[], targetTimestamp?: number, maxLookbackSeconds?: number) {
  if (!Array.isArray(tokens) || tokens.length === 0) return null;
  if (!targetTimestamp) return tokens[tokens.length - 1];

  let best: any = null;
  let bestDelta = Infinity;

  for (const t of tokens) {
    const ts = Number(t?.date);
    if (!Number.isFinite(ts)) continue;
    const delta = Math.abs(ts - targetTimestamp);
    if (delta < bestDelta) {
      best = t;
      bestDelta = delta;
    }
  }

  if (best && Number.isFinite(best?.date)) {
    if (typeof maxLookbackSeconds === 'number' && bestDelta > maxLookbackSeconds) {
      return null;
    }
  }
  return best;
}

export async function getClosestSnapshotForChain(
  stablecoinId: string,
  chain: string,
  targetTimestamp?: number,
  maxLookbackSeconds: number = DEFAULT_MAX_LOOKBACK_SECONDS,
): Promise<{ snapshot: any; timestamp: number } | null> {
  try {
    const peggedAsset = peggedAssets.find((p) => p.id === stablecoinId);
    if (!peggedAsset) return null;
    const adapterId = peggedAsset.id;

    const cacheDir = path.join(process.cwd(), '..', '..', '..', 'api2', '.api2-cache', 'build', 'stablecoin');
    if (!fs.existsSync(cacheDir)) return null;
    const filePath = path.join(cacheDir, adapterId);
    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, 'utf8');
    const adapterData = JSON.parse(content);

    const normalizedChain = normalizeName(chain);
    if (!adapterData.chainBalances) return null;

    const match = Object.keys(adapterData.chainBalances).find(c => normalizeName(c) === normalizedChain);
    if (!match) return null;

    const chainData = adapterData.chainBalances[match];
    if (!Array.isArray(chainData.tokens) || chainData.tokens.length === 0) return null;

    const closest = pickClosest(chainData.tokens, targetTimestamp, maxLookbackSeconds);
    if (!closest) return null;

    const ts = closest.date || parseInt(adapterId);
    return { snapshot: closest, timestamp: ts };
  } catch {
    return null;
  }
}

export function extractIssuanceFromSnapshot(
  snapshot: any,
  issuanceType: string,
  pegType: string = 'peggedUSD',
  _sourceChain?: string,
): any | null {
  if (!snapshot || typeof snapshot !== 'object') return null;
  const normIss = normalizeName(issuanceType);

  if (issuanceType === 'minted' || issuanceType === 'unreleased' || issuanceType === 'circulating') {
    const node = snapshot[issuanceType];
    const n = numberFromNode(node, pegType);
    if (n != null) return { [pegType]: n };
    return null;
  }

  const bridgedTo = snapshot.bridgedTo;
  if (!bridgedTo || typeof bridgedTo !== 'object') return null;

  const direct = bridgedTo[issuanceType] || bridgedTo[capitalCase(issuanceType)];
  
  if (direct) {
    const directValue = numberFromNode(direct, pegType);
    if (directValue != null) {
      if (direct.bridges || Object.keys(direct).some(key => key !== pegType && key !== 'bridges')) {
        return {
          [pegType]: directValue,
          bridges: direct.bridges || {},
          ...Object.fromEntries(
            Object.entries(direct).filter(([key]) => key !== pegType && key !== 'bridges')
          )
        };
      }
      return { [pegType]: directValue };
    }
  }

  const bridges = bridgedTo.bridges;
  if (bridges && typeof bridges === 'object') {
    let totalAmount = 0;
    let aggregatedBridges: any = {};
    
    for (const bridgeProtocol of Object.keys(bridges)) {
      const protocolData = bridges[bridgeProtocol];
      if (!protocolData || typeof protocolData !== 'object') continue;
      
      for (const destChain of Object.keys(protocolData)) {
        const normalizedDestChain = normalizeName(destChain);
        if (normalizedDestChain === normIss) {
          const chainData = protocolData[destChain];
          const amount = numberFromNode(chainData, pegType);
          
          if (amount != null) {
            totalAmount += amount;
            
            if (!aggregatedBridges[bridgeProtocol]) {
              aggregatedBridges[bridgeProtocol] = {};
            }
            aggregatedBridges[bridgeProtocol][destChain] = chainData;
          }
        }
      }
    }
    
    if (totalAmount > 0) {
      return {
        [pegType]: totalAmount,
        bridges: aggregatedBridges
      };
    }
  }

  let acc = 0;
  let found = false;
  let aggregatedBridges: any = {};

  const addIfNumber = (x: any) => {
    const v = numberFromNode(x, pegType);
    if (v != null) { acc += v; found = true; }
  };

  if (bridges && typeof bridges === 'object') {
    for (const prov of Object.keys(bridges)) {
      const pval = bridges[prov];
      if (!pval) continue;

      if (!Array.isArray(pval) && typeof pval === 'object') {
        const hit = pval[issuanceType] || pval[capitalCase(issuanceType)] || pval[normIss];
        if (hit) {
          addIfNumber(hit);
          if (!aggregatedBridges[prov]) aggregatedBridges[prov] = {};
          aggregatedBridges[prov][issuanceType] = hit;
        }
        const byName = Object.keys(pval).find(k => normalizeName(k) === normIss);
        if (byName) {
          addIfNumber(pval[byName]);
          if (!aggregatedBridges[prov]) aggregatedBridges[prov] = {};
          aggregatedBridges[prov][byName] = pval[byName];
        }
      }

      if (Array.isArray(pval)) {
        for (const it of pval) {
          const toName = it?.to || it?.toChain || it?.chain || it?.name || it?.id;
          if (toName && normalizeName(String(toName)) === normIss) {
            addIfNumber(it);
            if (!aggregatedBridges[prov]) aggregatedBridges[prov] = [];
            aggregatedBridges[prov].push(it);
          }
        }
      }
    }
  }

  if (!found) {
    for (const k of Object.keys(bridgedTo)) {
      if (k === 'bridges') continue;
      if (normalizeName(k) === normIss) addIfNumber(bridgedTo[k]);
    }
  }

  if (!found) return null;
  
  if (Object.keys(aggregatedBridges).length > 0) {
    return { 
      [pegType]: acc,
      bridges: aggregatedBridges
    };
  }
  
  return { [pegType]: acc };
}

function numberFromNode(node: any, pegType: string): number | null {
  if (!node || typeof node !== 'object') return null;
  const v1 = node[pegType];
  if (typeof v1 === 'number' && Number.isFinite(v1)) return v1;

  const v2 = node.amount ?? node.value ?? node.balance ?? node.total;
  if (typeof v2 === 'number' && Number.isFinite(v2)) return v2;
  if (typeof v2 === 'string') {
    const f = parseFloat(v2);
    if (Number.isFinite(f)) return f;
  }
  return null;
}

function capitalCase(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
