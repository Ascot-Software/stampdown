/**
 * Core types for Stampdown
 */

import type { PluginConfig } from './plugin';

/**
 * Configuration options for Stampdown instance
 */
export interface StampdownOptions {
  /** Custom helper functions to register */
  helpers?: Record<string, Helper>;
  /** Partial template strings to register */
  partials?: Record<string, string>;
  /** Pre and post processing hooks */
  hooks?: {
    /** Hooks to run before template parsing */
    preProcess?: Hook[];
    /** Hooks to run after template rendering */
    postProcess?: Hook[];
  };
  /** Plugins to load */
  plugins?: PluginConfig[];
}

/**
 * Context object containing variables accessible in templates
 */
export type Context = Record<string, unknown>;

/**
 * Partial template string
 */
export type Partial = string;

/**
 * Helper function type
 * @param {Context} context - The current template context
 * @param {HelperOptions} options - Options including fn, inverse, and hash
 * @param {...unknown[]} args - Additional arguments passed to the helper
 * @returns {string} - The rendered output
 */
export type Helper = (context: Context, options: HelperOptions, ...args: unknown[]) => string;

/**
 * Options passed to helper functions
 */
export interface HelperOptions {
  /** Function to render the main block content */
  fn?: (context: Context) => string;
  /** Function to render the inverse (else) block content */
  inverse?: (context: Context) => string;
  /** Hash parameters passed to the helper */
  hash?: Record<string, unknown>;
}

/**
 * Hook function type for pre/post processing
 * @param {string} input - The input string to process
 * @param {Context} context - The current template context
 * @returns {string} - The processed output
 */
export type Hook = (input: string, context: Context) => string;

/**
 * Abstract Syntax Tree node representing parsed template elements
 */
export interface ASTNode {
  /** Node type (e.g., 'root', 'text', 'expression', 'blockHelper', 'partial', 'partialBlock', 'inlinePartial') */
  type: string;
  /** Text value for text nodes */
  value?: string;
  /** Child nodes */
  children?: ASTNode[];
  /** Expression string for expression nodes */
  expression?: string;
  /** Helper name for block helper nodes */
  helperName?: string;
  /** Arguments passed to helpers */
  args?: unknown[];
  /** Hash parameters */
  hash?: Record<string, unknown>;
  /** Inverse (else) block children */
  inverse?: ASTNode[];
  /** Partial name (can be expression for dynamic partials) */
  partialName?: string;
  /** Whether partial name is a dynamic expression */
  isDynamic?: boolean;
  /** Custom context for partial */
  partialContext?: string;
  /** Inline partial name (for inline partial definitions) */
  inlineName?: string;
}

/**
 * Token from lexical analysis
 */
export interface Token {
  /** Type of token */
  type: TokenType;
  /** Token value */
  value: string;
  /** Position in source string */
  position: number;
}

export enum TokenType {
  TEXT = 'TEXT',
  EXPRESSION_START = 'EXPRESSION_START',
  EXPRESSION_END = 'EXPRESSION_END',
  BLOCK_START = 'BLOCK_START',
  BLOCK_END = 'BLOCK_END',
  PARTIAL = 'PARTIAL',
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
}
