/**
 * Template parser
 * Converts template strings into an Abstract Syntax Tree (AST)
 */

import type { ASTNode } from './types';

/**
 * Parser class for converting template strings to AST
 */
export class Parser {
  private template: string = '';
  private position: number = 0;

  /**
   * Parse a template string into an AST
   * @param {string} template - The template string to parse
   * @returns {ASTNode} - The root AST node
   */
  parse(template: string): ASTNode {
    this.template = template;
    this.position = 0;

    const root: ASTNode = {
      type: 'root',
      children: [],
    };

    while (this.position < this.template.length) {
      const node = this.parseNode();
      if (node) {
        root.children!.push(node);
      }
    }

    return root;
  }

  /**
   * Parse a single node from the current position
   * @returns {ASTNode | null} - The parsed node or null if end of template
   */
  private parseNode(): ASTNode | null {
    // Try to parse partial block {{#> name}}...{{/name}}
    if (this.peek('{{#>')) {
      return this.parsePartialBlock();
    }

    // Try to parse inline partial {{#*inline "name"}}...{{/inline}}
    if (this.peek('{{#*')) {
      return this.parseInlinePartial();
    }

    // Try to parse block helper
    if (this.peek('{{#')) {
      return this.parseBlockHelper();
    }

    // Try to parse partial
    if (this.peek('{{>')) {
      return this.parsePartial();
    }

    // Try to parse expression
    if (this.peek('{{')) {
      return this.parseExpression();
    }

    // Parse text
    return this.parseText();
  }

  /**
   * Parse plain text content
   * @returns {ASTNode | null} - Text node or null if no text found
   */
  private parseText(): ASTNode | null {
    let text = '';

    while (this.position < this.template.length) {
      if (this.peek('{{')) {
        break;
      }
      text += this.template[this.position];
      this.position++;
    }

    if (text.length === 0) {
      return null;
    }

    return {
      type: 'text',
      value: text,
    };
  }

  /**
   * Parse an expression node {{expression}}
   * Can detect helper calls with subexpressions
   * @returns {ASTNode} - Expression node or helperExpression node
   */
  private parseExpression(): ASTNode {
    this.consume('{{');
    this.skipWhitespace();

    // Check if this contains a subexpression (opening paren)
    // If so, parse as a helper expression
    const start = this.position;
    const identifier = this.readIdentifier();
    this.skipWhitespace();

    // Only treat as helper expression if there's a subexpression (opening paren)
    if (identifier && this.peek('(')) {
      // Reset and parse as helper with subexpression arguments
      this.position = start;
      const helperName = this.readIdentifier();
      this.skipWhitespace();

      const args: unknown[] = [];

      while (!this.peek('}}')) {
        // Check for subexpression
        if (this.peek('(')) {
          const subexpr = this.parseSubexpression();
          args.push(subexpr);
          this.skipWhitespace();
          continue;
        }

        // Check if argument starts with a quote
        let token: string;
        if (this.peek('"') || this.peek("'")) {
          const quote = this.template[this.position];
          this.position++; // consume opening quote
          token = this.readUntil(quote);
          this.position++; // consume closing quote
          token = quote + token + quote;
        } else {
          token = this.readUntil(/[\s}]/);
        }

        if (!token) break;

        args.push(token.trim());
        this.skipWhitespace();
      }

      this.consume('}}');

      // Return as a helper call expression
      return {
        type: 'helperExpression',
        helperName,
        args,
      };
    }

    // Otherwise, parse as a simple expression
    this.position = start;
    const expression = this.readUntil('}}');
    this.consume('}}');

    return {
      type: 'expression',
      expression: expression.trim(),
    };
  }

  /**
   * Parse a subexpression (helper arg1 arg2...)
   * Subexpressions allow helpers to be called within other helpers
   * Example: (helper "arg1" arg2)
   * @returns {ASTNode} - Subexpression node (a blockHelper node that will be evaluated)
   * @private
   */
  private parseSubexpression(): ASTNode {
    this.consume('(');
    this.skipWhitespace();

    // Read the helper name
    const helperName = this.readIdentifier();
    this.skipWhitespace();

    // Parse arguments (can include nested subexpressions)
    const args: unknown[] = [];

    while (!this.peek(')')) {
      // Check for nested subexpression
      if (this.peek('(')) {
        const nested = this.parseSubexpression();
        args.push(nested);
        this.skipWhitespace();
        continue;
      }

      // Check if argument starts with a quote
      let token: string;
      if (this.peek('"') || this.peek("'")) {
        const quote = this.template[this.position];
        this.position++; // consume opening quote
        token = this.readUntil(quote);
        this.position++; // consume closing quote
        // Keep the quotes for evaluator to handle
        token = quote + token + quote;
      } else {
        token = this.readUntil(/[\s)]/);
      }

      if (!token) break;

      args.push(token.trim());
      this.skipWhitespace();
    }

    this.consume(')');

    // Return a special node type for subexpressions
    return {
      type: 'subexpression',
      helperName,
      args,
    };
  }

  /**
   * Parse a partial node {{>partialName}}
   * @returns {ASTNode} - Partial node
   */
  private parsePartial(): ASTNode {
    this.consume('{{>');
    this.skipWhitespace();

    let partialName = '';
    let isDynamic = false;
    let partialContext: string | undefined;
    const hash: Record<string, unknown> = {};

    // Check for dynamic partial: {{> (expression) }}
    if (this.peek('(')) {
      this.consume('(');
      partialName = this.readUntil(')');
      this.consume(')');
      isDynamic = true;
      this.skipWhitespace();
    } else {
      // Read static partial name (can include special chars like @, -, .)
      partialName = this.readExtendedIdentifier();
      this.skipWhitespace();
    }

    // Parse arguments and hash parameters
    // {{> myPartial context}} or {{> myPartial key=value}}
    while (!this.peek('}}')) {
      const token = this.readExtendedIdentifier();
      if (!token) break;

      this.skipWhitespace();

      // Check if it's a hash parameter (key=value)
      if (this.peek('=')) {
        this.consume('=');
        this.skipWhitespace();

        // Read value (can be identifier with dots, or quoted string)
        let value = '';
        if (this.peek('"') || this.peek("'")) {
          const quote = this.template[this.position];
          this.position++; // consume opening quote
          value = this.readUntil(quote);
          this.position++; // consume closing quote
        } else {
          value = this.readExtendedIdentifier();
        }

        hash[token] = value.trim();
        this.skipWhitespace();
      } else {
        // It's a context argument (only one allowed, the first one)
        if (!partialContext) {
          partialContext = token;
        }
      }
    }

    this.consume('}}');

    return {
      type: 'partial',
      partialName,
      isDynamic,
      partialContext,
      hash: Object.keys(hash).length > 0 ? hash : undefined,
    };
  }

  /**
   * Parse a partial block node {{#> partialName}}...{{/partialName}}
   * @returns {ASTNode} - Partial block node
   */
  private parsePartialBlock(): ASTNode {
    this.consume('{{#>');
    this.skipWhitespace();

    const partialName = this.readExtendedIdentifier();
    this.skipWhitespace();

    const hash: Record<string, unknown> = {};
    let partialContext: string | undefined;

    // Parse arguments and hash parameters (same as regular partial)
    while (!this.peek('}}')) {
      const token = this.readExtendedIdentifier();
      if (!token) break;

      this.skipWhitespace();

      if (this.peek('=')) {
        this.consume('=');
        this.skipWhitespace();

        // Read value (can be identifier with dots, or quoted string)
        let value = '';
        if (this.peek('"') || this.peek("'")) {
          const quote = this.template[this.position];
          this.position++; // consume opening quote
          value = this.readUntil(quote);
          this.position++; // consume closing quote
        } else {
          value = this.readExtendedIdentifier();
        }

        hash[token] = value.trim();
        this.skipWhitespace();
      } else {
        if (!partialContext) {
          partialContext = token;
        }
      }
    }

    this.consume('}}');

    // Parse block content (failover content)
    const children: ASTNode[] = [];
    while (this.position < this.template.length && !this.peek('{{/')) {
      const node = this.parseNode();
      if (node) {
        children.push(node);
      }
    }

    // Consume closing tag
    this.consume('{{/');
    this.readUntil('}}');
    this.consume('}}');

    return {
      type: 'partialBlock',
      partialName,
      partialContext,
      hash: Object.keys(hash).length > 0 ? hash : undefined,
      children,
    };
  }

  /**
   * Parse an inline partial definition {{#*inline "name"}}...{{/inline}}
   * @returns {ASTNode} - Inline partial node
   */
  private parseInlinePartial(): ASTNode {
    this.consume('{{#*');
    this.skipWhitespace();

    const keyword = this.readIdentifier();
    if (keyword !== 'inline') {
      throw new Error(`Expected 'inline' but got '${keyword}'`);
    }

    this.skipWhitespace();

    // Parse partial name (can be quoted string)
    let inlineName = '';
    if (this.peek('"') || this.peek("'")) {
      const quote = this.template[this.position];
      this.position++; // consume opening quote
      inlineName = this.readUntil(quote);
      this.position++; // consume closing quote
    } else {
      inlineName = this.readIdentifier();
    }

    this.skipWhitespace();
    this.consume('}}');

    // Parse block content
    const children: ASTNode[] = [];
    while (this.position < this.template.length && !this.peek('{{/')) {
      const node = this.parseNode();
      if (node) {
        children.push(node);
      }
    }

    // Consume closing tag
    this.consume('{{/');
    this.readUntil('}}');
    this.consume('}}');

    return {
      type: 'inlinePartial',
      inlineName,
      children,
    };
  }

  /**
   * Parse a block helper node {{#helperName}}...{{/helperName}} or {{#helperName arg/}}
   * @returns {ASTNode} - Block helper node
   */
  private parseBlockHelper(): ASTNode {
    this.consume('{{#');
    this.skipWhitespace();

    const helperName = this.readIdentifier();
    this.skipWhitespace();

    // Parse arguments and hash parameters
    const args: unknown[] = [];
    const hash: Record<string, unknown> = {};

    // For the first argument, read the entire expression (may contain operators)
    // This allows expressions like: {{#if name === "Alice"}} or {{#if age > 18}}
    let isFirstArg = true;

    while (!this.peek('}}') && !this.peek('/}}')) {
      // Check for subexpression (starts with opening paren)
      if (this.peek('(')) {
        const subexpr = this.parseSubexpression();
        args.push(subexpr);
        this.skipWhitespace();
        isFirstArg = false;
        continue;
      }

      // For the first argument, read everything until }} or /}}
      // This allows complex expressions with operators
      // But check for self-closing first
      if (isFirstArg && args.length === 0 && Object.keys(hash).length === 0 && !this.peek('/}}')) {
        // Peek ahead to see if there's a }} or /}} coming
        let lookAhead = this.position;
        let foundOperator = false;
        let insideQuotes = false;
        let quoteChar = '';

        // Scan ahead to see if there are comparison operators in the expression
        // We need to distinguish between hash parameters (key=value) and comparison operators (==, ===, etc.)
        // We also need to skip over quoted strings
        while (lookAhead < this.template.length) {
          const char = this.template[lookAhead];

          // Track quoted strings
          if ((char === '"' || char === "'") && !insideQuotes) {
            insideQuotes = true;
            quoteChar = char;
            lookAhead++;
            continue;
          } else if (insideQuotes && char === quoteChar) {
            insideQuotes = false;
            quoteChar = '';
            lookAhead++;
            continue;
          }

          // Skip characters inside quotes
          if (insideQuotes) {
            lookAhead++;
            continue;
          }

          // Check for end delimiters
          if (
            this.template.substr(lookAhead, 2) === '}}' ||
            this.template.substr(lookAhead, 3) === '/}}'
          ) {
            break;
          }

          const next = this.template[lookAhead + 1];
          const next2 = this.template[lookAhead + 2];

          // Check for multi-character operators first
          if (
            (char === '=' && (next === '=' || (next === '=' && next2 === '='))) || // == or ===
            (char === '!' && next === '=') || // != or !==
            (char === '>' && next === '=') || // >=
            (char === '<' && next === '=') || // <=
            (char === '&' && next === '&') || // &&
            (char === '|' && next === '|') || // ||
            (char === '>' && next !== '=') || // >
            (char === '<' && next !== '=') || // <
            (char === '!' && next !== '=') // !
          ) {
            foundOperator = true;
            break;
          }

          lookAhead++;
        }

        // Only read full expression if we found operators
        if (foundOperator) {
          const fullExpression = this.readUntil(/[}/]/).trim();
          if (fullExpression) {
            args.push(fullExpression);
            isFirstArg = false;
          }
          this.skipWhitespace();
          continue;
        }
      }

      // Check if argument starts with a quote
      let token: string;
      if (this.peek('"') || this.peek("'")) {
        const quote = this.template[this.position];
        this.position++; // consume opening quote
        token = this.readUntil(quote);
        this.position++; // consume closing quote
        // Keep the quotes for evaluator to handle
        token = quote + token + quote;
      } else {
        token = this.readUntil(/[\s=}/]/);
      }

      if (!token) break;

      this.skipWhitespace();

      // Check if it's a hash parameter (key=value)
      if (this.peek('=')) {
        // Remove quotes from key if present (for hash parameter names)
        const key = token.replace(/^['"]|['"]$/g, '');

        this.consume('=');
        this.skipWhitespace();

        // Read the value (could be quoted or unquoted, or a subexpression)
        let value: string | ASTNode;
        if (this.peek('(')) {
          value = this.parseSubexpression();
        } else if (this.peek('"') || this.peek("'")) {
          const quote = this.template[this.position];
          this.position++; // consume opening quote
          const val = this.readUntil(quote);
          this.position++; // consume closing quote
          // Keep the quotes so evaluator can handle it properly
          value = quote + val + quote;
        } else {
          value = this.readUntil(/[\s}/]/).trim();
        }

        hash[key] = value;
      } else {
        // Regular argument
        args.push(token.trim());
        isFirstArg = false;
      }

      this.skipWhitespace();
    }

    // Check for self-closing syntax {{#helper arg/}}
    if (this.peek('/}}')) {
      this.consume('/}}');

      // Self-closing blocks have no children, just the argument as content
      // The helper will be called with the arguments
      return {
        type: 'blockHelper',
        helperName,
        args,
        hash: Object.keys(hash).length > 0 ? hash : undefined,
        children: [],
      };
    }

    this.consume('}}');

    // Parse block content
    const children: ASTNode[] = [];
    let inverseChildren: ASTNode[] | undefined;

    while (this.position < this.template.length) {
      if (this.peek('{{/')) {
        break;
      }

      // Handle {{else if condition}}
      if (this.peek('{{else') && this.peekAhead('{{else if', 10)) {
        // Parse the entire else-if chain recursively
        inverseChildren = this.parseElseIfChain();
        break;
      }

      // Handle {{else}}
      if (this.peek('{{else}}')) {
        this.consume('{{else}}');
        inverseChildren = [];
        while (this.position < this.template.length && !this.peek('{{/')) {
          const node = this.parseNode();
          if (node) {
            inverseChildren.push(node);
          }
        }
        break;
      }

      const node = this.parseNode();
      if (node) {
        children.push(node);
      }
    }

    // Consume closing tag
    this.consume('{{/');
    this.readUntil('}}');
    this.consume('}}');

    const node: ASTNode = {
      type: 'blockHelper',
      helperName,
      args,
      hash: Object.keys(hash).length > 0 ? hash : undefined,
      children,
    };

    if (inverseChildren) {
      node.inverse = inverseChildren;
    }

    return node;
  }

  /**
   * Parse an else-if chain into nested if blocks
   * Handles: {{else if cond1}}...{{else if cond2}}...{{else}}...
   * @returns {ASTNode[]} - Array containing the first else-if block (with nested inverse)
   * @private
   */
  private parseElseIfChain(): ASTNode[] {
    this.consume('{{else');
    this.skipWhitespace();
    this.consume('if');
    this.skipWhitespace();

    // Parse the condition - it may contain subexpressions
    const conditionArgs: unknown[] = [];

    // Check if condition starts with subexpression
    if (this.peek('(')) {
      const subexpr = this.parseSubexpression();
      conditionArgs.push(subexpr);
      this.skipWhitespace();
    } else {
      // Read the full condition as expression
      const condition = this.readUntil(/[}]/).trim();
      conditionArgs.push(condition);
    }

    this.consume('}}');

    // Parse the block content for this else-if
    const children: ASTNode[] = [];
    while (this.position < this.template.length && !this.peek('{{/') && !this.peek('{{else')) {
      const node = this.parseNode();
      if (node) {
        children.push(node);
      }
    }

    // Create the else-if node
    const elseIfNode: ASTNode = {
      type: 'blockHelper',
      helperName: 'if',
      args: conditionArgs,
      children,
    };

    // Check for more else-if or final else
    if (this.peek('{{else') && this.peekAhead('{{else if', 10)) {
      // Another else-if follows - parse recursively
      elseIfNode.inverse = this.parseElseIfChain();
    } else if (this.peek('{{else}}')) {
      // Final else block
      this.consume('{{else}}');
      const elseChildren: ASTNode[] = [];
      while (this.position < this.template.length && !this.peek('{{/')) {
        const node = this.parseNode();
        if (node) {
          elseChildren.push(node);
        }
      }
      elseIfNode.inverse = elseChildren;
    }

    return [elseIfNode];
  }

  /**
   * Check if the current position matches a string without consuming it
   * @param {string} str - The string to check for
   * @returns {boolean} - True if the string matches at current position
   */
  private peek(str: string): boolean {
    return this.template.substr(this.position, str.length) === str;
  }

  /**
   * Check if a string matches ahead at the current position (with length check)
   * @param {string} str - The string to check for
   * @param {number} length - The length to check
   * @returns {boolean} - True if the string matches at current position
   */
  private peekAhead(str: string, length: number): boolean {
    return this.template.substr(this.position, length).startsWith(str);
  }

  /**
   * Consume a string at the current position or throw error if not found
   * @param {string} str - The expected string to consume
   * @returns {void}
   * @throws {Error} - If the expected string is not found
   */
  private consume(str: string): void {
    if (!this.peek(str)) {
      throw new Error(`Expected "${str}" at position ${this.position}`);
    }
    this.position += str.length;
  }

  /**
   * Skip whitespace characters at the current position
   * @returns {void}
   */
  private skipWhitespace(): void {
    while (this.position < this.template.length && /\s/.test(this.template[this.position])) {
      this.position++;
    }
  }

  /**
   * Read an identifier (alphanumeric and underscore)
   * @returns {string} - The identifier string
   */
  private readIdentifier(): string {
    const start = this.position;
    while (
      this.position < this.template.length &&
      /[a-zA-Z0-9_]/.test(this.template[this.position])
    ) {
      this.position++;
    }
    return this.template.substring(start, this.position);
  }

  /**
   * Read an extended identifier (can include dots, dashes, @ for partial names)
   * @returns {string} - The extended identifier string
   */
  private readExtendedIdentifier(): string {
    const start = this.position;
    while (
      this.position < this.template.length &&
      /[a-zA-Z0-9_.\-@]/.test(this.template[this.position])
    ) {
      this.position++;
    }
    return this.template.substring(start, this.position);
  }

  /**
   * Read characters until a delimiter is encountered
   * @param {string | RegExp} delimiter - The delimiter to stop at
   * @returns {string} - The characters read
   */
  private readUntil(delimiter: string | RegExp): string {
    const start = this.position;
    while (this.position < this.template.length) {
      if (typeof delimiter === 'string') {
        if (this.peek(delimiter)) {
          break;
        }
      } else {
        if (delimiter.test(this.template[this.position])) {
          break;
        }
      }
      this.position++;
    }
    return this.template.substring(start, this.position);
  }
}
