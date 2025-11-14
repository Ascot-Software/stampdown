/**
 * Helper Registry
 * Manages custom and built-in helpers
 * @packageDocumentation
 */

import type { Context } from '../types';

/**
 * Options passed to helper functions
 * @public
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
 * @param context - The current template context
 * @param options - Options including fn, inverse, and hash
 * @param args - Additional arguments passed to the helper
 * @returns The rendered output
 * @public
 */
export type Helper = (context: Context, options: HelperOptions, ...args: unknown[]) => string;

/**
 * Registry for managing template helpers
 * @public
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
   * @param name - The name of the helper
   * @param helper - The helper function
   */
  register(name: string, helper: Helper): void {
    this.helpers.set(name, helper);
  }

  /**
   * Get a helper by name
   * @param name - The name of the helper to retrieve
   * @returns The helper function or undefined if not found
   */
  get(name: string): Helper | undefined {
    return this.helpers.get(name);
  }

  /**
   * Check if a helper exists
   * @param name - The name of the helper to check
   * @returns True if the helper exists
   */
  has(name: string): boolean {
    return this.helpers.has(name);
  }

  /**
   * Unregister a helper
   * @param name - The name of the helper to remove
   * @returns True if the helper was removed, false if it didn't exist
   */
  unregister(name: string): boolean {
    return this.helpers.delete(name);
  }
}
