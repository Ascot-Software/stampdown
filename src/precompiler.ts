/**
 * Template Precompiler
 * Converts Stampdown templates into optimized JavaScript functions
 * for faster rendering and smaller bundle sizes
 */

import { Parser } from './parser';
import type { ASTNode } from './types';

/**
 * Options for precompiling templates
 */
export interface PrecompileOptions {
  /**
   * List of known helper names to include in the precompiled template
   * If not specified, all helpers encountered in the template will be assumed available
   * Specifying known helpers allows for better tree-shaking and smaller bundles
   */
  knownHelpers?: string[] | 'all';

  /**
   * Include source map information in the precompiled output
   * @default false
   */
  sourceMap?: boolean;

  /**
   * Strict mode - throw errors for unknown helpers instead of warnings
   * @default false
   */
  strict?: boolean;

  /**
   * Identifier/name for this precompiled template
   * Used when storing in the template registry
   */
  templateId?: string;
}

/**
 * Precompiled template result
 */
export interface PrecompiledTemplate {
  /**
   * The compiled JavaScript function as a string
   */
  code: string;

  /**
   * List of helpers used in the template
   */
  usedHelpers: string[];

  /**
   * Original template source
   */
  source: string;

  /**
   * Template identifier if provided
   */
  templateId?: string;

  /**
   * Source map if generated
   */
  sourceMap?: string;
}

/**
 * Precompiler class for converting templates to optimized functions
 */
export class Precompiler {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  /**
   * Precompile a template string into an optimized function
   * @param {string} template - The template string to precompile
   * @param {PrecompileOptions} options - Precompilation options
   * @returns {PrecompiledTemplate} - The precompiled template result
   */
  precompile(template: string, options: PrecompileOptions = {}): PrecompiledTemplate {
    const ast = this.parser.parse(template);
    const usedHelpers = this.extractHelpers(ast);

    // Validate known helpers if specified
    if (options.knownHelpers && options.knownHelpers !== 'all') {
      const unknownHelpers = usedHelpers.filter(
        (helper) => !options.knownHelpers?.includes(helper)
      );

      if (unknownHelpers.length > 0) {
        const message = `Unknown helpers: ${unknownHelpers.join(', ')}`;
        if (options.strict) {
          throw new Error(message);
        }
        console.warn(`[Precompiler] ${message}`);
      }
    }

    const code = this.generateCode(ast, options);

    return {
      code,
      usedHelpers,
      source: template,
      templateId: options.templateId,
      sourceMap: options.sourceMap ? this.generateSourceMap(template, code) : undefined,
    };
  }

  /**
   * Extract all helper names used in the AST
   * @param {ASTNode} node - The AST node to analyze
   * @returns {string[]} - Array of unique helper names
   * @private
   */
  private extractHelpers(node: ASTNode): string[] {
    const helpers = new Set<string>();

    const walk = (n: ASTNode): void => {
      if (n.type === 'blockHelper' && n.helperName) {
        helpers.add(n.helperName);
      }

      if (n.children) {
        n.children.forEach(walk);
      }

      if (n.inverse) {
        n.inverse.forEach(walk);
      }
    };

    walk(node);
    return Array.from(helpers);
  }

  // Counter for generating unique variable names
  private helperCounter = 0;

  /**
   * Generate optimized JavaScript code from AST
   * @param {ASTNode} ast - The parsed template AST
   * @param {PrecompileOptions} options - Precompilation options
   * @returns {string} - Generated JavaScript code
   * @private
   */
  private generateCode(ast: ASTNode, options: PrecompileOptions): string {
    const templateId = options.templateId || 'anonymous';
    const lines: string[] = [];

    // Reset counter for each template
    this.helperCounter = 0;

    lines.push(`// Precompiled template: ${templateId}`);
    lines.push(`const renderer = stampdown.getRenderer();`);
    lines.push(`const helpers = stampdown.getHelperRegistry();`);
    lines.push(`let output = '';`);
    lines.push(``);

    // Generate rendering code
    lines.push(this.generateNodeCode(ast, 'context', 0));

    lines.push(``);
    lines.push(`return output;`);

    return lines.join('\n');
  }

  /**
   * Generate code for a single AST node
   * @param {ASTNode} node - The AST node
   * @param {string} contextVar - Variable name for context
   * @param {number} indent - Indentation level
   * @returns {string} - Generated code
   * @private
   */
  private generateNodeCode(node: ASTNode, contextVar: string, indent: number): string {
    const spaces = '  '.repeat(indent);
    const lines: string[] = [];

    const processChildren = (children: ASTNode[] | undefined): string[] => {
      if (!children || children.length === 0) return [];
      return children.map((child) => this.generateNodeCode(child, contextVar, indent));
    };

    switch (node.type) {
      case 'root':
        if (node.children) {
          lines.push(...processChildren(node.children));
        }
        break;

      case 'text':
        if (node.value) {
          // Escape special characters in text content
          const escaped = String(node.value)
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
          lines.push(`${spaces}output += '${escaped}';`);
        }
        break;

      case 'expression':
        if (node.expression) {
          lines.push(`${spaces}try {`);
          lines.push(
            `${spaces}  const value = stampdown.getEvaluator().evaluate('${node.expression}', ${contextVar});`
          );
          lines.push(`${spaces}  if (value !== undefined && value !== null) {`);
          lines.push(`${spaces}    output += String(value);`);
          lines.push(`${spaces}  }`);
          lines.push(`${spaces}} catch (e) {`);
          lines.push(`${spaces}  console.warn('Expression error:', e);`);
          lines.push(`${spaces}}`);
        }
        break;

      case 'blockHelper':
        if (node.helperName) {
          const helperName = node.helperName;
          const helperId = this.helperCounter++; // Generate unique ID
          const helperVar = `helper_${helperName}_${helperId}`;
          const optionsVar = `options_${helperName}_${helperId}`;
          const argsVar = `args_${helperId}`;

          const argsCode = (node.args || [])
            .map((arg) => (typeof arg === 'string' ? `'${arg}'` : String(arg)))
            .join(', ');

          // Check if this is a self-closing block (no children)
          const isSelfClosing = !node.children || node.children.length === 0;

          lines.push(`${spaces}// Helper: ${helperName}${isSelfClosing ? ' (self-closing)' : ''}`);
          lines.push(`${spaces}const ${helperVar} = helpers.get('${helperName}');`);
          lines.push(`${spaces}if (${helperVar}) {`);

          if (isSelfClosing) {
            // For self-closing blocks, don't generate fn/inverse callbacks
            lines.push(`${spaces}  const ${optionsVar} = { hash: {} };`);
          } else {
            // For regular blocks, generate full options with fn and inverse
            lines.push(`${spaces}  const ${optionsVar} = {`);
            lines.push(`${spaces}    fn: (ctx) => {`);
            lines.push(`${spaces}      let innerOutput = '';`);
            lines.push(`${spaces}      const originalOutput = output;`);
            lines.push(`${spaces}      output = '';`);

            if (node.children) {
              processChildren(node.children).forEach((line) => {
                lines.push(line.replace(/^ {2}/, '      '));
              });
            }

            lines.push(`${spaces}      innerOutput = output;`);
            lines.push(`${spaces}      output = originalOutput;`);
            lines.push(`${spaces}      return innerOutput;`);
            lines.push(`${spaces}    },`);
            lines.push(`${spaces}    inverse: (ctx) => {`);
            lines.push(`${spaces}      let innerOutput = '';`);
            lines.push(`${spaces}      const originalOutput = output;`);
            lines.push(`${spaces}      output = '';`);

            if (node.inverse) {
              processChildren(node.inverse).forEach((line) => {
                lines.push(line.replace(/^ {2}/, '      '));
              });
            }

            lines.push(`${spaces}      innerOutput = output;`);
            lines.push(`${spaces}      output = originalOutput;`);
            lines.push(`${spaces}      return innerOutput;`);
            lines.push(`${spaces}    },`);
            lines.push(`${spaces}    hash: {}`);
            lines.push(`${spaces}  };`);
          }

          // Evaluate args
          if (argsCode) {
            lines.push(`${spaces}  const ${argsVar} = [${argsCode}].map(arg => {`);
            lines.push(`${spaces}    if (typeof arg === 'string') {`);
            lines.push(
              `${spaces}      try { return stampdown.getEvaluator().evaluate(arg, ${contextVar}); }`
            );
            lines.push(`${spaces}      catch { return arg; }`);
            lines.push(`${spaces}    }`);
            lines.push(`${spaces}    return arg;`);
            lines.push(`${spaces}  });`);
          } else {
            lines.push(`${spaces}  const ${argsVar} = [];`);
          }

          lines.push(
            `${spaces}  output += String(${helperVar}(${contextVar}, ${optionsVar}, ...${argsVar}) || '');`
          );
          lines.push(`${spaces}}`);
        }
        break;

      case 'partial':
        lines.push(`${spaces}// Partial: ${node.partialName || node.value}`);

        // Handle dynamic partials
        if (node.isDynamic && node.partialName) {
          lines.push(`${spaces}let partialName_${indent} = '';`);
          lines.push(`${spaces}try {`);
          lines.push(
            `${spaces}  partialName_${indent} = String(stampdown.getEvaluator().evaluate('${node.partialName}', ${contextVar}));`
          );
          lines.push(`${spaces}} catch (e) {`);
          lines.push(`${spaces}  console.error('Error evaluating dynamic partial:', e);`);
          lines.push(`${spaces}}`);
          lines.push(
            `${spaces}const partial_${indent} = stampdown.getPartial(partialName_${indent});`
          );
        } else {
          const partialName = node.partialName || node.value || '';
          lines.push(`${spaces}const partial_${indent} = stampdown.getPartial('${partialName}');`);
        }

        lines.push(`${spaces}if (partial_${indent}) {`);

        // Determine context
        lines.push(`${spaces}  let partialContext_${indent} = ${contextVar};`);
        if (node.partialContext) {
          lines.push(`${spaces}  try {`);
          lines.push(
            `${spaces}    const customCtx = stampdown.getEvaluator().evaluate('${node.partialContext}', ${contextVar});`
          );
          lines.push(`${spaces}    if (typeof customCtx === 'object' && customCtx !== null) {`);
          lines.push(`${spaces}      partialContext_${indent} = customCtx;`);
          lines.push(`${spaces}    }`);
          lines.push(`${spaces}  } catch (e) {}`);
        }

        // Handle hash parameters
        if (node.hash && Object.keys(node.hash).length > 0) {
          lines.push(`${spaces}  const hashParams_${indent} = {};`);
          for (const [key, value] of Object.entries(node.hash)) {
            lines.push(`${spaces}  try {`);
            lines.push(
              `${spaces}    const val = stampdown.getEvaluator().evaluate('${value as string}', ${contextVar});`
            );
            lines.push(
              `${spaces}    hashParams_${indent}['${key}'] = val !== undefined ? val : '${value as string}';`
            );
            lines.push(`${spaces}  } catch {`);
            lines.push(`${spaces}    hashParams_${indent}['${key}'] = '${value as string}';`);
            lines.push(`${spaces}  }`);
          }
          lines.push(
            `${spaces}  partialContext_${indent} = { ...partialContext_${indent}, ...hashParams_${indent} };`
          );
        }

        lines.push(
          `${spaces}  output += stampdown.render(partial_${indent}, partialContext_${indent});`
        );
        lines.push(`${spaces}}`);
        break;

      case 'partialBlock':
        lines.push(`${spaces}// Partial Block: ${node.partialName}`);
        lines.push(
          `${spaces}const partialBlock_${indent} = stampdown.getPartial('${node.partialName}');`
        );
        lines.push(`${spaces}if (partialBlock_${indent}) {`);

        // Render block content for @partial-block
        lines.push(`${spaces}  let blockContent_${indent} = '';`);
        lines.push(`${spaces}  const originalOutput_${indent} = output;`);
        lines.push(`${spaces}  output = '';`);
        if (node.children) {
          processChildren(node.children).forEach((line) => {
            lines.push(line.replace(/^ {2}/, '    '));
          });
        }
        lines.push(`${spaces}  blockContent_${indent} = output;`);
        lines.push(`${spaces}  output = originalOutput_${indent};`);
        lines.push(
          `${spaces}  stampdown.registerInlinePartial('@partial-block', blockContent_${indent});`
        );

        // Determine context for partial block
        lines.push(`${spaces}  let partialBlockContext_${indent} = ${contextVar};`);
        if (node.partialContext) {
          lines.push(`${spaces}  try {`);
          lines.push(
            `${spaces}    const customCtx = stampdown.getEvaluator().evaluate('${node.partialContext}', ${contextVar});`
          );
          lines.push(`${spaces}    if (typeof customCtx === 'object' && customCtx !== null) {`);
          lines.push(`${spaces}      partialBlockContext_${indent} = customCtx;`);
          lines.push(`${spaces}    }`);
          lines.push(`${spaces}  } catch (e) {}`);
        }

        // Handle hash parameters
        if (node.hash && Object.keys(node.hash).length > 0) {
          lines.push(`${spaces}  const blockHashParams_${indent} = {};`);
          for (const [key, value] of Object.entries(node.hash)) {
            lines.push(`${spaces}  try {`);
            lines.push(
              `${spaces}    const val = stampdown.getEvaluator().evaluate('${value as string}', ${contextVar});`
            );
            lines.push(
              `${spaces}    blockHashParams_${indent}['${key}'] = val !== undefined ? val : '${value as string}';`
            );
            lines.push(`${spaces}  } catch {`);
            lines.push(`${spaces}    blockHashParams_${indent}['${key}'] = '${value as string}';`);
            lines.push(`${spaces}  }`);
          }
          lines.push(
            `${spaces}  partialBlockContext_${indent} = { ...partialBlockContext_${indent}, ...blockHashParams_${indent} };`
          );
        }

        lines.push(
          `${spaces}  output += stampdown.render(partialBlock_${indent}, partialBlockContext_${indent});`
        );
        lines.push(`${spaces}  stampdown.unregisterInlinePartial('@partial-block');`);
        lines.push(`${spaces}} else {`);
        lines.push(`${spaces}  // Failover content`);
        if (node.children) {
          processChildren(node.children).forEach((line) => {
            lines.push(line.replace(/^ {2}/, '    '));
          });
        }
        lines.push(`${spaces}}`);
        break;

      case 'inlinePartial':
        lines.push(`${spaces}// Inline Partial: ${node.inlineName}`);
        lines.push(`${spaces}let inlineContent_${indent} = '';`);
        lines.push(`${spaces}const originalOutputInline_${indent} = output;`);
        lines.push(`${spaces}output = '';`);
        if (node.children) {
          processChildren(node.children).forEach((line) => {
            lines.push(line.replace(/^ {2}/, '    '));
          });
        }
        lines.push(`${spaces}inlineContent_${indent} = output;`);
        lines.push(`${spaces}output = originalOutputInline_${indent};`);
        lines.push(
          `${spaces}stampdown.registerInlinePartial('${node.inlineName}', inlineContent_${indent});`
        );
        break;

      case 'comment':
        // Comments are not included in output
        break;

      default:
        console.warn(`Unknown node type: ${node.type}`);
    }

    return lines.join('\n');
  }

  /**
   * Generate a basic source map for debugging
   * @param {string} source - Original template source
   * @param {string} _code - Generated code
   * @returns {string} - Source map as JSON string
   * @private
   */
  private generateSourceMap(source: string, _code: string): string {
    // Simplified source map - in production would use proper source-map library
    return JSON.stringify({
      version: 3,
      sources: ['template.sdt'],
      sourcesContent: [source],
      mappings: '',
      names: [],
    });
  }
}
