/**
 * Stampdown LLM Plugin
 * Provides LLM-focused helpers for chat message templating
 * @packageDocumentation
 */

import { createPlugin } from '@stampdwn/core';
import { registerLLMHelpers } from './helpers';

/**
 * LLM Plugin for Stampdown
 * Normalizes provider payloads using `@ai-sdk` and provides role-aware helpers
 * @example
 * ```typescript
 * import { Stampdown } from '@stampdwn/core';
 * import { llmPlugin } from '@stampdwn/llm';
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
 * @public
 */
export const llmPlugin = createPlugin({
  name: 'llm-plugin',
  version: '0.1.1',
  description: 'LLM-focused helpers for AI prompt templating',
  plugin: (stampdown, options) => {
    registerLLMHelpers(stampdown, options);
  },
});

// Re-export types for convenience
export type { NormRole, NormContent, NormMessage, NormChat } from './types';
export type { Tokenizer } from './tokenizer';
export type { LLMHelperOptions } from './helpers';
