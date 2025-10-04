# Stampdown: Engineering Introduction

**A powerful Markdown templating language with Handlebars-like expressions, partials, block helpers, and hooks.**

---

## Table of Contents

1. [What is Stampdown?](#what-is-stampdown)
2. [Why Stampdown?](#why-stampdown)
3. [Core Concepts](#core-concepts)
4. [Getting Started](#getting-started)
5. [Template Syntax](#template-syntax)
6. [Extending Stampdown](#extending-stampdown)
7. [Built-in Plugins](#built-in-plugins)
8. [Architecture Overview](#architecture-overview)
9. [Performance & Production](#performance--production)
10. [Developer Experience](#developer-experience)
11. [Best Practices](#best-practices)
12. [Resources](#resources)

---

## What is Stampdown?

Stampdown is a **template engine** that combines the simplicity of Markdown with the power of Handlebars-style template expressions. It enables dynamic content generation through a clean, readable syntax that developers already know.

**Key Use Cases:**
- Dynamic documentation generation
- Email template rendering
- Configuration file templating
- LLM prompt engineering and conversation formatting
- Static site generation
- Report generation

**Key Capabilities:**
- ✅ Handlebars-compatible syntax (familiar to most developers)
- ✅ Advanced partials (dynamic, contexts, hash parameters, layouts)
- ✅ Self-closing block syntax for concise templates
- ✅ Extensible plugin system
- ✅ Template precompilation for production performance
- ✅ CLI tool for build workflows
- ✅ VS Code extension with syntax highlighting

---

## Why Stampdown?

### The Problem

Traditional approaches to dynamic content generation have trade-offs:

- **String concatenation**: Hard to read, maintain, and debug
- **Template literals**: Limited logic, no reusability
- **Heavy frameworks**: Overkill for simple templating needs
- **Generic template engines**: Not optimized for Markdown content

### The Solution

Stampdown provides:

1. **Familiar Syntax**: If you know Handlebars, you already know Stampdown
2. **Markdown-First**: Designed specifically for Markdown content
3. **Powerful Features**: Advanced partials, helpers, hooks, and plugins
4. **Production-Ready**: Precompilation for optimal runtime performance
5. **Developer-Friendly**: Syntax highlighting, type safety, comprehensive docs

### When to Use Stampdown

**✅ Great for:**
- Generating dynamic Markdown content
- Building reusable template systems
- Creating configurable content pipelines
- LLM prompt templating and conversation formatting
- Documentation that needs data injection
- Email templates with complex logic

**⚠️ Not ideal for:**
- Full web application frameworks (use React, Vue, etc.)
- Pure static content (no templating needed)
- Binary or non-text formats

---

## Core Concepts

### 1. Expressions

Interpolate variables with dot notation for nested properties:

```handlebars
{{name}}
{{user.email}}
{{product.price}}
```

**Features:**
- Dot notation for nested objects
- Safe property access (returns empty string for undefined)
- Special variables: `@index`, `@first`, `@last`, `@key`, `@root`
- `this` keyword for current context

### 2. Block Helpers

Control structures for conditional rendering and iteration:

```handlebars
{{#if premium}}
  Premium content here
{{else}}
  Free content here
{{/if}}

{{#each items}}
  - {{this}} (index: {{@index}})
{{/each}}

{{#with user}}
  Name: {{name}}
  Email: {{email}}
{{/with}}
```

**Built-in block helpers:**
- `if` / `else` - Conditional rendering
- `unless` - Inverse conditional
- `each` - Array iteration with special variables
- `with` - Context switching
- `lookup` - Dynamic property access
- `log` - Debug logging

### 3. Self-Closing Blocks

Concise syntax for helpers that return values directly:

```handlebars
{{! Regular syntax }}
{{#uppercase name}}{{/uppercase}}

{{! Self-closing syntax (30-40% fewer characters!) }}
{{#uppercase name/}}
```

**The `{{#.../}}` syntax:**
- Perfect for transformations: `{{#uppercase text/}}`
- Math operations: `{{#add x y/}}`
- Any helper that returns a value directly
- Cannot be used with block helpers that need content blocks

### 4. Partials

Reusable template snippets with advanced features:

```handlebars
{{! Basic partial }}
{{> header}}

{{! Dynamic partial }}
{{> (partialName) }}

{{! Partial with context }}
{{> userCard user}}

{{! Partial with parameters }}
{{> button text="Save" variant=primary}}

{{! Layout with blocks }}
{{#> layout}}
  Content here
  {{> @partial-block}}
{{/layout}}

{{! Inline partials }}
{{#*inline "greeting"}}
  Hello, {{name}}!
{{/inline}}
{{> greeting}}
```

### 5. Hooks

Transform templates before or after rendering:

```typescript
const stampdown = new Stampdown({
  hooks: {
    preProcess: [(input) => input.replace(/\[VERSION\]/g, '1.0.0')],
    postProcess: [(output) => output.trim()]
  }
});
```

---

## Getting Started

### Installation

```bash
npm install stampdown
```

### Basic Usage

```typescript
import { Stampdown } from 'stampdown';

const stampdown = new Stampdown();

const template = 'Hello {{name}}!';
const context = { name: 'World' };
const result = stampdown.render(template, context);

console.log(result); // "Hello World!"
```

### With Partials

```typescript
const stampdown = new Stampdown({
  partials: {
    header: '# {{title}}\n*By {{author}}*',
    footer: '© {{year}} {{company}}'
  }
});

const template = `
{{> header}}

{{content}}

{{> footer}}
`;

const result = stampdown.render(template, {
  title: 'My Document',
  author: 'Jane Doe',
  content: 'Document body...',
  year: 2025,
  company: 'Acme Inc'
});
```

### With Custom Helpers

```typescript
const stampdown = new Stampdown({
  helpers: {
    uppercase: (_ctx, _opts, text) => String(text).toUpperCase(),
    add: (_ctx, _opts, a, b) => String(Number(a) + Number(b))
  }
});

stampdown.render('{{#uppercase name/}}', { name: 'hello' }); // "HELLO"
stampdown.render('{{#add 5 3/}}', {}); // "8"
```

---

## Template Syntax

### Variable Interpolation

```handlebars
{{name}}                    {{! Simple variable }}
{{user.name}}              {{! Nested property }}
{{items.0.title}}          {{! Array index }}
{{this}}                   {{! Current context }}
```

### Conditionals

```handlebars
{{#if condition}}
  Shown when true
{{else}}
  Shown when false
{{/if}}

{{#unless disabled}}
  Shown when NOT disabled
{{/unless}}
```

### Iteration

```handlebars
{{#each items}}
  - {{this}}
  - Index: {{@index}}
  - First: {{@first}}
  - Last: {{@last}}
{{/each}}
```

### Comments

```handlebars
{{! Single-line comment }}

{{!--
  Multi-line
  block comment
--}}
```

---

## Extending Stampdown

### Custom Helpers

Create reusable functions for template logic:

```typescript
stampdown.registerHelper('formatCurrency', (_ctx, _opts, amount) => {
  const num = Number(amount);
  return `$${num.toFixed(2)}`;
});

// Usage: {{#formatCurrency price/}}
```

**Helper signature:**
```typescript
type Helper = (
  context: Context,           // Current context object
  options: HelperOptions,     // Helper options (hash, inverse, fn)
  ...args: unknown[]          // Arguments passed to helper
) => string;
```

### Plugin System

Create reusable plugin packages:

```typescript
import { createPlugin } from 'stampdown';

const mathPlugin = createPlugin({
  name: 'math-helpers',
  version: '1.0.0',
  description: 'Mathematical helper functions',
  plugin: (stampdown) => {
    stampdown.registerHelper('add', (_ctx, _opts, a, b) =>
      String(Number(a) + Number(b))
    );
    stampdown.registerHelper('multiply', (_ctx, _opts, a, b) =>
      String(Number(a) * Number(b))
    );
  }
});

// Use the plugin
const stampdown = new Stampdown({
  plugins: [mathPlugin]
});
```

**Plugin with options:**

```typescript
const configPlugin = createPlugin({
  name: 'config-plugin',
  plugin: (stampdown, options) => {
    const prefix = options?.prefix || 'Default';
    stampdown.registerHelper('prefixed', (_ctx, _opts, text) => {
      return `${prefix}: ${text}`;
    });
  }
});

const stampdown = new Stampdown({
  plugins: [
    { plugin: configPlugin, options: { prefix: 'Custom' } }
  ]
});
```

---

## Built-in Plugins

Stampdown includes six production-ready plugins:

### 1. String Helpers Plugin

```typescript
import { stringHelpersPlugin } from 'stampdown/plugins';
```

**Helpers:**
- `uppercase` - Convert to uppercase
- `lowercase` - Convert to lowercase
- `capitalize` - Capitalize first letter
- `trim` - Remove whitespace
- `repeat` - Repeat text N times
- `truncate` - Truncate to max length

**Example:**
```handlebars
{{#uppercase name/}}
    {{#capitalize title/}}
{{#truncate description 50/}}
```

### 2. Math Helpers Plugin

```typescript
import { mathHelpersPlugin } from 'stampdown/plugins';
```

**Helpers:**
- `add`, `subtract`, `multiply`, `divide`
- `mod` - Modulo operation
- `round` - Round to decimal places
- `min`, `max` - Find min/max values

**Example:**
```handlebars
{{#add price tax/}}
{{#multiply quantity price/}}
{{#round value 2/}}
```

### 3. Date Helpers Plugin

```typescript
import { dateHelpersPlugin } from 'stampdown/plugins';
```

**Helpers:**
- `formatDate` - Format dates (YYYY-MM-DD, etc.)
- `now` - Current timestamp (ISO format)
- `timeAgo` - Human-readable relative time

**Example:**
```handlebars
{{#formatDate date "YYYY-MM-DD"/}}
{{#timeAgo createdAt/}}
```

### 4. Array Helpers Plugin

```typescript
import { arrayHelpersPlugin } from 'stampdown/plugins';
```

**Helpers:**
- `join` - Join array with separator
- `length` - Get length of array/string/object
- `slice` - Extract portion of array
- `reverse` - Reverse array order
- `sort` - Sort array

**Example:**
```handlebars
{{#join tags ", "/}}
{{#length items/}}
```

### 5. Debug Plugin

```typescript
import { debugPlugin } from 'stampdown/plugins';
```

**Helpers:**
- `json` - Stringify as JSON
- `typeof` - Get type of value
- `keys` - Get object keys
- `values` - Get object values

**Example:**
```handlebars
{{#json user/}}
{{#typeof value/}}
```

### 6. LLM Plugin

**The most powerful plugin for AI/LLM applications.**

```typescript
import { llmPlugin } from 'stampdown/plugins/llm';
```

**Purpose:** Specialized helpers for prompt engineering and LLM conversation templating.

**Features:**
- Multi-provider support (OpenAI, Anthropic, Azure, Vertex AI)
- Role-aware helpers (user, assistant, system, tool)
- Content extraction and manipulation
- Token counting and truncation
- Message windowing for context management
- Format conversion (JSON, YAML, provider-specific)

**Key Helpers:**

*Context & Iteration:*
- `withChat` - Normalize provider payloads
- `eachMessage` - Iterate over all messages
- `eachByRole` - Filter by role

*Role Gates:*
- `ifUser`, `ifAssistant`, `ifSystem`, `ifTool` - Conditional by role

*Content Extraction:*
- `eachText`, `joinText`, `firstText`, `lastText` - Text content helpers
- `eachContent` - All content types

*Token Management:*
- `tokenCount` - Count tokens
- `truncateTokens` - Truncate by token limit
- `window` - Message range selection

*Formatting:*
- `renderChat` - Convert to provider format
- `json`, `yaml` - Structured output
- `mdSection`, `codeFence` - Markdown formatting

**Example:**
```handlebars
{{#withChat raw=chat}}
  {{#window size=5 from="end"}}
    {{#eachMessage}}
      {{#ifUser}}
        **User Query {{@index}}:**
        {{#firstText this/}}
      {{/ifUser}}
      {{#ifAssistant}}
        **Assistant Response:**
        {{#joinText content sep=" "/}}
      {{/ifAssistant}}
    {{/eachMessage}}
  {{/window}}

  Token count: {{#tokenCount (renderChat this format="json")/}}
{{/withChat}}
```

**Use cases:**
- Building dynamic prompts for LLMs
- Formatting conversation history
- Implementing context windowing
- Converting between provider formats
- Debugging LLM payloads

**Dependencies:**
```bash
npm install @ai-sdk/provider yaml gpt-tokenizer zod
```

See [LLM Plugin README](src/plugins/llm/README.md) for complete documentation.

### Loading Multiple Plugins

```typescript
import {
  Stampdown,
  stringHelpersPlugin,
  mathHelpersPlugin,
  dateHelpersPlugin,
  arrayHelpersPlugin,
  debugPlugin,
  llmPlugin
} from 'stampdown';

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

---

## Architecture Overview

### Processing Pipeline

```
Template String
    ↓
Parser (parser.ts)
    ↓
Abstract Syntax Tree (AST)
    ↓
Renderer (renderer.ts)
    ↓
    ├─→ Helper Registry (helpers/registry.ts)
    ├─→ Partial Registry
    └─→ Expression Evaluator (evaluator.ts)
    ↓
Output String
```

### Key Components

**1. Parser (`src/parser.ts`)**
- Converts template strings to AST
- Handles expressions, block helpers, partials, comments
- Supports self-closing syntax

**2. Evaluator (`src/evaluator.ts`)**
- Safe expression evaluation
- Dot notation for nested properties
- Literal values (numbers, strings, booleans)
- Special variables (@index, @first, etc.)

**3. Renderer (`src/renderer.ts`)**
- Traverses AST and generates output
- Manages context stacking
- Executes helpers and partials
- Handles inverse blocks (else)

**4. Helper Registry (`src/helpers/registry.ts`)**
- Stores and retrieves helpers
- Validates helper existence
- Manages built-in and custom helpers

**5. Precompiler (`src/precompiler.ts`)**
- Converts AST to optimized JavaScript
- Enables tree-shaking with `knownHelpers`
- Generates executable functions

**6. Loader (`src/loader.ts`)**
- Loads `.sdt` template files
- Caching mechanism
- Sync and async loading

**7. Plugin System (`src/plugin.ts`)**
- Plugin registration and management
- Option passing to plugins
- Type-safe plugin creation

### File Structure

```
src/
├── stampdown.ts        # Main API entry point
├── parser.ts           # Template → AST
├── renderer.ts         # AST → String
├── evaluator.ts        # Expression evaluation
├── precompiler.ts      # AST → JavaScript
├── loader.ts           # File loading & caching
├── cli.ts              # CLI tool
├── plugin.ts           # Plugin system
├── types.ts            # TypeScript types
├── index.ts            # Public API exports
├── helpers/
│   ├── registry.ts     # Helper management
│   └── builtin.ts      # Built-in helpers (if, each, etc.)
└── plugins/
    ├── string-helpers.ts
    ├── math-helpers.ts
    ├── date-helpers.ts
    ├── array-helpers.ts
    ├── debug.ts
    └── llm/            # LLM plugin
        ├── index.ts
        ├── helpers.ts
        ├── types.ts
        ├── tokenizer.ts
        └── adapters/
            └── ai-sdk.ts
```

---

## Performance & Production

### Template Precompilation

For production, precompile templates to optimized JavaScript functions:

**Benefits:**
- **10x faster rendering** (no parsing at runtime)
- **Smaller bundles** with tree-shaking
- **Type safety** with generated code
- **Caching** compiled once, rendered many times

### Basic Precompilation

```typescript
import { Stampdown, Precompiler } from 'stampdown';

const precompiler = new Precompiler();
const stampdown = new Stampdown();

// Precompile template
const compiled = precompiler.precompile('Hello {{name}}!', {
  templateId: 'greeting',
  knownHelpers: ['uppercase', 'if', 'each'] // Tree-shake unused helpers
});

// Create executable function
const templateFn = new Function('context', 'stampdown', compiled.code);

// Register and use
stampdown.registerPrecompiledTemplate('greeting', templateFn);
const result = stampdown.renderPrecompiled('greeting', { name: 'World' });
```

### CLI Tool

Precompile templates in your build pipeline:

```bash
npm install -g stampdown

# Precompile all .sdt files
stampdown-precompile -i "templates/**/*.sdt" -o dist/templates

# With tree-shaking
stampdown-precompile -i "src/**/*.sdt" -k "uppercase,if,each" -o dist

# Watch mode for development
stampdown-precompile -i "templates/**/*.sdt" -w
```

**CLI Options:**
- `-i, --input <glob>` - Input file pattern
- `-o, --output <dir>` - Output directory
- `-k, --known-helpers <list>` - Helpers to include (tree-shaking)
- `-s, --strict` - Error on unknown helpers
- `-f, --format <format>` - Output format (esm, cjs, json)
- `-w, --watch` - Watch mode
- `-m, --source-map` - Generate source maps

### Integration Example

**package.json:**
```json
{
  "scripts": {
    "precompile": "stampdown-precompile -i 'src/templates/**/*.sdt' -o dist/templates -k 'all'",
    "build": "npm run precompile && tsc",
    "dev": "stampdown-precompile -i 'src/templates/**/*.sdt' -w & nodemon"
  }
}
```

**Usage:**
```typescript
import { Stampdown } from 'stampdown';
import { templates } from './dist/templates.mjs';

const stampdown = new Stampdown();

// Register all precompiled templates
Object.entries(templates).forEach(([id, fn]) => {
  stampdown.registerPrecompiledTemplate(id, fn);
});

// Render instantly
const html = stampdown.renderPrecompiled('user-profile', userData);
```

---

## Developer Experience

### VS Code Extension

**Installation:**
```bash
./install-extension.sh
```

**Features:**
- Syntax highlighting for `.sdt` files
- Auto-closing pairs for expressions and helpers
- Code folding for block helpers
- Markdown support within templates

**Token Scopes:**
- `entity.name.function.helper.stampdown` - Helper names
- `variable.other.property.stampdown` - Properties
- `keyword.control.stampdown` - Control keywords (if, each)
- `variable.language.special.stampdown` - Special variables (@index, this)

### Template Files (.sdt)

Create dedicated template files with syntax highlighting:

**template.sdt:**
```handlebars
# {{title}}

{{#if description}}
{{description}}
{{/if}}

{{#each items}}
- {{this}}
{{/each}}
```

**Load and render:**
```typescript
import { TemplateLoader } from 'stampdown';

const loader = new TemplateLoader();

// Async loading
const template = await loader.load('./template.sdt');
const output = template.render({ title: 'Hello', items: ['A', 'B'] });

// Sync loading (Node.js)
const template2 = loader.loadSync('./template.sdt');

// Templates are cached automatically
loader.clearCache('./template.sdt'); // Clear specific
loader.clearCache(); // Clear all
```

---

## Best Practices

### 1. Organize Templates

```
templates/
├── layouts/
│   ├── base.sdt
│   └── article.sdt
├── partials/
│   ├── header.sdt
│   ├── footer.sdt
│   └── nav.sdt
└── pages/
    ├── home.sdt
    └── about.sdt
```

### 2. Use Partials for Reusability

```handlebars
{{! Instead of duplicating }}
<header>{{title}}</header>

{{! Use partials }}
{{> header}}
```

### 3. Leverage Self-Closing Syntax

```handlebars
{{! Verbose }}
{{#uppercase name}}{{/uppercase}}

{{! Concise }}
{{#uppercase name/}}
```

### 4. Use Plugins for Common Operations

```typescript
// Don't reinvent the wheel
const stampdown = new Stampdown({
  plugins: [stringHelpersPlugin, mathHelpersPlugin, dateHelpersPlugin]
});
```

### 5. Precompile for Production

```typescript
// Development: Parse at runtime
stampdown.render(template, context);

// Production: Use precompiled templates
stampdown.renderPrecompiled('templateId', context);
```

### 6. Add Type Safety

```typescript
interface UserContext {
  name: string;
  email: string;
  premium: boolean;
}

const template = stampdown.compile<UserContext>('Hello {{name}}!');
```

### 7. Use Hooks for Global Transformations

```typescript
const stampdown = new Stampdown({
  hooks: {
    preProcess: [
      (input) => input.replace(/\[VERSION\]/g, packageJson.version),
      (input) => input.replace(/\[YEAR\]/g, new Date().getFullYear().toString())
    ],
    postProcess: [
      (output) => output.trim(),
      (output) => output.replace(/\n{3,}/g, '\n\n') // Collapse extra newlines
    ]
  }
});
```

---

## Resources

### Documentation

- **[Main README](README.md)** - Complete API reference
- **[Plugins README](src/plugins/README.md)** - Plugin documentation
- **[LLM Plugin README](src/plugins/llm/README.md)** - LLM plugin guide
- **[VS Code Extension README](vscode-extension/README.md)** - Extension features

### Package Information

- **NPM Package:** `stampdown`
- **License:** MIT
- **TypeScript:** Full type definitions included
- **Test Coverage:** 103 tests across 6 test suites

### Development

```bash
npm install        # Install dependencies
npm run build      # Build TypeScript
npm test           # Run tests (103 tests)
npm run lint       # Lint code
npm run format     # Format code with Prettier
```

### API Quick Reference

**Stampdown Class:**
- `render(template, context)` - Render a template
- `registerPartial(name, content)` - Register partial
- `registerHelper(name, helper)` - Register helper
- `addPreProcessHook(hook)` - Add pre-processing hook
- `addPostProcessHook(hook)` - Add post-processing hook
- `renderPrecompiled(id, context)` - Render precompiled template
- `registerPrecompiledTemplate(id, fn)` - Register precompiled template

**Precompiler Class:**
- `precompile(template, options)` - Precompile to JavaScript

**TemplateLoader Class:**
- `load(filePath, useCache?)` - Load template async
- `loadSync(filePath, useCache?)` - Load template sync
- `compile(source)` - Compile from string
- `clearCache(filePath?)` - Clear cache

---

## Getting Help

### Common Questions

**Q: Should I use Stampdown or React/Vue?**
A: Stampdown is for **content templating**, not UI frameworks. Use Stampdown for generating Markdown, documentation, emails, prompts. Use React/Vue for interactive web applications.

**Q: Is Stampdown compatible with Handlebars?**
A: Yes! Stampdown uses Handlebars-compatible syntax and supports advanced features like dynamic partials, partial blocks, and inline partials.

**Q: Can I use Stampdown in the browser?**
A: Yes! Stampdown is framework-agnostic and works in Node.js and browsers. Use the precompiler for optimal browser bundle sizes.

**Q: How do I migrate from Handlebars?**
A: Most Handlebars templates work as-is in Stampdown. You may need to adjust helper signatures slightly (context and options parameters).

**Q: What about security?**
A: Stampdown uses safe expression evaluation only (no `eval()` or `Function()` with user input). All output is treated as plain text unless explicitly rendered as HTML.

---

## Next Steps

1. **Install Stampdown:** `npm install stampdown`
2. **Try the examples** in this document
3. **Explore the plugins** that fit your use case
4. **Set up VS Code extension** for syntax highlighting
5. **Read the main README** for complete API documentation
6. **Check out the LLM plugin** if working with AI/LLM applications

---

**Questions?** Check the [main README](README.md) or explore the [plugin documentation](src/plugins/README.md).

**Happy templating! 🚀**
