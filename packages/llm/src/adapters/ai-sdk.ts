/**
 * AI SDK Adapter
 * Normalizes `@ai-sdk` message shapes to our internal NormChat format.
 * This is the ONLY file that imports `@ai-sdk` types - they never leak beyond this boundary.
 * @module plugins/llm/adapters/ai-sdk
 * @private
 */

import type { NormChat, NormMessage, NormContent } from '../types';

/**
 * Minimal shape we expect from `@ai-sdk` (kept local; don't re-export)
 * @private
 */
export type AiSdkMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool' | 'function';
  name?: string;
  content: Array<
    | { type: 'text'; text: string }
    | { type: 'image'; url?: string; data?: string; mimeType?: string; alt?: string }
    | { type: 'tool-call'; toolName: string; id?: string; args: unknown }
    | { type: 'tool-result'; toolName?: string; id?: string; result: unknown }
  >;
};

/**
 * Payload shape from `@ai-sdk` providers
 * @private
 */
export type AiSdkPayload = {
  provider?: string;
  model?: string;
  messages: AiSdkMessage[];
  [k: string]: unknown;
};

/**
 * Normalize an `@ai-sdk` payload to our internal NormChat format
 * @param {AiSdkPayload} raw - Raw payload from `@ai-sdk` provider
 * @returns {NormChat} - Normalized chat object
 */
export function normalizeFromAiSdk(raw: AiSdkPayload): NormChat {
  const messages: NormMessage[] = (raw.messages ?? []).map((m) => ({
    role: mapRole(m.role),
    name: m.name,
    content: m.content.flatMap(mapContent),
  }));

  return {
    provider: mapProvider(raw.provider),
    model: raw.model,
    messages,
    meta: { source: 'ai-sdk', raw },
  };
}

/**
 * Map `@ai-sdk` role to normalized role
 * @param {string} r - Role from `@ai-sdk`
 * @returns {NormMessage['role']} - Normalized role
 * @private
 */
function mapRole(r: AiSdkMessage['role']): NormMessage['role'] {
  if (r === 'function') return 'function';
  if (r === 'tool') return 'tool';
  if (r === 'assistant') return 'assistant';
  if (r === 'system') return 'system';
  return 'user';
}

/**
 * Map `@ai-sdk` content to normalized content array
 * @param {object} c - Content item from `@ai-sdk`
 * @returns {NormContent[]} - Array of normalized content items
 * @private
 */
function mapContent(c: AiSdkMessage['content'][number]): NormContent[] {
  switch (c.type) {
    case 'text':
      return [{ type: 'text', text: c.text ?? '' }];
    case 'image':
      return [
        {
          type: 'image',
          url: c.url,
          data: c.data,
          mime: c.mimeType,
          alt: c.alt,
        },
      ];
    case 'tool-call':
      // Represent calls in NormContent as 'tool_result' with a 'call' payload
      return [
        {
          type: 'tool_result',
          toolName: c.toolName,
          callId: c.id,
          result: { kind: 'call', args: c.args },
        },
      ];
    case 'tool-result':
      return [
        {
          type: 'tool_result',
          toolName: c.toolName,
          callId: c.id,
          result: c.result,
        },
      ];
    default:
      return [];
  }
}

/**
 * Map provider string to normalized provider type
 * @param {string | undefined} p - Provider string from `@ai-sdk`
 * @returns {NormChat['provider']} - Normalized provider
 * @private
 */
function mapProvider(p?: string): NormChat['provider'] {
  if (!p) return 'other';
  const s = p.toLowerCase();
  if (s.includes('openai') || s.includes('azure-openai')) return 'openai';
  if (s.includes('anthropic')) return 'anthropic';
  if (s.includes('vertex') || s.includes('google')) return 'vertex';
  if (s.includes('azure')) return 'azure';
  return 'other';
}
