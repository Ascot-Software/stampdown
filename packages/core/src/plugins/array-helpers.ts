/**
 * Array helpers plugin for Stampdown
 * Provides helpers for array operations and manipulation
 */

import { createPlugin } from '../plugin';
import type { Context } from '../types';
import type { HelperOptions } from '../helpers/registry';

/**
 * Array helpers plugin
 * Adds helpers for join, length, slice, reverse, and sort operations
 *
 * @example
 * ```typescript
 * import { Stampdown } from 'stampdown';
 * import { arrayHelpersPlugin } from 'stampdown/plugins/array-helpers';
 *
 * const stampdown = new Stampdown({
 *   plugins: [arrayHelpersPlugin]
 * });
 *
 * stampdown.render('{{#join items ", "}}{{/join}}', { items: ['A', 'B', 'C'] }); // "A, B, C"
 * stampdown.render('{{#length items}}{{/length}}', { items: [1, 2, 3] }); // "3"
 * ```
 */
export const arrayHelpersPlugin = createPlugin({
  name: 'array-helpers',
  version: '1.0.0',
  description: 'Adds array manipulation helpers (join, slice, reverse, etc.)',
  plugin: (stampdown) => {
    // Join helper
    stampdown.registerHelper(
      'join',
      (_context: Context, _options: HelperOptions, array: unknown, separator?: unknown) => {
        if (!Array.isArray(array)) return '';
        return array.join(String(separator || ', '));
      }
    );

    // Length/size helper
    stampdown.registerHelper(
      'length',
      (_context: Context, _options: HelperOptions, value: unknown) => {
        if (Array.isArray(value)) return String(value.length);
        if (typeof value === 'string') return String(value.length);
        if (typeof value === 'object' && value !== null) return String(Object.keys(value).length);
        return '0';
      }
    );

    // Slice helper
    stampdown.registerHelper(
      'slice',
      (
        _context: Context,
        _options: HelperOptions,
        array: unknown,
        start: unknown,
        end?: unknown
      ) => {
        if (!Array.isArray(array)) return '';
        const sliced = array.slice(Number(start), end !== undefined ? Number(end) : undefined);
        return JSON.stringify(sliced);
      }
    );

    // Reverse helper
    stampdown.registerHelper(
      'reverse',
      (_context: Context, _options: HelperOptions, array: unknown) => {
        if (!Array.isArray(array)) return '';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const reversed = [...array].reverse();
        return JSON.stringify(reversed);
      }
    );

    // Sort helper
    stampdown.registerHelper(
      'sort',
      (_context: Context, _options: HelperOptions, array: unknown) => {
        if (!Array.isArray(array)) return '';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const sorted = [...array].sort();
        return JSON.stringify(sorted);
      }
    );
  },
});
