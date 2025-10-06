/**
 * Tokenizer
 * Token counting and truncation abstraction for LLM text processing
 *
 * @module plugins/llm/tokenizer
 */

import { encode, decode } from 'gpt-tokenizer';

/**
 * Tokenizer interface for counting and truncating text by tokens
 */
export interface Tokenizer {
  /**
   * Count tokens in text
   * @param {string} text - Text to count tokens for
   * @returns {number} - Token count
   */
  count(text: string): number;

  /**
   * Truncate text to maximum token count
   * @param {string} text - Text to truncate
   * @param {number} maxTokens - Maximum number of tokens
   * @returns {string} - Truncated text
   */
  truncateByTokens(text: string, maxTokens: number): string;
}

/**
 * Default tokenizer using gpt-tokenizer
 * Falls back to character-based estimation if tokenization fails
 */
export const defaultTokenizer: Tokenizer = {
  count(text) {
    try {
      return encode(text).length;
    } catch {
      // Fallback: rough estimate of ~4 chars per token
      return Math.ceil(text.length / 4);
    }
  },

  truncateByTokens(text, maxTokens) {
    try {
      const ids = encode(text).slice(0, Math.max(0, maxTokens));
      return decode(ids);
    } catch {
      // Fallback: rough estimate of ~4 chars per token
      const approx = Math.max(1, maxTokens * 4);
      return text.slice(0, approx);
    }
  },
};
