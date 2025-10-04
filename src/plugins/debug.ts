/**
 * Debug helpers plugin for Stampdown
 * Provides helpers for debugging and introspection
 */

import { createPlugin } from '../plugin';
import type { Context } from '../types';
import type { HelperOptions } from '../helpers/registry';

/**
 * Debug plugin
 * Adds helpers for json, typeof, keys, and values operations
 *
 * @example
 * ```typescript
 * import { Stampdown } from 'stampdown';
 * import { debugPlugin } from 'stampdown/plugins/debug';
 *
 * const stampdown = new Stampdown({
 *   plugins: [debugPlugin]
 * });
 *
 * const data = { name: 'Alice', age: 30 };
 * stampdown.render('{{#json data}}{{/json}}', { data }); // '{"name":"Alice","age":30}'
 * stampdown.render('{{#typeof name}}{{/typeof}}', { name: 'Alice' }); // "string"
 * stampdown.render('{{#keys data}}{{/keys}}', { data }); // '["name","age"]'
 * ```
 */
export const debugPlugin = createPlugin({
  name: 'debug',
  version: '1.0.0',
  description: 'Adds debugging helpers (json, typeof, keys, etc.)',
  plugin: (stampdown) => {
    // JSON stringify helper
    stampdown.registerHelper(
      'json',
      (_context: Context, _options: HelperOptions, value: unknown, indent?: unknown) => {
        try {
          return JSON.stringify(value, null, indent ? Number(indent) : undefined);
        } catch {
          return 'Error: Cannot stringify value';
        }
      }
    );

    // Typeof helper
    stampdown.registerHelper(
      'typeof',
      (_context: Context, _options: HelperOptions, value: unknown) => {
        return typeof value;
      }
    );

    // Keys helper
    stampdown.registerHelper('keys', (_context: Context, _options: HelperOptions, obj: unknown) => {
      if (typeof obj === 'object' && obj !== null) {
        return JSON.stringify(Object.keys(obj));
      }
      return '[]';
    });

    // Values helper
    stampdown.registerHelper(
      'values',
      (_context: Context, _options: HelperOptions, obj: unknown) => {
        if (typeof obj === 'object' && obj !== null) {
          return JSON.stringify(Object.values(obj));
        }
        return '[]';
      }
    );
  },
});
