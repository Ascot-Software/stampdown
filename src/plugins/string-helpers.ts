/**
 * String manipulation plugin for Stampdown
 * Provides helpers for common string operations
 */

import { createPlugin } from '../plugin';
import type { Context } from '../types';
import type { HelperOptions } from '../helpers/registry';

/**
 * String manipulation plugin
 * Adds helpers for uppercase, lowercase, capitalize, trim, repeat, and truncate operations
 *
 * @example
 * ```typescript
 * import { Stampdown } from 'stampdown';
 * import { stringHelpersPlugin } from 'stampdown/plugins/string-helpers';
 *
 * const stampdown = new Stampdown({
 *   plugins: [stringHelpersPlugin]
 * });
 *
 * stampdown.render('{{#uppercase name}}{{/uppercase}}', { name: 'alice' }); // "ALICE"
 * stampdown.render('{{#capitalize title}}{{/capitalize}}', { title: 'hello world' }); // "Hello world"
 * ```
 */
export const stringHelpersPlugin = createPlugin({
  name: 'string-helpers',
  version: '1.0.0',
  description: 'Adds string manipulation helpers (uppercase, lowercase, capitalize, etc.)',
  plugin: (stampdown) => {
    // Uppercase helper
    stampdown.registerHelper(
      'uppercase',
      (_context: Context, _options: HelperOptions, text: unknown) => {
        return String(text).toUpperCase();
      }
    );

    // Lowercase helper
    stampdown.registerHelper(
      'lowercase',
      (_context: Context, _options: HelperOptions, text: unknown) => {
        return String(text).toLowerCase();
      }
    );

    // Capitalize helper (first letter uppercase)
    stampdown.registerHelper(
      'capitalize',
      (_context: Context, _options: HelperOptions, text: unknown) => {
        const str = String(text);
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      }
    );

    // Trim helper
    stampdown.registerHelper(
      'trim',
      (_context: Context, _options: HelperOptions, text: unknown) => {
        return String(text).trim();
      }
    );

    // Repeat helper
    stampdown.registerHelper(
      'repeat',
      (_context: Context, _options: HelperOptions, text: unknown, count: unknown) => {
        return String(text).repeat(Number(count) || 1);
      }
    );

    // Truncate helper
    stampdown.registerHelper(
      'truncate',
      (_context: Context, _options: HelperOptions, text: unknown, maxLength: unknown) => {
        const str = String(text);
        const max = Number(maxLength) || 50;
        return str.length > max ? str.substring(0, max) + '...' : str;
      }
    );
  },
});
