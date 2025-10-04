/**
 * Expression Evaluator
 * Safely evaluates expressions within templates
 */

import type { Context } from './types';

/**
 * ExpressionEvaluator class for safely evaluating template expressions
 */
export class ExpressionEvaluator {
  /**
   * Evaluate an expression in the given context
   * Supports dot notation for nested property access (e.g., "user.name")
   * Also handles literal values: numbers, strings (quoted), booleans, null, undefined
   * @param {string} expression - The expression to evaluate
   * @param {Context} context - The context containing variables
   * @returns {unknown} - The evaluated result or undefined if not found
   */
  evaluate(expression: string, context: Context): unknown {
    const trimmed = expression.trim();

    // Handle literals
    // Numbers (integer or decimal)
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }

    // Quoted strings
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }

    // Booleans
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    // null and undefined
    if (trimmed === 'null') return null;
    if (trimmed === 'undefined') return undefined;

    // Handle simple property access with dot notation
    const path = trimmed.split('.');
    let value: unknown = context;

    for (const key of path) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return value;
  }
}
