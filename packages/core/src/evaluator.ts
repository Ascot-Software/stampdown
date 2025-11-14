/**
 * Expression Evaluator
 * Safely evaluates expressions within templates
 * @packageDocumentation
 */

import type { Context } from './types';

/**
 * ExpressionEvaluator class for safely evaluating template expressions
 * @public
 */
export class ExpressionEvaluator {
  /**
   * Evaluate an expression in the given context
   * Supports:
   * - Dot notation for nested property access (e.g., "user.name")
   * - Literal values: numbers, strings (quoted), booleans, null, undefined
   * - Comparison operators: ===, !==, ==, !=, \>, \<, \>=, \<=
   * - Logical operators: &&, ||, !
   * @param expression - The expression to evaluate
   * @param context - The context containing variables
   * @returns The evaluated result or undefined if not found
   */
  evaluate(expression: string, context: Context): unknown {
    const trimmed = expression.trim();

    // Check for template literals (backticks with $\{...\} interpolation)
    if (trimmed.startsWith('`') && trimmed.endsWith('`')) {
      return this.evaluateTemplateLiteral(trimmed, context);
    }

    // Check for logical OR operator (||) - lowest precedence
    if (trimmed.includes('||')) {
      const parts = this.splitByOperator(trimmed, '||');
      if (parts.length > 1) {
        for (const part of parts) {
          const result = this.evaluate(part, context);
          if (this.isTruthy(result)) {
            return result;
          }
        }
        return false;
      }
    }

    // Check for logical AND operator (&&)
    if (trimmed.includes('&&')) {
      const parts = this.splitByOperator(trimmed, '&&');
      if (parts.length > 1) {
        let lastResult: unknown = true;
        for (const part of parts) {
          const result = this.evaluate(part, context);
          if (!this.isTruthy(result)) {
            return false;
          }
          lastResult = result;
        }
        return lastResult;
      }
    }

    // Check for comparison operators (must check longer operators first)
    // ===, !==, ==, !=, >=, <=, >, <
    const comparisonOps = ['===', '!==', '==', '!=', '>=', '<=', '>', '<'];
    for (const op of comparisonOps) {
      if (trimmed.includes(op)) {
        const parts = this.splitByOperator(trimmed, op);
        if (parts.length === 2) {
          const left = this.evaluate(parts[0], context);
          const right = this.evaluate(parts[1], context);
          return this.compareValues(left, right, op);
        }
      }
    }

    // Check for arithmetic operators: +, -, *, /, %
    // Check these after comparison but before simple property access
    const arithmeticOps = ['+', '-', '*', '/', '%'];
    for (const op of arithmeticOps) {
      if (trimmed.includes(op)) {
        const parts = this.splitByOperator(trimmed, op);
        if (parts.length === 2) {
          const left = this.evaluate(parts[0], context);
          const right = this.evaluate(parts[1], context);
          return this.applyArithmetic(left, right, op);
        }
      }
    }

    // Check for logical NOT operator (!)
    if (trimmed.startsWith('!') && trimmed.length > 1) {
      const value = this.evaluate(trimmed.slice(1), context);
      return !this.isTruthy(value);
    }

    // Handle literals
    // Numbers (integer or decimal, including scientific notation)
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
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

    for (let i = 0; i < path.length; i++) {
      const key = path[i];

      // Handle 'this' keyword
      if (key === 'this' && i === 0) {
        // If context.this exists, use it; otherwise, 'this' refers to context itself
        if ('this' in context && context.this !== undefined) {
          value = context.this;
        } else {
          value = context;
        }
        continue;
      }

      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Split expression by operator, respecting quoted strings
   * @param expression - The expression to split
   * @param operator - The operator to split by
   * @returns Array of parts
   */
  private splitByOperator(expression: string, operator: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let i = 0;

    while (i < expression.length) {
      const char = expression[i];

      // Handle quotes
      if ((char === '"' || char === "'") && (i === 0 || expression[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        }
        current += char;
        i++;
        continue;
      }

      // Check for operator outside quotes
      if (!inQuotes && expression.slice(i, i + operator.length) === operator) {
        parts.push(current.trim());
        current = '';
        i += operator.length;
        continue;
      }

      current += char;
      i++;
    }

    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts.length > 1 ? parts : [expression];
  }

  /**
   * Compare two values using the given operator
   * @param left - Left operand
   * @param right - Right operand
   * @param operator - Comparison operator
   * @returns Comparison result
   */
  private compareValues(left: unknown, right: unknown, operator: string): boolean {
    switch (operator) {
      case '===':
        return left === right;
      case '!==':
        return left !== right;
      case '==':
        return left == right;
      case '!=':
        return left != right;
      case '>':
        return Number(left) > Number(right);
      case '<':
        return Number(left) < Number(right);
      case '>=':
        return Number(left) >= Number(right);
      case '<=':
        return Number(left) <= Number(right);
      default:
        return false;
    }
  }

  /**
   * Apply an arithmetic operation to two values
   * @param left - Left operand
   * @param right - Right operand
   * @param operator - Arithmetic operator (+, -, *, /, %)
   * @returns Arithmetic result
   */
  private applyArithmetic(left: unknown, right: unknown, operator: string): number {
    const leftNum = Number(left);
    const rightNum = Number(right);

    switch (operator) {
      case '+':
        return leftNum + rightNum;
      case '-':
        return leftNum - rightNum;
      case '*':
        return leftNum * rightNum;
      case '/':
        return leftNum / rightNum;
      case '%':
        return leftNum % rightNum;
      default:
        return 0;
    }
  }

  /**
   * Check if a value is truthy
   * @param value - Value to check
   * @returns True if value is truthy
   */
  private isTruthy(value: unknown): boolean {
    return !!value;
  }

  /**
   * Evaluate a template literal (backtick string with $\{...\} interpolation)
   * Example: `Hello $\{name\}` or `$\{firstName} $\{lastName\}`
   * @param literal - The template literal string (including backticks)
   * @param context - The context containing variables
   * @returns The interpolated string result
   */
  private evaluateTemplateLiteral(literal: string, context: Context): string {
    // Remove the backticks
    const content = literal.slice(1, -1);

    let result = '';
    let i = 0;

    while (i < content.length) {
      // Look for $\{...\} interpolation
      if (content[i] === '$' && content[i + 1] === '{') {
        // Find the closing }
        let depth = 1;
        let j = i + 2;
        while (j < content.length && depth > 0) {
          if (content[j] === '{') depth++;
          else if (content[j] === '}') depth--;
          j++;
        }

        // Extract and evaluate the expression
        const expression = content.slice(i + 2, j - 1);
        const value = this.evaluate(expression, context);
        result += String(value ?? '');

        i = j;
      } else if (content[i] === '\\' && i + 1 < content.length) {
        // Handle escape sequences
        const nextChar = content[i + 1];
        if (nextChar === 'n') {
          result += '\n';
          i += 2;
        } else if (nextChar === 't') {
          result += '\t';
          i += 2;
        } else if (nextChar === '\\' || nextChar === '`' || nextChar === '$') {
          result += nextChar;
          i += 2;
        } else {
          result += content[i];
          i++;
        }
      } else {
        result += content[i];
        i++;
      }
    }

    return result;
  }
}
