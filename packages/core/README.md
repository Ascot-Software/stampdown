# Stampdown

Stampdown is a Markdown templating language, that is simple and extensible.

## Installation

```bash
npm install @stampdwn/core
```

## Usage

### Basic Templating

```typescript
import { Stampdown } from '@stampdwn/core';

const stampdown = new Stampdown();

// Simple variable interpolation
const result = stampdown.render('Hello {{name}}!', { name: 'World' });
console.log(result); // "Hello World!"

// Nested properties
const user = { name: 'Alice', profile: { email: 'alice@example.com' } };
stampdown.render('{{name}} - {{profile.email}}', user);
// "Alice - alice@example.com"
```

### Built-in Helpers

The core package includes essential block helpers:

```typescript
// Conditionals
stampdown.render('{{#if premium}}Premium{{else}}Free{{/if}}', { premium: true });

// Array iteration
const items = ['Apple', 'Banana', 'Cherry'];
stampdown.render('{{#each items}}- {{this}}\n{{/each}}', { items });

// Context switching
const user = { name: 'Alice', age: 30 };
stampdown.render('{{#with user}}{{name}} is {{age}}{{/with}}', { user });
```

### Standard Plugins

Load built-in plugins for extended functionality:

```typescript
import { Stampdown } from '@stampdwn/core';
import {
  stringHelpersPlugin,
  mathHelpersPlugin,
  dateHelpersPlugin,
  arrayHelpersPlugin,
  debugPlugin
} from '@stampdwn/core/plugins';

const stampdown = new Stampdown({
  plugins: [
    stringHelpersPlugin,
    mathHelpersPlugin,
    dateHelpersPlugin,
    arrayHelpersPlugin,
    debugPlugin
  ]
});

// Use plugin helpers
stampdown.render('{{#uppercase name/}}', { name: 'alice' }); // "ALICE"
stampdown.render('{{#add x y/}}', { x: 10, y: 5 }); // "15"
```

## Advanced Features

### Variable Assignment

Assign values within templates:

```typescript
const template = `
{{ total = 0 }}
{{#each items}}
  {{ total = total + this.price }}
{{/each}}
Total: ${{ total }}
`;

stampdown.render(template, {
  items: [{ price: 10 }, { price: 15 }, { price: 8 }]
});
// "Total: $33"
```

### Advanced Expressions

Use comparison operators and logical expressions:

```typescript
// Comparison operators
stampdown.render('{{#if age > 18}}Adult{{else}}Minor{{/if}}', { age: 25 });

// Logical operators
stampdown.render('{{#if premium && verified}}Elite{{/if}}', { premium: true, verified: true });

// Else-if chains
const template = `
{{#if score >= 90}}A{{else if score >= 80}}B{{else if score >= 70}}C{{else}}F{{/if}}
`;
stampdown.render(template, { score: 85 }); // "B"
```

### Partials

Reusable template components:

```typescript
// Register a partial
stampdown.registerPartial('userCard', `
  <div class="user">
    <h3>{{name}}</h3>
    <p>{{email}}</p>
  </div>
`);

// Use the partial
stampdown.render('{{> userCard}}', { name: 'Alice', email: 'alice@example.com' });
```

### Custom Helpers

Create your own helpers:

```typescript
stampdown.registerHelper('formatCurrency', (context, options, amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(Number(amount));
});

stampdown.render('{{#formatCurrency price "EUR"/}}', { price: 29.99 });
// "€29.99"
```

### Template Precompilation

Compile templates for better performance:

```typescript
import { Precompiler } from '@stampdwn/core';

const precompiler = new Precompiler();
const compiled = precompiler.precompile('Hello {{name}}!');

// Use compiled template
const renderFn = new Function('context', 'stampdown', compiled.code);
const result = renderFn({ name: 'World' }, stampdown);
```

## API Reference

### Stampdown Class

#### Constructor

```typescript
new Stampdown(options?: {
  plugins?: StampdownPlugin[];
  helpers?: Record<string, Helper>;
  partials?: Record<string, string>;
})
```

#### Methods

- `render(template: string, context: object): string` - Render a template with context
- `registerHelper(name: string, helper: Helper): void` - Register a custom helper
- `registerPartial(name: string, content: string): void` - Register a partial template
- `getHelperRegistry(): HelperRegistry` - Get the helper registry
- `getRenderer(): Renderer` - Get the renderer instance

### Plugin System

```typescript
import { createPlugin } from '@stampdwn/core';

const myPlugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom plugin',
  plugin: (stampdown) => {
    stampdown.registerHelper('myHelper', (context, options, ...args) => {
      return 'Hello from my plugin!';
    });
  }
});
```

## Related Packages

- [`@stampdwn/cli`](https://www.npmjs.com/package/@stampdwn/cli) - Command-line interface
- [`@stampdwn/llm`](https://www.npmjs.com/package/@stampdwn/llm) - LLM prompt templating plugin

## License

MIT