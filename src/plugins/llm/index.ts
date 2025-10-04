/**
 * Stampdown LLM Plugin
 * Provides LLM-focused helpers for chat message templating
 *
 * @module plugins/llm
 */

import { createPlugin } from '../../plugin';
import { registerLLMHelpers } from './helpers';

/**
 * LLM Plugin for Stampdown
 * Normalizes provider payloads using @ai-sdk and provides role-aware helpers
 *
 * @example
 * ```typescript
 * import { Stampdown } from 'stampdown';
 * import { llmPlugin } from 'stampdown/plugins/llm';
 *
 * const stampdown = new Stampdown({
 *   plugins: [llmPlugin]
 * });
 *
 * const template = `
 * {{#withChat raw=chat}}
 * {{#eachMessage}}
 *   {{#ifUser}}User: {{firstText this}}{{/ifUser}}
 *   {{#ifAssistant}}Assistant: {{firstText this}}{{/ifAssistant}}
 * {{/eachMessage}}
 * {{/withChat}}
 * `;
 * ```
 */
export const llmPlugin = createPlugin({
  name: 'llm-plugin',
  version: '1.0.0',
  description: 'LLM chat normalization (via @ai-sdk) + role-aware helpers for prompt templating',
  plugin: (stampdown, options) => {
    registerLLMHelpers(stampdown, options);
  },
});

// Re-export types for convenience
export type { NormRole, NormContent, NormMessage, NormChat } from './types';
export type { Tokenizer } from './tokenizer';
export type { LLMHelperOptions } from './helpers';
