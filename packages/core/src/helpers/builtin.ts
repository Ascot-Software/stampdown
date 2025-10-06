/**
 * Built-in Helpers
 * Provides common templating helpers similar to Handlebars
 */

import type { HelperRegistry, HelperOptions } from './registry';
import type { Context } from '../types';

/**
 * Register all built-in helpers to the given registry
 * @param {HelperRegistry} registry - The helper registry to register helpers to
 * @returns {void}
 */
export function registerBuiltInHelpers(registry: HelperRegistry): void {
  /**
   * 'if' helper - Conditional rendering
   * Renders the main block if condition is truthy, else block otherwise
   */
  registry.register('if', (context: Context, options: HelperOptions, condition: unknown) => {
    if (isTruthy(condition)) {
      return options.fn ? options.fn(context) : '';
    } else {
      return options.inverse ? options.inverse(context) : '';
    }
  });

  /**
   * 'unless' helper - Inverse conditional rendering
   * Renders the main block if condition is falsy, else block otherwise
   */
  registry.register('unless', (context: Context, options: HelperOptions, condition: unknown) => {
    if (!isTruthy(condition)) {
      return options.fn ? options.fn(context) : '';
    } else {
      return options.inverse ? options.inverse(context) : '';
    }
  });

  /**
   * 'each' helper - Array iteration
   * Iterates over an array and renders the block for each item
   * Provides special variables: @index, @first, @last
   */
  registry.register('each', (context: Context, options: HelperOptions, items: unknown) => {
    if (!Array.isArray(items)) {
      return options.inverse ? options.inverse(context) : '';
    }

    if (items.length === 0) {
      return options.inverse ? options.inverse(context) : '';
    }

    // Save original values to restore after iteration
    const originalThis = context.this;
    const originalIndex = context['@index'];
    const originalFirst = context['@first'];
    const originalLast = context['@last'];

    const results = items.map((item, index) => {
      // Mutate context directly to support variable assignments
      context.this = item;
      context['@index'] = index;
      context['@first'] = index === 0;
      context['@last'] = index === items.length - 1;

      return options.fn ? options.fn(context) : '';
    });

    // Restore original values
    if (originalThis !== undefined) {
      context.this = originalThis;
    } else {
      delete context.this;
    }
    if (originalIndex !== undefined) {
      context['@index'] = originalIndex;
    } else {
      delete context['@index'];
    }
    if (originalFirst !== undefined) {
      context['@first'] = originalFirst;
    } else {
      delete context['@first'];
    }
    if (originalLast !== undefined) {
      context['@last'] = originalLast;
    } else {
      delete context['@last'];
    }

    return results.join('');
  });

  /**
   * 'with' helper - Context switching
   * Changes the context for the block content
   */
  registry.register('with', (context: Context, options: HelperOptions, obj: unknown) => {
    if (obj && typeof obj === 'object') {
      // Temporarily add obj properties to context to support variable assignments
      const objRecord = obj as Record<string, unknown>;
      const originalValues: Record<string, unknown> = {};

      // Save original values and set new ones
      for (const key in objRecord) {
        if (key in context) {
          originalValues[key] = context[key];
        }
        context[key] = objRecord[key];
      }

      // Also set 'this' to the object
      const originalThis = context.this;
      context.this = obj;

      const result = options.fn ? options.fn(context) : '';

      // Restore original values
      for (const key in objRecord) {
        if (key in originalValues) {
          context[key] = originalValues[key];
        } else {
          delete context[key];
        }
      }
      context.this = originalThis;

      return result;
    }
    return options.inverse ? options.inverse(context) : '';
  });

  /**
   * 'log' helper - Debug logging
   * Logs arguments to console for debugging purposes
   */
  registry.register('log', (_context: Context, _options: HelperOptions, ...args: unknown[]) => {
    console.log('[Stampdown Log]', ...args);
    return '';
  });

  /**
   * 'lookup' helper - Dynamic property access
   * Looks up a property on an object using a dynamic key
   */
  registry.register(
    'lookup',
    (_context: Context, _options: HelperOptions, obj: unknown, key: unknown) => {
      if (obj && typeof obj === 'object' && typeof key === 'string') {
        return String((obj as Record<string, unknown>)[key] ?? '');
      }
      return '';
    }
  );
}

/**
 * Check if a value is truthy according to Handlebars semantics
 * @param {unknown} value - The value to check
 * @returns {boolean} - True if the value is truthy
 */
function isTruthy(value: unknown): boolean {
  if (value === null || value === undefined || value === false) {
    return false;
  }
  // Handle string boolean values from helpers
  if (value === 'false' || value === '0') {
    return false;
  }
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  if (value === '') {
    return false;
  }
  return true;
}
