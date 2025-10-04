# Stampdown

A powerful Markdown templating language with Handlebars-like expressions, partials, block helpers, and hooks.

## Installation

```bash
npm install stampdown
```

## Quick Start

```typescript
import { Stampdown } from 'stampdown';

const stampdown = new Stampdown();
const result = stampdown.render('Hello {{name}}!', { name: 'World' });
```

## Features

### Expressions

Interpolate variables with dot notation for nested properties:

```typescript
stampdown.render('{{user.name}} ({{user.email}})', {
  user: { name: 'Alice', email: 'alice@example.com' }
});
```

### Block Helpers

**if/else**
```typescript
const template = '{{#if premium}}Premium{{else}}Free{{/if}}';
stampdown.render(template, { premium: true }); // "Premium"
```

**each**
```typescript
const template = '{{#each items}}- {{this}}\n{{/each}}';
stampdown.render(template, { items: ['A', 'B', 'C'] });
// Output:
// - A
// - B
// - C
```

Special variables in `each`: `{{this}}`, `{{@index}}`, `{{@first}}`, `{{@last}}`

**unless** - Inverse of `if`

**with** - Change context scope

**lookup** - Dynamic property access

### Partials

Reuse template snippets with powerful Handlebars-compatible features:

**Basic Partials**
```typescript
const stampdown = new Stampdown({
  partials: {
    header: '# {{title}}\n*By {{author}}*'
  }
});

stampdown.render('{{> header}}\n\nContent...', {
  title: 'My Post',
  author: 'Jane'
});
```

**Advanced Partial Features**

Stampdown supports all Handlebars partial features:

- **Dynamic Partials**: `{{> (expression) }}` - Select partial at runtime
- **Partial Contexts**: `{{> myPartial customContext}}` - Pass specific context
- **Hash Parameters**: `{{> button text="Save" variant=primary}}` - Pass parameters
- **Partial Blocks**: `{{#> layout}}content{{/layout}}` - Layouts with `@partial-block`
- **Inline Partials**: `{{#*inline "name"}}...{{/inline}}` - Define partials inline

```typescript
// Dynamic partial selection
stampdown.render('{{> (cardType) }}', { cardType: 'userCard' });

// Partial with context
stampdown.render('{{> userCard person}}', {
  person: { name: 'Alice' }
});

// Partial with parameters
stampdown.render('{{> button text="Click me" size=large}}', {});

// Layout with @partial-block
const stampdown = new Stampdown({
  partials: { layout: '<div>{{> @partial-block}}</div>' }
});
stampdown.render('{{#> layout}}Content{{/layout}}', {});
// Output: <div>Content</div>
```

See [Advanced Partials Guide](docs/ADVANCED-PARTIALS.md) for complete documentation.

Or register dynamically:
```typescript
stampdown.registerPartial('footer', '© {{year}} {{company}}');
```

### Custom Helpers

```typescript
const stampdown = new Stampdown({
  helpers: {
    uppercase: (_ctx, _opts, text) => String(text).toUpperCase()
  }
});

stampdown.render('{{#uppercase name}}{{/uppercase}}', { name: 'hello' }); // "HELLO"

// Or use self-closing syntax (shorter!)
stampdown.render('{{#uppercase name/}}', { name: 'hello' }); // "HELLO"
```

### Self-Closing Blocks

For simple helpers, use self-closing block syntax to reduce verbosity:

```typescript
// Regular syntax (with closing tag)
{{#uppercase name}}{{/uppercase}}

// Self-closing block syntax (30-40% fewer characters!)
{{#uppercase name/}}

// Works with any helper that returns a value
{{#capitalize title/}}
{{#add x y/}}
{{#multiply price quantity/}}
```

**The `{{#.../}}` syntax:**
- Uses `#` to indicate a helper call (like block helpers)
- Ends with `/}}` instead of a closing tag (self-closing)
- Perfect for helpers that transform values without needing content blocks

**Benefits:**
- **Concise**: 30-40% fewer characters than regular block syntax
- **Readable**: Cleaner, more intuitive templates
- **Flexible**: Works with built-in and custom helpers

**When to use:**
- ✓ String transformations: `{{#uppercase text/}}`
- ✓ Math operations: `{{#add a b/}}`
- ✓ Single-argument helpers: `{{#double value/}}`
- ✓ Helpers that return values directly
- ✗ Loops and conditionals: Use regular syntax for `if`, `each`, etc. (they need content blocks)

### Hooks

Transform templates before or after rendering:

```typescript
const stampdown = new Stampdown({
  hooks: {
    preProcess: [(input) => input.replace(/\[VERSION\]/g, '1.0.0')],
    postProcess: [(output) => output.trim()]
  }
});
```

### Plugin System

Extend Stampdown with reusable plugin packages:

```typescript
import { Stampdown, createPlugin } from 'stampdown';

// Create a plugin
const mathPlugin = createPlugin({
  name: 'math-helpers',
  version: '1.0.0',
  description: 'Mathematical helper functions',
  plugin: (stampdown) => {
    stampdown.registerHelper('add', (_ctx, _opts, a, b) => Number(a) + Number(b));
    stampdown.registerHelper('multiply', (_ctx, _opts, a, b) => Number(a) * Number(b));
  }
});

// Use the plugin
const stampdown = new Stampdown({
  plugins: [mathPlugin]
});

stampdown.render('{{#add 5 3}}{{/add}}', {}); // "8"
```

**Plugins with Options:**

```typescript
const configPlugin = createPlugin({
  name: 'config-plugin',
  plugin: (stampdown, options) => {
    const prefix = options?.prefix || 'Default';
    stampdown.registerHelper('prefixed', (_ctx, _opts, text) => {
      return `${prefix}: ${String(text)}`;
    });
  }
});

const stampdown = new Stampdown({
  plugins: [
    { plugin: configPlugin, options: { prefix: 'Custom' } }
  ]
});
```

**Built-in Plugin Packs:**

Stampdown provides ready-to-use plugin packs for common operations:
- **stringHelpersPlugin** - uppercase, lowercase, capitalize, trim, repeat, truncate
- **mathHelpersPlugin** - add, subtract, multiply, divide, mod, round, min, max
- **dateHelpersPlugin** - formatDate, now, timeAgo
- **arrayHelpersPlugin** - join, length, slice, reverse, sort
- **debugPlugin** - json, typeof, keys, values

Import plugins individually:

```typescript
import { Stampdown } from 'stampdown';
import { stringHelpersPlugin } from 'stampdown/plugins/string-helpers';
import { mathHelpersPlugin } from 'stampdown/plugins/math-helpers';

const stampdown = new Stampdown({
  plugins: [stringHelpersPlugin, mathHelpersPlugin]
});

stampdown.render('{{#uppercase name}}{{/uppercase}}', { name: 'hello' }); // "HELLO"
stampdown.render('{{#multiply 6 7}}{{/multiply}}', {}); // "42"
```

Or import all at once:

```typescript
import { Stampdown } from 'stampdown';
import { stringHelpersPlugin, mathHelpersPlugin } from 'stampdown/plugins';

// ... use as above
```

## Precompiler

For production applications, precompile your templates to optimized JavaScript functions for faster rendering and reduced bundle sizes.

### Basic Precompilation

```typescript
import { Stampdown, Precompiler } from 'stampdown';

const precompiler = new Precompiler();
const stampdown = new Stampdown();

// Precompile a template
const template = 'Hello {{name}}!';
const compiled = precompiler.precompile(template, {
  templateId: 'greeting'
});

// Create executable function from generated code
const templateFn = new Function('context', 'stampdown', compiled.code);

// Register the precompiled template
stampdown.registerPrecompiledTemplate('greeting', templateFn);

// Render using the precompiled template
const result = stampdown.renderPrecompiled('greeting', { name: 'World' });
console.log(result); // "Hello World!"
```

### Known Helpers (Tree-Shaking)

Reduce bundle size by specifying which helpers your templates use:

```typescript
const compiled = precompiler.precompile(template, {
  templateId: 'user-profile',
  knownHelpers: ['uppercase', 'formatDate'], // Only include these helpers
  strict: true // Throw error if unknown helpers are used
});

// Or include all helpers
const compiled2 = precompiler.precompile(template, {
  knownHelpers: 'all' // Include all registered helpers
});
```

**Strict vs Non-Strict Mode:**

- **Strict mode** (`strict: true`): Throws error if template uses helpers not in `knownHelpers`
- **Non-strict mode** (default): Logs warning but continues compilation

### Template Registry

Precompiled templates are stored in a readonly registry:

```typescript
// Check if template exists
if (stampdown.hasPrecompiledTemplate('greeting')) {
  const result = stampdown.renderPrecompiled('greeting', context);
}

// Get all registered template IDs
const templateIds = stampdown.getPrecompiledTemplateIds();
console.log(templateIds); // ['greeting', 'user-profile', ...]
```

### Build-Time Precompilation

For optimal performance, precompile templates during your build process:

**precompile-templates.js**
```typescript
import { Precompiler } from 'stampdown';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const precompiler = new Precompiler();

// Find all template files
const templates = glob.sync('src/templates/**/*.sdt');

const output = ['// Auto-generated precompiled templates'];
output.push('export const precompiledTemplates = {');

templates.forEach(file => {
  const source = readFileSync(file, 'utf-8');
  const templateId = file.replace(/^src\/templates\//, '').replace(/\.sdt$/, '');

  const compiled = precompiler.precompile(source, {
    templateId,
    knownHelpers: ['uppercase', 'lowercase', 'formatDate', 'if', 'each']
  });

  output.push(`  '${templateId}': function(context, stampdown) {`);
  output.push(compiled.code.split('\n').map(line => '    ' + line).join('\n'));
  output.push('  },');
});

output.push('};');

writeFileSync('src/templates.generated.js', output.join('\n'));
```

**Usage in your app:**
```typescript
import { Stampdown } from 'stampdown';
import { precompiledTemplates } from './templates.generated';

const stampdown = new Stampdown();

// Register all precompiled templates
Object.entries(precompiledTemplates).forEach(([id, fn]) => {
  stampdown.registerPrecompiledTemplate(id, fn);
});

// Render instantly without parsing
const html = stampdown.renderPrecompiled('user/profile', userData);
```

### Performance Benefits

Precompiled templates provide significant performance improvements:

- **Faster rendering**: No parsing or AST traversal at runtime
- **Smaller bundles**: Tree-shake unused helpers with `knownHelpers`
- **Type safety**: Generated code is plain JavaScript
- **Caching**: Templates are compiled once, rendered many times

**Benchmark example:**
```typescript
// Regular rendering: ~1000 renders/sec
stampdown.render(template, context);

// Precompiled rendering: ~10,000 renders/sec
stampdown.renderPrecompiled('templateId', context);
```

### CLI Tool

Stampdown includes a command-line tool for precompiling templates in build scripts:

```bash
# Install globally
npm install -g stampdown

# Or use npx
npx stampdown-precompile [options]
```

**Basic Usage:**

```bash
# Precompile all .sdt files in a directory
stampdown-precompile -i "templates/**/*.sdt" -o dist/templates

# Specify known helpers for tree-shaking
stampdown-precompile -i "src/**/*.sdt" -k "uppercase,lowercase,if,each"

# Generate CommonJS modules
stampdown-precompile -i "templates/*.sdt" -f cjs -o build

# Strict mode with verbose output
stampdown-precompile -i "src/**/*.sdt" -s -v

# Watch mode for development
stampdown-precompile -i "templates/**/*.sdt" -w
```

**CLI Options:**

| Option | Description |
|--------|-------------|
| `-i, --input <glob>` | Input file or glob pattern (e.g., "src/**/*.sdt") |
| `-o, --output <dir>` | Output directory (default: "./precompiled") |
| `-k, --known-helpers <list>` | Comma-separated list of known helpers (or "all") |
| `-s, --strict` | Strict mode - error on unknown helpers |
| `-f, --format <format>` | Output format: esm, cjs, or json (default: esm) |
| `-w, --watch` | Watch mode - recompile on file changes |
| `-m, --source-map` | Generate source maps |
| `-v, --verbose` | Verbose output |
| `-h, --help` | Show help message |

**Integration with Build Tools:**

Add to your `package.json`:

```json
{
  "scripts": {
    "precompile": "stampdown-precompile -i 'src/templates/**/*.sdt' -o dist/templates -k 'all'",
    "build": "npm run precompile && your-build-command",
    "dev": "stampdown-precompile -i 'src/templates/**/*.sdt' -w & your-dev-server"
  }
}
```

**Using Precompiled Templates:**

```typescript
// ESM format (default)
import { Stampdown } from 'stampdown';
import { templates } from './dist/templates.mjs';

const stampdown = new Stampdown();

// Register all templates
Object.entries(templates).forEach(([id, fn]) => {
  stampdown.registerPrecompiledTemplate(id, fn);
});

// Render
const output = stampdown.renderPrecompiled('welcome', { name: 'Alice' });
```

```typescript
// CJS format
const { Stampdown } = require('stampdown');
const { templates } = require('./dist/templates.cjs');

const stampdown = new Stampdown();

Object.entries(templates).forEach(([id, fn]) => {
  stampdown.registerPrecompiledTemplate(id, fn);
});

const output = stampdown.renderPrecompiled('welcome', { name: 'Bob' });
```

**See [CLI Reference](docs/CLI.md) for complete CLI documentation.**

### Source Maps

Enable source map generation for debugging:

```typescript
const compiled = precompiler.precompile(template, {
  templateId: 'debug-template',
  sourceMap: true // Generate source map
});

console.log(compiled.sourceMap); // Basic source map for debugging
```

### Precompiled Template Structure

The `precompile()` method returns:

```typescript
interface PrecompiledTemplate {
  code: string;           // Generated JavaScript code
  usedHelpers: string[];  // List of helpers used in template
  source: string;         // Original template source
  templateId?: string;    // Template identifier
  sourceMap?: string;     // Source map if enabled
}
```

## Template Files (.sdt)

Use dedicated template files with syntax highlighting:

**template.sdt**
```stampdown
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

// Async
const template = await loader.load('./template.sdt');
const output = template.render({ title: 'Hello', items: ['A', 'B'] });

// Sync (Node.js)
const template2 = loader.loadSync('./template.sdt');

// Compile from string
const template3 = loader.compile('Hello {{name}}!');
```

**Caching:**
```typescript
// Templates are cached by default
loader.clearCache('./template.sdt'); // Clear specific
loader.clearCache(); // Clear all
```

### VS Code Extension

Install syntax highlighting for `.sdt` files:

```bash
# Run installer
./install-extension.sh

# Or manually copy
cp -r vscode-extension ~/.vscode/extensions/stampdown-0.1.0/
```

Features:
- Syntax highlighting for expressions, helpers, partials, comments
- Auto-closing pairs
- Code folding for block helpers
- Markdown support within templates

## API Reference

### Stampdown

```typescript
new Stampdown(options?: StampdownOptions)
```

**Methods:**
- `render(template: string, context?: Context): string`
- `registerPartial(name: string, content: string): void`
- `registerHelper(name: string, helper: Helper): void`
- `addPreProcessHook(hook: Hook): void`
- `addPostProcessHook(hook: Hook): void`
- `renderPrecompiled(templateId: string, context?: Context): string`
- `registerPrecompiledTemplate(templateId: string, templateFn: PrecompiledTemplateFn): void`
- `hasPrecompiledTemplate(templateId: string): boolean`
- `getPrecompiledTemplateIds(): string[]`

### Precompiler

```typescript
new Precompiler()
```

**Methods:**
- `precompile(template: string, options?: PrecompileOptions): PrecompiledTemplate`

**Options:**
```typescript
interface PrecompileOptions {
  templateId?: string;           // Identifier for the template
  knownHelpers?: string[] | 'all'; // Helpers to include (for tree-shaking)
  strict?: boolean;              // Throw error on unknown helpers
  sourceMap?: boolean;           // Generate source map
}
```

**Returns:**
```typescript
interface PrecompiledTemplate {
  code: string;           // Generated JavaScript function body
  usedHelpers: string[];  // Helpers referenced in template
  source: string;         // Original template source
  templateId?: string;    // Template identifier if provided
  sourceMap?: string;     // Source map if enabled
}
```

### TemplateLoader

```typescript
new TemplateLoader(options?: StampdownOptions)
```

**Methods:**
- `async load(filePath: string, useCache?: boolean): Promise<CompiledTemplate>`
- `loadSync(filePath: string, useCache?: boolean): CompiledTemplate`
- `compile(source: string): CompiledTemplate`
- `clearCache(filePath?: string): void`

### CompiledTemplate

- `render(context?: Context): string`
- `source: string` - Original template source

## Documentation

- **[Advanced Partials Guide](docs/ADVANCED-PARTIALS.md)** - Complete guide to Handlebars-compatible partial features
- **[CLI Reference](docs/CLI.md)** - Command-line tool for precompiling templates
- **[Precompiler Guide](docs/PRECOMPILER.md)** - In-depth precompiler features and optimization
- **[Self-Closing Blocks](docs/SELF-CLOSING.md)** - Concise syntax for simple helpers
- **[Workflow Example](docs/WORKFLOW.md)** - Step-by-step integration guide
- **[Plugin System](src/plugins/README.md)** - Built-in plugins and custom plugin development

## Development

```bash
npm install        # Install dependencies
npm run build      # Build TypeScript
npm test           # Run tests
npm run lint       # Lint code
npm run format     # Format code
```

## License

MIT
