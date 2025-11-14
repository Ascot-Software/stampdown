/**
 * Tokenizer
 * Token counting and truncation abstraction for LLM text processing
 * @packageDocumentation
 */

import { encode, decode } from 'gpt-tokenizer';

/**
 * Tokenizer interface for counting and truncating text by tokens
 * @public
 */
export interface Tokenizer {
  /**
   * Count tokens in text
   * @param text - Text to count tokens for
   * @returns - Token count
   */
  count(text: string): number;

  /**
   * Truncate text to maximum token count
   * @param text - Text to truncate
   * @param _maxTokens - Maximum number of tokens
   * @returns Truncated text
   */
  truncateByTokens(text: string, _maxTokens: number): string;
}

/**
 * Default tokenizer using gpt-tokenizer
 * Falls back to character-based estimation if tokenization fails
 * @public
 */
export const defaultTokenizer: Tokenizer = {
  /**
   * Count tokens in text
   * @param text - Text to count tokens for
   * @returns Token count
   */
  count(text) {
    try {
      return encode(text).length;
    } catch {
      // Fallback: rough estimate of ~4 chars per token
      return Math.ceil(text.length / 4);
    }
  },

  /**
   * Truncate text by tokens
   * @param text - Text to truncate
   * @param maxTokens - Maximum number of tokens
   * @returns Truncated text
   */
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
