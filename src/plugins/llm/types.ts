/**
 * Stampdown LLM Plugin Types
 * Normalized chat message types for multi-provider LLM interactions
 *
 * @module plugins/llm/types
 */

import { z } from 'zod';

/**
 * Normalized message role types across LLM providers
 */
export type NormRole = 'system' | 'user' | 'assistant' | 'tool' | 'function';

/**
 * Normalized content types for message content
 */
export type NormContent =
  | { type: 'text'; text: string }
  | { type: 'image'; url?: string; data?: string; mime?: string; alt?: string }
  | { type: 'tool_result'; toolName?: string; callId?: string; result: unknown };

/**
 * Normalized message structure
 */
export interface NormMessage {
  role: NormRole;
  name?: string;
  content: NormContent[];
  meta?: Record<string, unknown>;
}

/**
 * Normalized chat structure with provider metadata
 */
export interface NormChat {
  provider: 'openai' | 'anthropic' | 'azure' | 'vertex' | 'other';
  model?: string;
  messages: NormMessage[];
  meta?: Record<string, unknown>;
}

/**
 * Zod schema for validating normalized messages
 */
export const NormMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool', 'function']),
  name: z.string().optional(),
  content: z.array(
    z.union([
      z.object({ type: z.literal('text'), text: z.string() }),
      z.object({
        type: z.literal('image'),
        url: z.string().optional(),
        data: z.string().optional(),
        mime: z.string().optional(),
        alt: z.string().optional(),
      }),
      z.object({
        type: z.literal('tool_result'),
        toolName: z.string().optional(),
        callId: z.string().optional(),
        result: z.unknown(),
      }),
    ])
  ),
  meta: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Zod schema for validating normalized chat objects
 */
export const NormChatSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'azure', 'vertex', 'other']),
  model: z.string().optional(),
  messages: z.array(NormMessageSchema),
  meta: z.record(z.string(), z.unknown()).optional(),
});
