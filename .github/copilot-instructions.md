# GitHub Copilot Instructions for Stampdown

This document provides context and guidelines for AI assistants working on the Stampdown monorepo codebase.

## Project Purpose

Stampdown is a powerful Markdown templating language with Handlebars-like expressions, partials, block helpers, and hooks. It combines the simplicity of Markdown with the power of template expressions, enabling developers to create dynamic content with clean, readable templates.

**Key Features:**
- Handlebars-compatible syntax for familiarity
- Variable assignment with template literals and arithmetic
- Advanced expressions (comparison operators, else-if chains, subexpressions)
- Advanced partials (dynamic, contexts, hash parameters, blocks, inline)
- Self-closing block syntax (`{{#.../}}`) for concise templates
- Plugin system for extensibility
- Template precompilation for performance
- CLI tool for build workflows
- VS Code extension with syntax highlighting
- LLM plugin for prompt templating with multi-provider support

## Monorepo Structure

This is an npm workspaces monorepo with 4 scoped packages:

```
stampdown/
├── packages/
│   ├── core/                     # @stampdwn/core - Core templating engine
│   │   ├── src/
│   │   │   ├── stampdown.ts      # Main Stampdown class (entry point)
│   │   │   ├── parser.ts         # Template parser (string → AST)
│   │   │   ├── renderer.ts       # AST renderer (AST → output)
│   │   │   ├── evaluator.ts      # Expression evaluator
│   │   │   ├── loader.ts         # Template file loader (.sdt files)
│   │   │   ├── precompiler.ts    # Template precompiler (AST → JS)
│   │   │   ├── plugin.ts         # Plugin system types and helpers
│   │   │   ├── types.ts          # TypeScript type definitions
│   │   │   ├── index.ts          # Public API exports
│   │   │   ├── helpers/
│   │   │   │   ├── registry.ts   # Helper function registry
│   │   │   │   └── builtin.ts    # Built-in helpers (if, each, with, etc.)
│   │   │   ├── plugins/          # Core plugin implementations
│   │   │   │   ├── index.ts      # Plugin exports
│   │   │   │   ├── string-helpers.ts  # String manipulation
│   │   │   │   ├── math-helpers.ts    # Math operations
│   │   │   │   ├── date-helpers.ts    # Date formatting
│   │   │   │   ├── array-helpers.ts   # Array operations
│   │   │   │   └── debug.ts           # Debug utilities
│   │   │   └── __tests__/        # Jest test suites (133 tests)
│   │   │       ├── stampdown.test.ts
│   │   │       ├── advanced-expressions.test.ts
│   │   │       ├── variable-assignment.test.ts
│   │   │       ├── parser.test.ts
│   │   │       ├── precompiler.test.ts
│   │   │       ├── loader.test.ts
│   │   │       ├── partials.test.ts
│   │   │       └── plugin.test.ts
│   │   └── package.json
│   │
│   ├── cli/                      # @stampdwn/cli - Command-line interface
│   │   ├── src/
│   │   │   ├── cli.ts            # CLI implementation
│   │   │   └── __tests__/        # CLI tests (19 tests)
│   │   │       └── cli.test.ts
│   │   ├── bin/
│   │   │   └── stampdown.js      # CLI executable
│   │   └── package.json
│   │
│   ├── llm/                      # @stampdwn/llm - LLM plugin package
│   │   ├── src/
│   │   │   ├── index.ts          # Plugin exports
│   │   │   ├── helpers.ts        # LLM-specific helpers
│   │   │   ├── types.ts          # Type definitions
│   │   │   ├── tokenizer.ts      # Token counting utilities
│   │   │   ├── adapters/
│   │   │   │   └── ai-sdk.ts     # @ai-sdk normalization
│   │   │   └── __tests__/        # LLM tests (29 tests)
│   │   │       └── llm-plugin.test.ts
│   │   └── package.json
│   │
│   └── vscode/                   # @stampdwn/vscode - VS Code extension
│       ├── syntaxes/
│       │   └── stampdown.tmLanguage.json  # TextMate grammar (939 lines)
│       ├── test-grammar.sdt      # Grammar test file
│       └── package.json
│
├── package.json                  # Root workspace configuration
├── tsconfig.json                 # Root TypeScript config
├── jest.config.js                # Root Jest config
├── eslint.config.mjs            # ESLint flat config (v9+)
└── README.md                     # Main documentation
│   ├── syntaxes/
│   │   └── stampdown.tmLanguage.json  # TextMate grammar (939 lines)
│   └── test-*.sdt                # Test template files
├── bin/

├── package.json                  # NPM package configuration
├── tsconfig.json                 # TypeScript configuration
├── jest.config.js                # Jest test configuration
└── README.md                     # Main documentation

```

## Architecture Overview

### Processing Pipeline

```
Template String → Parser → AST → Renderer → Output String
                                    ↓
                            Helper Registry
                            Partial Registry
                            Expression Evaluator
```

### Precompilation Pipeline

```
Template String → Parser → AST → Precompiler → JavaScript Function
                                                       ↓
                                               (Executed at runtime)
```

## Templating Structure

### Expressions

Expressions interpolate variables with dot notation for nested properties:

```handlebars
{{name}}
{{user.email}}
{{product.price}}
```

**Implementation:** `evaluator.ts` handles expression evaluation with support for:
- Dot notation for nested properties
- Literal values: numbers, strings (quoted), booleans, null, undefined
- Special variables: `@index`, `@first`, `@last`, `@key`, `@root`, `@partial-block`
- `this` keyword for current context

### Control Flow

**Block Helpers** provide control flow structures:

```handlebars
{{#if premium}}Premium{{else}}Free{{/if}}
{{#unless admin}}No access{{/unless}}
{{#each items}}{{this}}{{/each}}
{{#with user}}{{name}}{{/with}}
```

**Implementation:**
- `parser.ts` - Parses block helpers into AST nodes
- `renderer.ts` - Executes block helpers with context management
- `helpers/builtin.ts` - Implements core block helpers (if, unless, each, with, lookup, log)

**Self-Closing Block Syntax (`{{#.../}}}`):**

For helpers that return values directly without needing content blocks, use the self-closing block syntax:

```handlebars
{{#uppercase name/}}
{{#add x y/}}
{{#capitalize title/}}
```

This syntax:
- Uses `#` to indicate a helper call (like block helpers)
- Ends with `/}}` instead of requiring a closing tag
- Is 30-40% more concise than `{{#helper}}{{/helper}}`
- Works with any helper that returns a value directly
- Cannot be used with block helpers that need content (if, each, with, unless)

### Advanced Expressions

**Comparison Operators** enable direct comparisons in templates:

```handlebars
{{#if age > 18}}Adult{{/if}}
{{#if tier === "gold"}}Premium{{/if}}
{{#if premium && verified}}Elite{{/if}}
```

**Supported Operators:**
- Equality: `===`, `!==`, `==`, `!=`
- Comparison: `>`, `<`, `>=`, `<=`
- Logical: `&&`, `||`, `!`

**Else-If Chaining** allows multiple conditions:

```handlebars
{{#if score >= 90}}
  A
{{else if score >= 80}}
  B
{{else}}
  C
{{/if}}
```

**Subexpressions** enable nested helper calls:

```handlebars
{{#if (gt (length items) 10)}}Many items{{/if}}
{{#uppercase (concat firstName " " lastName)/}}
```

**Implementation:**
- `evaluator.ts` - Handles operator evaluation with precedence (||, &&, comparisons, !)
- `parser.ts` - Parses subexpressions `(helper arg1 arg2)` and else-if chains
- `renderer.ts` - Renders subexpressions and helper expressions
- `precompiler.ts` - Generates optimized code for advanced expressions

**Key Features:**
- Quote-aware operator parsing (doesn't split inside strings)
- Recursive else-if chain parsing (unlimited depth)
- Nested subexpressions (multiple levels)
- Full precompiler support with helper extraction

### Variable Assignment

**Context variable assignment** allows dynamic setting and modification of variables within templates:

```handlebars
{{ x = 5 }}
{{ name = "Alice" }}
{{ fullName = `${firstName} ${lastName}` }}
{{ this.computed = value }}
{{ total = price + tax }}
```

**Syntax:**
- Assignment: `{{ variableName = expression }}`
- Template literals: Backtick strings with `${...}` interpolation
- Arithmetic: `+`, `-`, `*`, `/`, `%` operators
- Nested properties: `this.prop`, `obj.nested.prop`

**Implementation:**
- `parser.ts` - Detects assignment pattern (`detectAssignment()` method)
- `evaluator.ts` - Evaluates template literals (`evaluateTemplateLiteral()`) and arithmetic (`applyArithmetic()`)
- `renderer.ts` - Mutates context directly (`renderAssignment()` method)
- `precompiler.ts` - Generates `context[varName] = value` code
- `helpers/builtin.ts` - Modified `each` and `with` to support context mutation

**Key Features:**
- Assignments return empty string (no output)
- Context persistence across template
- Works in all block helpers
- Full arithmetic expression support
- Template literal interpolation with `${...}`
- Nested property assignment with automatic object creation

**Usage Patterns:**
```handlebars
{{! Accumulator }}
{{ total = 0 }}
{{#each items}}
  {{ total = total + this.price }}
{{/each}}

{{! Loop enhancement }}
{{#each users}}
  {{ this.fullName = `${this.firstName} ${this.lastName}` }}
{{/each}}

{{! Conditional assignment }}
{{#if premium}}{{ discount = 20 }}{{else}}{{ discount = 0 }}{{/if}}
```

### Partials

Partials enable template reuse with advanced Handlebars-compatible features:

**Basic Partials:**
```handlebars
{{> header}}
{{> footer}}
```

**Advanced Partials:**
```handlebars
<!-- Dynamic partials -->
{{> (partialName) }}

<!-- Partial with context -->
{{> userCard user}}

<!-- Hash parameters -->
{{> button text="Click" class="primary"}}

<!-- Partial blocks -->
{{#> layout}}
  Content here
  {{> @partial-block}}
{{/layout}}

<!-- Inline partials -->
{{#*inline "greeting"}}
  Hello, {{name}}!
{{/inline}}
{{> greeting}}
```

**Implementation:**
- `parser.ts` - Parses all partial types (parsePartial, parsePartialBlock, parseInlinePartial)
- `renderer.ts` - Renders partials with context/hash handling
- `stampdown.ts` - Manages partial registries (regular + inline/block-scoped)

**Key Methods:**
- `registerPartial(name, content)` - Register a reusable partial
- `getPartial(name)` - Retrieve partial (checks inline first)
- `registerInlinePartial(name, content)` - Block-scoped partials
- `unregisterInlinePartial(name)` - Clean up after partial block

## Built-in Helpers

Located in `packages/core/src/helpers/builtin.ts`:

- **if** - Conditional rendering (truthy check)
- **unless** - Inverse conditional
- **each** - Array iteration (provides @index, @first, @last)
- **with** - Context switching
- **lookup** - Dynamic property access
- **log** - Debug logging

**Helper Signature:**
```typescript
type Helper = (
  context: Context,
  options: HelperOptions,
  ...args: unknown[]
) => string;
```

## Extending with Helpers

### Custom Helpers

```typescript
stampdown.registerHelper('myHelper', (context, options, ...args) => {
  // Return rendered string
  return String(args[0]).toUpperCase();
});
```

### Plugin System

Plugins provide a structured way to add functionality:

```typescript
import { createPlugin } from './plugin';

export const myPlugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  description: 'Does something useful',
  plugin: (stampdown, options) => {
    stampdown.registerHelper('myHelper', (ctx, opts, ...args) => {
      return 'result';
    });
  }
});
```

**Built-in Plugins:**

All plugins are located in `packages/core/src/plugins/` and can be imported from `@stampdwn/core/plugins`.

#### String Helpers Plugin
**Location:** `packages/core/src/plugins/string-helpers.ts`

Provides string manipulation helpers:
- **uppercase** - Convert text to uppercase
- **lowercase** - Convert text to lowercase
- **capitalize** - Capitalize first letter
- **trim** - Remove whitespace from both ends
- **repeat** - Repeat text N times
- **truncate** - Truncate text to max length

**Usage:**
```typescript
import { stringHelpersPlugin } from '@stampdwn/core/plugins';

const stampdown = new Stampdown({
  plugins: [stringHelpersPlugin]
});

// Template: {{#uppercase name/}}
// With context: { name: 'alice' }
// Output: ALICE
```

#### Math Helpers Plugin
**Location:** `packages/core/src/plugins/math-helpers.ts`

Provides mathematical operation helpers:
- **add** - Add numbers
- **subtract** - Subtract numbers
- **multiply** - Multiply numbers
- **divide** - Divide numbers
- **mod** - Modulo operation
- **round** - Round to decimal places
- **min** - Find minimum value
- **max** - Find maximum value

**Usage:**
```typescript
import { mathHelpersPlugin } from '@stampdwn/core/plugins';

const stampdown = new Stampdown({
  plugins: [mathHelpersPlugin]
});

// Template: {{#add price tax/}}
// With context: { price: 100, tax: 15 }
// Output: 115
```

#### Date Helpers Plugin
**Location:** `packages/core/src/plugins/date-helpers.ts`

Provides date formatting and manipulation helpers:
- **formatDate** - Format date with pattern (YYYY-MM-DD, etc.)
- **now** - Get current timestamp (ISO format)
- **timeAgo** - Human-readable relative time

**Usage:**
```typescript
import { dateHelpersPlugin } from '@stampdwn/core/plugins';

const stampdown = new Stampdown({
  plugins: [dateHelpersPlugin]
});

// Template: {{#formatDate date "YYYY-MM-DD"/}}
// With context: { date: new Date('2025-10-03') }
// Output: 2025-10-03
```

#### Array Helpers Plugin
**Location:** `packages/core/src/plugins/array-helpers.ts`

Provides array manipulation helpers:
- **join** - Join array elements with separator
- **length** - Get length of array/string/object
- **slice** - Extract portion of array
- **reverse** - Reverse array order
- **sort** - Sort array

**Usage:**
```typescript
import { arrayHelpersPlugin } from '@stampdwn/core/plugins';

const stampdown = new Stampdown({
  plugins: [arrayHelpersPlugin]
});

// Template: {{#join tags ", "/}}
// With context: { tags: ['node', 'typescript', 'markdown'] }
// Output: node, typescript, markdown
```

#### Debug Plugin
**Location:** `packages/core/src/plugins/debug.ts`

Provides debugging and introspection helpers:
- **json** - Stringify value as JSON
- **typeof** - Get type of value
- **keys** - Get object keys
- **values** - Get object values

**Usage:**
```typescript
import { debugPlugin } from '@stampdwn/core/plugins';

const stampdown = new Stampdown({
  plugins: [debugPlugin]
});

// Template: {{#json user/}}
// With context: { user: { name: 'Alice', age: 30 } }
// Output: {"name":"Alice","age":30}
```

#### LLM Plugin
**Location:** `packages/llm/src/`

Provides specialized helpers for prompt engineering and LLM conversation templating with multi-provider support.

**Dependencies:** `@ai-sdk/provider`, `yaml`, `gpt-tokenizer`, `zod`

**Key Features:**
- **Multi-Provider Normalization**: Normalizes messages from OpenAI, Anthropic, Azure OpenAI, Google Vertex AI, and custom providers via @ai-sdk
- **Role-Aware Helpers**: Filter and format messages by role (user, assistant, system, tool)
- **Content Handling**: Extract and manipulate text, images, and tool content
- **Token Management**: Count tokens and truncate content by token limits using gpt-tokenizer
- **Message Windowing**: Select message ranges for context management
- **Provider Shape Conversion**: Convert between normalized format and provider-specific formats

**Normalized Types:**
```typescript
// All providers normalized to these types
type NormRole = 'system' | 'user' | 'assistant' | 'tool' | 'function';

type NormContent =
  | { type: 'text'; text: string }
  | { type: 'image'; url?: string; data?: string; mime?: string; alt?: string }
  | { type: 'tool_result'; toolName?: string; callId?: string; result: unknown };

interface NormMessage {
  role: NormRole;
  name?: string;
  content: NormContent[];
  meta?: Record<string, unknown>;
}

interface NormChat {
  provider: 'openai' | 'anthropic' | 'azure' | 'vertex' | 'other';
  model?: string;
  messages: NormMessage[];
  meta?: Record<string, unknown>;
}
```

**Helpers Provided:**

*Context Normalization:*
- **withChat** - Normalize raw chat payload via @ai-sdk and set as block context

*Message Iteration:*
- **eachMessage** - Iterate over all messages (provides @index, @first, @last)
- **eachByRole** - Iterate over messages filtered by role

*Role Gates (Conditional Rendering):*
- **ifUser** - Render block only for user messages
- **ifAssistant** - Render block only for assistant messages
- **ifSystem** - Render block only for system messages
- **ifTool** - Render block only for tool messages

*Content Helpers:*
- **eachContent** - Iterate over all content items in a message
- **eachText** - Iterate over text content only (filters out images, tools)
- **joinText** - Join all text content with separator
- **firstText** - Get first text content from message
- **lastText** - Get last text content from message

*Windowing & Tokens:*
- **window** - Select message range (size, from start/end, optional role filter)
- **tokenCount** - Count tokens in text using gpt-tokenizer
- **truncateTokens** - Truncate by token limit (block/text/message modes)

*Formatting:*

- **codeFence** - Wrap content in markdown code fence
- **json** - Stringify value as JSON
- **yaml** - Stringify value as YAML
- **renderChat** - Convert chat to provider-specific format (OpenAI, Anthropic, normalized)

**Usage:**
```typescript
import { Stampdown } from '@stampdwn/core';
import { llmPlugin } from '@stampdwn/llm';

const stampdown = new Stampdown({
  plugins: [llmPlugin]
});

// Basic role-aware template
const template = `
{{#withChat raw=chat}}
{{#eachMessage}}
{{#ifUser}}👤 User: {{#firstText this/}}{{/ifUser}}
{{#ifAssistant}}🤖 Assistant: {{#firstText this/}}{{/ifAssistant}}
{{/eachMessage}}
{{/withChat}}
`;

const result = stampdown.render(template, {
  chat: {
    provider: 'openai',
    model: 'gpt-4',
    messages: [
      { role: 'user', content: [{ type: 'text', text: 'Hello!' }] },
      { role: 'assistant', content: [{ type: 'text', text: 'Hi there!' }] }
    ]
  }
});
```

**Advanced Example with Windowing and Token Management:**
```typescript
const promptTemplate = `
{{#withChat raw=chat}}
## Context
{{#window size=5 from="end" role="user"}}
{{#eachMessage}}
User Query {{@index}}: {{#truncateTokens this max=100 on="message"/}}
{{/eachMessage}}
{{/window}}

## Full Conversation
Token count: {{#tokenCount (renderChat this format="json" shape="norm")/}}
{{/withChat}}
`;
```

**Self-Closing Syntax for LLM Helpers:**

Non-block helpers (those that return values directly) use self-closing syntax with `{{#.../}}`:

```handlebars
{{#firstText message/}}          ✅ Correct
{{firstText message}}             ❌ Wrong (treated as property lookup)

{{#tokenCount "Hello world"/}}   ✅ Correct
{{#joinText msgs sep=" | "/}}    ✅ Correct
{{#renderChat chat format="json" shape="openai"/}}  ✅ Correct
```

Block helpers (those with content blocks) use standard syntax:

```handlebars
{{#withChat raw=chat}}...{{/withChat}}           ✅ Block helper
{{#eachMessage}}...{{/eachMessage}}              ✅ Block helper
{{#ifUser}}...{{else}}...{{/ifUser}}             ✅ Block helper with inverse
{{#window size=5}}...{{/window}}                 ✅ Block helper
{{#window size=5}}...{{/window}}               ✅ Block helper
```

**Custom Tokenizer:**
```typescript
import { llmPlugin, type Tokenizer } from '@stampdwn/llm';

const customTokenizer: Tokenizer = {
  count: (text: string) => text.split(/\s+/).length,
  truncateByTokens: (text: string, maxTokens: number) => {
    const words = text.split(/\s+/);
    return words.slice(0, maxTokens).join(' ');
  }
};

const stampdown = new Stampdown({
  plugins: [
    {
      ...llmPlugin,
      options: { tokenizer: customTokenizer }
    }
  ]
});
```

**Provider Normalization:**

The plugin uses @ai-sdk as a single normalization boundary. All provider-specific types stay in `adapters/ai-sdk.ts` and never leak into the rest of the codebase. This ensures:
- Clean separation of concerns
- Easy addition of new providers
- Consistent internal types throughout templates

**Architecture:**
```
Provider Messages → @ai-sdk → normalizeFromAiSdk() → NormChat → Helpers → Output
                      ↑ (only boundary)
```

**Testing LLM Helpers:**
- Test file: `packages/llm/src/__tests__/llm-plugin.test.ts` (29 tests)
- Run: `npm test -- llm-plugin.test`
- All helpers have comprehensive test coverage
- Tests include normalization, role filtering, content extraction, windowing, tokens, and formatting

**Documentation:**
- Full README: `packages/llm/README.md`
- Main plugins README: `packages/core/src/plugins/README.md` (includes LLM plugin section)
- All helpers have JSDoc with usage examples

**Implementation Notes:**
- Type predicates used for content filtering: `(c): c is Extract<NormContent, { type: 'text' }> => c.type === 'text'`
- Context management follows builtin helper patterns (spread operator, special variables)
- Hash parameter evaluation in renderer has fallback logic for quoted strings
- Parser properly handles quoted strings in both arguments and hash parameters
- Self-closing block helpers (`{{#helper arg/}}`) create blockHelper AST nodes with empty children

**When to Use LLM Plugin:**
- Building prompt templates for LLM APIs
- Formatting conversation history
- Implementing context windowing for token limits
- Converting between provider message formats
- Debugging LLM payloads (json/yaml output)
- Creating role-specific prompt sections
- Managing multi-turn conversations

**Loading Multiple Plugins:**
```typescript
import { Stampdown } from '@stampdwn/core';
import {
  stringHelpersPlugin,
  mathHelpersPlugin,
  dateHelpersPlugin,
  arrayHelpersPlugin,
  debugPlugin
} from '@stampdwn/core/plugins';
import { llmPlugin } from '@stampdwn/llm';

const stampdown = new Stampdown({
  plugins: [
    stringHelpersPlugin,
    mathHelpersPlugin,
    dateHelpersPlugin,
    arrayHelpersPlugin,
    debugPlugin,
    llmPlugin
  ]
});
```

## Precompiling

The precompiler converts templates to optimized JavaScript functions for better performance:

```typescript
import { Precompiler } from './precompiler';

const precompiler = new Precompiler();
const compiled = precompiler.precompile(template, {
  templateId: 'my-template',
  knownHelpers: ['if', 'each', 'uppercase'],
  strict: true,
  sourceMap: true
});

// compiled.code contains JavaScript function as string
```

**Generated Code Structure:**
```javascript
const renderer = stampdown.getRenderer();
const helpers = stampdown.getHelperRegistry();
let output = '';

// Generated node-by-node code
output += 'Hello ';
output += String(context.name || '');

return output;
```

**Key Features:**
- Tree-shaking with `knownHelpers`
- Unique variable names to avoid collisions
- Supports all advanced partial features
- Optional source maps

## CLI

The CLI tool (`@stampdwn/cli`) precompiles templates for build workflows:

```bash
stampdown compile "src/**/*.sdt" --output dist/templates --format esm
```

**Options:**
- `-i, --input` - Input glob pattern
- `-o, --output` - Output directory
- `-k, --known-helpers` - Known helpers for tree-shaking
- `-s, --strict` - Error on unknown helpers
- `-f, --format` - Output format (esm, cjs, json)
- `-w, --watch` - Watch mode
- `-m, --source-map` - Generate source maps

**Implementation:** `packages/cli/src/cli.ts`
- Glob pattern matching
- Template compilation
- Multiple output formats
- Watch mode with file monitoring
- Render mode for processing templates with data
- Batch processing capabilities

## Syntax Highlighting

The VS Code extension (`@stampdwn/vscode`) provides syntax highlighting via TextMate grammar.

**Grammar File:** `packages/vscode/syntaxes/stampdown.tmLanguage.json` (939 lines)

**Supported Patterns:**
- Expressions: `{{name}}`
- Block helpers: `{{#if}}...{{/if}}`
- Self-closing blocks: `{{#helper arg/}}`
- Basic partials: `{{> partial}}`
- Dynamic partials: `{{> (expression) }}`
- Partial blocks: `{{#> layout}}...{{/layout}}`
- Inline partials: `{{#*inline "name"}}...{{/inline}}`
- Comments: `{{!-- comment --}}`
- Special variables: `@index`, `@first`, `@last`, `@partial-block`

**Pattern Order:** More specific patterns come first to prevent incorrect matching:
1. Self-closing helpers
2. Block helpers (if, unless, each, with)
3. Inline partials
4. Partial blocks
5. Custom block helpers
6. Partials
7. Expressions
8. Comments

## Development Guidelines

### Code Quality Standards

#### 1. JSDoc Documentation

**REQUIRED:** Every function must have JSDoc comments.

```typescript
/**
 * Parse a template string into an AST
 * @param {string} template - The template string to parse
 * @returns {ASTNode} - The root AST node
 */
parse(template: string): ASTNode {
  // Implementation
}
```

**JSDoc Requirements:**
- Description of what the function does
- `@param` tags for all parameters with types and descriptions
- `@returns` tag with return type and description
- `@private` tag for internal methods
- `@throws` tag if function can throw errors
- `@example` tag for complex functions or plugins

**Current Status:** 100% JSDoc coverage across all source files.

#### 2. Testing

**REQUIRED:** Write tests for all new functionality.

**Test Location:** `packages/*/src/__tests__/`

**Running Tests:**
```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- stampdown.test  # Run specific test file
```

**Test Coverage:**
- Current: 103 tests across 6 test suites (includes 31 LLM plugin tests)
- All tests must pass before committing
- Aim for high coverage of edge cases

**Test Structure:**
```typescript
describe('Feature Name', () => {
  it('should handle basic case', () => {
    const stampdown = new Stampdown();
    const result = stampdown.render('{{name}}', { name: 'Alice' });
    expect(result).toBe('Alice');
  });

  it('should handle edge case', () => {
    // Test edge cases
  });
});
```

#### 3. Code Formatting

**REQUIRED:** Run linting and formatting before committing.

```bash
npm run lint      # Check for linting errors
npm run format    # Auto-format code with Prettier
npm run build     # Verify TypeScript compilation
```

**Standards:**
- ESLint with TypeScript rules enabled
- Prettier for consistent formatting
- Strict TypeScript mode
- No unused variables (prefix with `_` if intentional)

### Task Workflow

When working on a task, follow this workflow:

#### 1. Understand the Task
- Read the feature request or bug report carefully
- Check existing documentation in `docs/` for context
- Review related test files to understand current behavior
- Check the grammar file if it involves syntax changes

#### 2. Plan the Changes
- Identify which files need modifications
- Consider impact on other components (parser → renderer → precompiler)
- Plan test cases before implementing
- Consider backward compatibility

#### 3. Implement Changes
- Follow existing code patterns and style
- Add JSDoc comments to all new functions
- Keep functions focused and single-purpose
- Use TypeScript types strictly (no `any` unless absolutely necessary)

#### 4. Test Thoroughly
- Write unit tests for new functionality
- Test edge cases and error conditions
- Run existing tests to ensure no regressions
- Manually test if adding new syntax or features

#### 5. Documentation
- **DO NOT** write separate summary documents
- **DO** output summaries in chat conversations
- Update `README.md` if adding user-facing features
- Update relevant docs in `docs/` if changing existing features
- Update VS Code extension README if changing syntax

#### 6. Verify Quality
```bash
npm run build     # TypeScript compilation
npm test          # Run all tests
npm run lint      # Check linting
```

All three must pass before the task is complete.

#### 7. Commit Guidelines
- Use clear, descriptive commit messages
- Reference issue numbers if applicable
- Keep commits focused on a single change
- Include test updates in the same commit as implementation

### Special Considerations

#### Parser Changes
If modifying `parser.ts`:
- Ensure AST structure matches `types.ts` definitions
- Update all three parsers: parseNode, parsePartial, parseBlockHelper
- Consider precompiler impact (it generates code from AST)
- Update grammar file if adding new syntax

#### Renderer Changes
If modifying `renderer.ts`:
- Ensure proper context handling (immutability where needed)
- Handle undefined/null values gracefully
- Consider partial resolution order (inline → regular)
- Test with nested structures

#### Precompiler Changes
If modifying `precompiler.ts`:
- Generate valid JavaScript code
- Use unique variable names (helperCounter mechanism)
- Test generated code execution
- Consider watch mode and file observation

#### Grammar Changes
If modifying `vscode-extension/syntaxes/stampdown.tmLanguage.json`:
- Test with various syntax combinations
- Ensure pattern order is correct (more specific first)
- Validate JSON syntax
- Test with test files (test-*.sdt)
- Pattern specificity matters: `{{#*inline` before `{{#`

### Common Patterns

#### Adding a New Helper

1. Decide if it's a built-in or plugin helper
2. Implement helper function with proper signature
3. Add to registry (builtin.ts or plugin file)
4. Add JSDoc with @example
5. Write tests
6. Update documentation

#### Adding New Syntax

1. Update parser to recognize new syntax
2. Add AST node type to types.ts
3. Implement renderer logic
4. Implement precompiler code generation
5. Update VS Code grammar
6. Write comprehensive tests
7. Add to documentation with examples

#### Fixing a Bug

1. Write a failing test that reproduces the bug
2. Debug to find root cause
3. Fix the issue
4. Verify test now passes
5. Add edge case tests
6. Check for similar issues elsewhere

### Performance Considerations

- **Parser:** Keep parsing fast; avoid unnecessary regex
- **Renderer:** Minimize object allocations in hot paths
- **Precompiler:** Generate minimal, efficient code
- **Helpers:** Keep helper functions lightweight

### Security Considerations

- Never use `eval()` or `Function()` with user input directly
- Expression evaluator uses safe property access only
- Validate all user inputs
- Escape output appropriately (handled by renderer)

## Key Implementation Notes

### Expression Evaluation
- Safe property access only (no function execution)
- Supports literals: numbers, strings, booleans, null, undefined
- Dot notation for nested properties
- Returns `undefined` for missing properties

### Context Management
- Mutable context for variable assignments (direct mutation)
- Immutable context passing for block helpers (spread operator for scoped variables)
- Special variables prefixed with `@`
- `this` keyword for current scope (refers to context if not explicitly set)
- Context stacking in block helpers
- `each` and `with` helpers preserve original context for mutation support

### Partial Resolution Order
1. Check inline partials (block-scoped)
2. Fall back to regular partials
3. Return undefined if not found

### Variable Naming in Precompiler
- Use counter-based unique names: `partial_0`, `context_1`
- Prevents collisions in nested structures
- Reset counter for each template

### Grammar Pattern Priority
Order matters in TextMate grammars:
1. Most specific patterns first
2. Check opening delimiters thoroughly
3. Use backreferences for matching closing tags
4. Include all patterns in nested contexts

## Testing Philosophy

- **Unit Tests:** Test individual functions in isolation
- **Integration Tests:** Test complete template rendering
- **Edge Cases:** Test error conditions and boundaries
- **Regression Tests:** Add tests for all bug fixes

## Documentation Philosophy

- **Code is Documentation:** Well-named functions and variables
- **JSDoc for API:** Complete parameter and return documentation
- **README for Users:** User-facing features and examples
- **Docs for Depth:** Detailed guides for complex features
- **NO Summary Docs:** Use chat summaries instead of creating files
- **Keep Docs Updated:** Documentation should match code

## Questions or Issues?

- Check existing tests for usage examples
- Review similar implementations in the codebase
- Consult documentation in `docs/` directory
- Follow established patterns for consistency
- Ask in chat rather than creating summary documents

## Version

This document reflects the codebase state as of October 6, 2025.
All 181 tests passing across 4 packages:
- @stampdwn/core: 133 tests (advanced expressions, variable assignment, partials, precompiler, etc.)
- @stampdwn/cli: 19 tests (CLI functionality, precompilation, rendering)
- @stampdwn/llm: 29 tests (LLM plugin helpers, normalization, token management)
- @stampdwn/vscode: VS Code extension with comprehensive TextMate grammar

100% JSDoc coverage. TypeScript strict mode enabled. ESLint flat config (v9+).

**Recent Updates:**
- **Monorepo Migration**: Completed Phase 2 migration to npm workspaces with @stampdwn/* scoped packages
- **Package Structure**: Split into core, CLI, LLM, and VS Code extension packages
- **Documentation**: Comprehensive README files for each package with usage examples
- **Import Paths**: Updated all imports to use @stampdwn/* package naming
- **LLM Plugin**: Removed mdSection helper (simplified to direct markdown headings)
- **ESLint**: Upgraded to flat config with proper TypeScript integration
- **Test Coverage**: Maintained 100% test coverage across all packages during migration
