/**
 * AST Renderer
 * Converts the AST back to a string with evaluated expressions
 */

import type { ASTNode, Context } from './types';
import { HelperRegistry } from './helpers/registry';
import { ExpressionEvaluator } from './evaluator';
import type { Stampdown } from './stampdown';

/**
 * Renderer class for converting AST to rendered output
 */
export class Renderer {
  private helperRegistry: HelperRegistry;
  private evaluator: ExpressionEvaluator;

  /**
   * Creates a new Renderer instance
   * @param {HelperRegistry} helperRegistry - The helper registry to use for helper resolution
   */
  constructor(helperRegistry: HelperRegistry) {
    this.helperRegistry = helperRegistry;
    this.evaluator = new ExpressionEvaluator();
  }

  /**
   * Render an AST to string output
   * @param {ASTNode} ast - The root AST node to render
   * @param {Context} context - The template context
   * @param {Stampdown} stampdown - The Stampdown instance for partial resolution
   * @returns {string} - The rendered output
   */
  render(ast: ASTNode, context: Context, stampdown: Stampdown): string {
    return this.renderNode(ast, context, stampdown);
  }

  /**
   * Render a single AST node
   * @param {ASTNode} node - The node to render
   * @param {Context} context - The template context
   * @param {Stampdown} stampdown - The Stampdown instance
   * @returns {string} - The rendered node output
   */
  private renderNode(node: ASTNode, context: Context, stampdown: Stampdown): string {
    switch (node.type) {
      case 'root':
        return this.renderChildren(node.children || [], context, stampdown);

      case 'text':
        return node.value || '';

      case 'expression':
        return this.renderExpression(node.expression || '', context);

      case 'assignment':
        return this.renderAssignment(node, context);

      case 'helperExpression':
        return this.renderHelperExpression(node, context, stampdown);

      case 'subexpression':
        return this.renderSubexpression(node, context, stampdown);

      case 'partial':
        return this.renderPartialNode(node, context, stampdown);

      case 'partialBlock':
        return this.renderPartialBlock(node, context, stampdown);

      case 'inlinePartial':
        return this.renderInlinePartial(node, context, stampdown);

      case 'blockHelper':
        return this.renderBlockHelper(node, context, stampdown);

      default:
        return '';
    }
  }

  /**
   * Render an array of child nodes
   * @param {ASTNode[]} children - The child nodes to render
   * @param {Context} context - The template context
   * @param {Stampdown} stampdown - The Stampdown instance
   * @returns {string} - The concatenated rendered output
   */
  private renderChildren(children: ASTNode[], context: Context, stampdown: Stampdown): string {
    return children.map((child) => this.renderNode(child, context, stampdown)).join('');
  }

  /**
   * Render an expression node
   * @param {string} expression - The expression to evaluate
   * @param {Context} context - The template context
   * @returns {string} - The evaluated expression result as string
   */
  private renderExpression(expression: string, context: Context): string {
    try {
      const result = this.evaluator.evaluate(expression, context);
      return String(result ?? '');
    } catch (error) {
      console.error(`Error evaluating expression "${expression}":`, error);
      return '';
    }
  }

  /**
   * Render an assignment node (mutates context, returns empty string)
   * Supports both simple variables and nested properties
   * Example: {{ x = 5 }} or {{ this.fullName = `${firstName} ${lastName}` }}
   * @param {ASTNode} node - The assignment node
   * @param {Context} context - The template context (will be mutated)
   * @returns {string} - Empty string (assignments don't render output)
   * @private
   */
  private renderAssignment(node: ASTNode, context: Context): string {
    const target = node.assignmentTarget || '';
    const valueExpression = node.assignmentValue || '';

    try {
      // Evaluate the right-hand side expression
      const value = this.evaluator.evaluate(valueExpression, context);

      // Handle nested property assignment (e.g., "this.prop" or "obj.nested.prop")
      if (target.includes('.')) {
        const parts = target.split('.');
        let obj: Record<string, unknown> = context;
        let startIndex = 0;

        // Handle 'this' keyword at the start
        if (parts[0] === 'this') {
          if (context.this && typeof context.this === 'object') {
            obj = context.this as Record<string, unknown>;
          } else {
            // If context.this doesn't exist, just assign to context directly
            obj = context;
          }
          startIndex = 1;
        }

        // Navigate to the parent object
        for (let i = startIndex; i < parts.length - 1; i++) {
          const key = parts[i];

          // Ensure the intermediate object exists
          if (!(key in obj) || typeof obj[key] !== 'object' || obj[key] === null) {
            obj[key] = {};
          }
          obj = obj[key] as Record<string, unknown>;
        }

        // Set the final property
        const finalKey = parts[parts.length - 1];
        obj[finalKey] = value;
      } else {
        // Simple variable assignment
        context[target] = value;
      }

      return ''; // Assignments don't produce output
    } catch (error) {
      console.error(`Error in assignment "${target} = ${valueExpression}":`, error);
      return '';
    }
  }

  /**
   * Render a helper expression (helper with arguments in expression context)
   * Example: {{helper arg1 (subhelper arg2)}}
   * @param {ASTNode} node - The helper expression node
   * @param {Context} context - The template context
   * @param {Stampdown} stampdown - The Stampdown instance
   * @returns {string} - The rendered helper result
   * @private
   */
  private renderHelperExpression(node: ASTNode, context: Context, stampdown: Stampdown): string {
    const helperName = node.helperName || '';
    const helper = this.helperRegistry.get(helperName);

    if (!helper) {
      console.warn(`Helper "${helperName}" not found`);
      return '';
    }

    // Evaluate arguments (including subexpressions)
    const args = (node.args || []).map((arg) => this.evaluateArgument(arg, context, stampdown));

    // Helper expressions don't have blocks, so fn and inverse are empty
    const options = {
      fn: (): string => '',
      inverse: (): string => '',
      hash: {},
    };

    return helper(context, options, ...args);
  }

  /**
   * Render a subexpression (evaluate and return result as value, not string)
   * Subexpressions are used as arguments to other helpers
   * @param {ASTNode} node - The subexpression node
   * @param {Context} context - The template context
   * @param {Stampdown} stampdown - The Stampdown instance
   * @returns {string} - The evaluated subexpression result
   * @private
   */
  private renderSubexpression(node: ASTNode, context: Context, stampdown: Stampdown): string {
    const helperName = node.helperName || '';
    const helper = this.helperRegistry.get(helperName);

    if (!helper) {
      console.warn(`Helper "${helperName}" not found in subexpression`);
      return '';
    }

    // Evaluate arguments (including nested subexpressions)
    const args = (node.args || []).map((arg) => this.evaluateArgument(arg, context, stampdown));

    // Subexpressions don't have blocks
    const options = {
      fn: (): string => '',
      inverse: (): string => '',
      hash: {},
    };

    return helper(context, options, ...args);
  }

  /**
   * Evaluate an argument (can be a string expression or a subexpression node)
   * @param {unknown} arg - The argument to evaluate
   * @param {Context} context - The template context
   * @param {Stampdown} stampdown - The Stampdown instance
   * @returns {unknown} - The evaluated argument value
   * @private
   */
  private evaluateArgument(arg: unknown, context: Context, stampdown: Stampdown): unknown {
    // If it's a subexpression node, evaluate it
    if (typeof arg === 'object' && arg !== null && (arg as ASTNode).type === 'subexpression') {
      return this.renderSubexpression(arg as ASTNode, context, stampdown);
    }

    // If it's a string, try to evaluate as expression
    if (typeof arg === 'string') {
      try {
        return this.evaluator.evaluate(arg, context);
      } catch {
        return arg;
      }
    }

    return arg;
  }

  /**
   * Render a partial node with support for dynamic partials, contexts, and hash parameters
   * @param {ASTNode} node - The partial node
   * @param {Context} context - The template context
   * @param {Stampdown} stampdown - The Stampdown instance for partial lookup
   * @returns {string} - The rendered partial output
   */
  private renderPartialNode(node: ASTNode, context: Context, stampdown: Stampdown): string {
    let partialName = node.partialName || '';

    // Handle dynamic partials: {{> (expression) }}
    if (node.isDynamic) {
      try {
        partialName = String(this.evaluator.evaluate(partialName, context));
      } catch (error) {
        console.error(`Error evaluating dynamic partial "${partialName}":`, error);
        return '';
      }
    }

    // Get the partial
    const partial = stampdown.getPartial(partialName);
    if (!partial) {
      console.warn(`Partial "${partialName}" not found`);
      return '';
    }

    // Determine the context to use
    let partialContext = context;
    if (node.partialContext) {
      try {
        // Evaluate context expression
        const customContext = this.evaluator.evaluate(node.partialContext, context);
        if (typeof customContext === 'object' && customContext !== null) {
          partialContext = customContext as Context;
        }
      } catch (error) {
        console.error(`Error evaluating partial context "${node.partialContext}":`, error);
      }
    }

    // Merge hash parameters into context
    if (node.hash && Object.keys(node.hash).length > 0) {
      const evaluatedHash: Context = {};
      for (const [key, value] of Object.entries(node.hash)) {
        const valueStr = String(value);
        try {
          // Try to evaluate the value as an expression
          const evaluated = this.evaluator.evaluate(valueStr, context);
          // If evaluation succeeded and returned a value, use it
          if (evaluated !== undefined) {
            evaluatedHash[key] = evaluated;
          } else {
            // If the variable doesn't exist, treat as literal string
            evaluatedHash[key] = valueStr;
          }
        } catch {
          // If evaluation fails completely, treat as literal string
          evaluatedHash[key] = valueStr;
        }
      }
      partialContext = { ...partialContext, ...evaluatedHash };
    }

    return stampdown.render(partial, partialContext);
  }

  /**
   * Render a partial block with failover content
   * @param {ASTNode} node - The partial block node
   * @param {Context} context - The template context
   * @param {Stampdown} stampdown - The Stampdown instance
   * @returns {string} - The rendered output
   */
  private renderPartialBlock(node: ASTNode, context: Context, stampdown: Stampdown): string {
    const partialName = node.partialName || '';
    const partial = stampdown.getPartial(partialName);

    // If partial not found, render failover content
    if (!partial) {
      return this.renderChildren(node.children || [], context, stampdown);
    }

    // Set up @partial-block special partial with the block content
    const blockContent = this.renderChildren(node.children || [], context, stampdown);
    stampdown.registerInlinePartial('@partial-block', blockContent);

    // Determine the context to use
    let partialContext = context;
    if (node.partialContext) {
      try {
        const customContext = this.evaluator.evaluate(node.partialContext, context);
        if (typeof customContext === 'object' && customContext !== null) {
          partialContext = customContext as Context;
        }
      } catch (error) {
        console.error(`Error evaluating partial block context "${node.partialContext}":`, error);
      }
    }

    // Merge hash parameters
    if (node.hash && Object.keys(node.hash).length > 0) {
      const evaluatedHash: Context = {};
      for (const [key, value] of Object.entries(node.hash)) {
        const valueStr = String(value);
        try {
          const evaluated = this.evaluator.evaluate(valueStr, context);
          if (evaluated !== undefined) {
            evaluatedHash[key] = evaluated;
          } else {
            evaluatedHash[key] = valueStr;
          }
        } catch {
          evaluatedHash[key] = valueStr;
        }
      }
      partialContext = { ...partialContext, ...evaluatedHash };
    }

    const result = stampdown.render(partial, partialContext);

    // Clean up the @partial-block
    stampdown.unregisterInlinePartial('@partial-block');

    return result;
  }

  /**
   * Render an inline partial definition (no output, just registers the partial)
   * @param {ASTNode} node - The inline partial node
   * @param {Context} context - The template context
   * @param {Stampdown} stampdown - The Stampdown instance
   * @returns {string} - Empty string (inline partials produce no output)
   */
  private renderInlinePartial(node: ASTNode, context: Context, stampdown: Stampdown): string {
    const inlineName = node.inlineName || '';
    const content = this.renderChildren(node.children || [], context, stampdown);

    // Register the inline partial (block-scoped)
    stampdown.registerInlinePartial(inlineName, content);

    // Inline partials produce no output
    return '';
  }

  /**
   * Render a block helper node
   * @param {ASTNode} node - The block helper node
   * @param {Context} context - The template context
   * @param {Stampdown} stampdown - The Stampdown instance
   * @returns {string} - The rendered helper output
   */
  private renderBlockHelper(node: ASTNode, context: Context, stampdown: Stampdown): string {
    const helperName = node.helperName || '';
    const helper = this.helperRegistry.get(helperName);

    if (!helper) {
      console.warn(`Helper "${helperName}" not found`);
      return '';
    }

    // Evaluate hash parameters (can include subexpressions)
    const evaluatedHash: Context = {};
    if (node.hash) {
      for (const [key, value] of Object.entries(node.hash)) {
        // Use evaluateArgument to handle subexpressions in hash values
        evaluatedHash[key] = this.evaluateArgument(value, context, stampdown);
      }
    }

    const options = {
      fn: (ctx: Context): string => this.renderChildren(node.children || [], ctx, stampdown),
      inverse: (ctx: Context): string => this.renderChildren(node.inverse || [], ctx, stampdown),
      hash: evaluatedHash,
    };

    // Use evaluateArgument to handle subexpressions
    const args = (node.args || []).map((arg) => this.evaluateArgument(arg, context, stampdown));

    return helper(context, options, ...args);
  }
}
