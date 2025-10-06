/**
 * Helper Registry
 * Manages custom and built-in helpers
 */

import type { Context } from '../types';

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
 * Helper function type
 * @param {Context} context - The current template context
 * @param {HelperOptions} options - Options including fn, inverse, and hash
 * @param {...unknown[]} args - Additional arguments passed to the helper
 * @returns {string} - The rendered output
 */
export type Helper = (context: Context, options: HelperOptions, ...args: unknown[]) => string;

/**
 * Registry for managing template helpers
 */
export class HelperRegistry {
  private helpers: Map<string, Helper>;

  /**
   * Creates a new HelperRegistry instance
   */
  constructor() {
    this.helpers = new Map();
  }

  /**
   * Register a helper function
   * @param {string} name - The name of the helper
   * @param {Helper} helper - The helper function
   * @returns {void}
   */
  register(name: string, helper: Helper): void {
    this.helpers.set(name, helper);
  }

  /**
   * Get a helper by name
   * @param {string} name - The name of the helper to retrieve
   * @returns {Helper | undefined} - The helper function or undefined if not found
   */
  get(name: string): Helper | undefined {
    return this.helpers.get(name);
  }

  /**
   * Check if a helper exists
   * @param {string} name - The name of the helper to check
   * @returns {boolean} - True if the helper exists
   */
  has(name: string): boolean {
    return this.helpers.has(name);
  }

  /**
   * Unregister a helper
   * @param {string} name - The name of the helper to remove
   * @returns {boolean} - True if the helper was removed, false if it didn't exist
   */
  unregister(name: string): boolean {
    return this.helpers.delete(name);
  }
}
