/**
 * Stampdown Template File Loader
 * Loads and compiles .sdt template files
 * @packageDocumentation
 */

import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { Stampdown } from './stampdown';
import type { Context, StampdownOptions } from './types';

/**
 * Compiled template that can be rendered multiple times
 * @public
 */
export interface CompiledTemplate {
  /**
   * Render the template with the given context
   * @param context - Variables and data accessible in the template
   * @returns The rendered output
   */
  render(context?: Context): string;

  /**
   * The original template string
   */
  source: string;
}

/**
 * Template loader for .sdt files
 * @public
 */
export class TemplateLoader {
  private stampdown: Stampdown;
  private cache: Map<string, CompiledTemplate>;

  /**
   * Creates a new TemplateLoader instance
   * @param options - Configuration options for the Stampdown instance
   */
  constructor(options: StampdownOptions = {}) {
    this.stampdown = new Stampdown(options);
    this.cache = new Map();
  }

  /**
   * Load and compile a template file
   * @param filePath - Path to the .sdt template file
   * @param useCache - Whether to use cached compiled template
   * @returns The compiled template
   */
  async load(filePath: string, useCache: boolean = true): Promise<CompiledTemplate> {
    // Check cache first
    if (useCache && this.cache.has(filePath)) {
      return this.cache.get(filePath)!;
    }

    // Read the template file
    const source = await readFile(filePath, 'utf-8');

    // Compile the template
    const compiled = this.compile(source);

    // Cache the compiled template
    if (useCache) {
      this.cache.set(filePath, compiled);
    }

    return compiled;
  }

  /**
   * Load a template file synchronously (Node.js only)
   * @param filePath - Path to the .sdt template file
   * @param useCache - Whether to use cached compiled template
   * @returns The compiled template
   */
  loadSync(filePath: string, useCache: boolean = true): CompiledTemplate {
    // Check cache first
    if (useCache && this.cache.has(filePath)) {
      return this.cache.get(filePath)!;
    }

    // Read the template file synchronously
    const source = readFileSync(filePath, 'utf-8');

    // Compile the template
    const compiled = this.compile(source);

    // Cache the compiled template
    if (useCache) {
      this.cache.set(filePath, compiled);
    }

    return compiled;
  }

  /**
   * Compile a template string
   * @param source - The template source code
   * @returns The compiled template
   */
  compile(source: string): CompiledTemplate {
    // Pre-parse to validate syntax
    this.stampdown['parser'].parse(source);

    return {
      render: (context: Context = {}): string => {
        return this.stampdown.render(source, context);
      },
      source,
    };
  }

  /**
   * Clear the template cache
   * @param filePath - Optional specific file to clear, or clear all if not provided
   */
  clearCache(filePath?: string): void {
    if (filePath) {
      this.cache.delete(filePath);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get the Stampdown instance
   * @returns The Stampdown instance
   */
  getStampdown(): Stampdown {
    return this.stampdown;
  }
}
