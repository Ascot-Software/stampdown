/**
 * Math helpers plugin for Stampdown
 * Provides helpers for mathematical operations
 * @packageDocumentation
 */

import { createPlugin } from '../plugin';
import type { Context } from '../types';
import type { HelperOptions } from '../helpers/registry';

/**
 * Math helpers plugin
 * Adds helpers for add, subtract, multiply, divide, mod, round, min, and max operations
 * @public
 *
 * @example
 * ```typescript
 * import { Stampdown } from '@stampdwn/core';
 * import { mathHelpersPlugin } from '@stampdwn/core/plugins/math-helpers';
 *
 * const stampdown = new Stampdown({
 *   plugins: [mathHelpersPlugin]
 * });
 *
 * stampdown.render('{{#multiply 6 7}}{{/multiply}}', {}); // "42"
 * stampdown.render('{{#add 10 5 3}}{{/add}}', {}); // "18"
 * ```
 */
export const mathHelpersPlugin = createPlugin({
  name: 'math-helpers',
  version: '1.0.0',
  description: 'Adds mathematical operation helpers (add, subtract, multiply, divide, etc.)',
  plugin: (stampdown) => {
    // Add helper
    stampdown.registerHelper(
      'add',
      (_context: Context, _options: HelperOptions, ...args: unknown[]) => {
        return args.reduce((sum: number, arg) => sum + Number(arg), 0).toString();
      }
    );

    // Subtract helper
    stampdown.registerHelper(
      'subtract',
      (_context: Context, _options: HelperOptions, a: unknown, b: unknown) => {
        return (Number(a) - Number(b)).toString();
      }
    );

    // Multiply helper
    stampdown.registerHelper(
      'multiply',
      (_context: Context, _options: HelperOptions, ...args: unknown[]) => {
        return args.reduce((product: number, arg) => product * Number(arg), 1).toString();
      }
    );

    // Divide helper
    stampdown.registerHelper(
      'divide',
      (_context: Context, _options: HelperOptions, a: unknown, b: unknown) => {
        const divisor = Number(b);
        if (divisor === 0) return 'Error: Division by zero';
        return (Number(a) / divisor).toString();
      }
    );

    // Modulo helper
    stampdown.registerHelper(
      'mod',
      (_context: Context, _options: HelperOptions, a: unknown, b: unknown) => {
        return (Number(a) % Number(b)).toString();
      }
    );

    // Round helper
    stampdown.registerHelper(
      'round',
      (_context: Context, _options: HelperOptions, num: unknown, decimals?: unknown) => {
        const factor = Math.pow(10, Number(decimals) || 0);
        return (Math.round(Number(num) * factor) / factor).toString();
      }
    );

    // Min helper
    stampdown.registerHelper(
      'min',
      (_context: Context, _options: HelperOptions, ...args: unknown[]) => {
        return Math.min(...args.map(Number)).toString();
      }
    );

    // Max helper
    stampdown.registerHelper(
      'max',
      (_context: Context, _options: HelperOptions, ...args: unknown[]) => {
        return Math.max(...args.map(Number)).toString();
      }
    );
  },
});
