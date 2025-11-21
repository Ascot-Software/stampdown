# Stampdown

Everyone loves Markdown! Stampdown is Markdown on steroids, making it usable in more places than ever before.

Stampdown is a simple Markdown templating language with a minimal, Handlebars‑style syntax. It uses a template and an input object to generate a Markdown document.

## Features
- Variables
- Expressions
- Control Statements
- Partials
- Custom Helpers & Plugins
- Precompiler

## How it works

Template (`welcome.sdt`):
```markdown
# Welcome, {{user.name}}!

{{#if user.premium}}
**Premium Member**
{{else}}
Free Tier
{{/if}}

{{#each items}}
- {{this}}
{{/each}}

{{#*inline "footer"}}
---
Generated on {{#formatDate now "YYYY-MM-DD"/}}
{{/inline}}

{{> footer}}
```

Render code:
```typescript
import { Stampdown } from '@stampdwn/core';
import { dateHelpersPlugin } from '@stampdwn/core/plugins';
import { readFileSync } from 'fs';

const engine = new Stampdown({ plugins: [dateHelpersPlugin] });
const src = readFileSync('welcome.sdt', 'utf-8');

const output = engine.render(src, {
  user: { name: 'Alice', premium: true },
  items: ['Getting Started Guide', 'FAQ', 'Release Notes'],
  now: new Date()
});

console.log(output);
```

Resulting Markdown:
```markdown
# Welcome, Alice!

**Premium Member**

- Getting Started Guide
- FAQ
- Release Notes

---
Generated on 2025-11-21
```

## Installation

```bash
npm install @stampdwn/core
```

## Features

### Variables
Assign and use variables inline (silent output):
```stampdown
{{ total = 0 }}
{{#each prices}}
  {{ total = total + this }}
{{/each}}
Total: {{ total }}
```

### Built-in Helpers
Core block helpers:
```stampdown
{{#if premium}}
  **Premium**
{{else}}
  Standard
{{/if}}

{{#each items}}
  - {{this}}
{{/each}}

{{#with user}}
  Name: {{name}}
{{/with}}

{{#unless disabled}}
  Enabled
{{/unless}}
```

### Built-in Plugins
Opt-in helper plugins for strings, math, dates, arrays, debug:
```typescript
import { Stampdown } from '@stampdwn/core';
import { stringHelpersPlugin, mathHelpersPlugin } from '@stampdwn/core/plugins';

const sd = new Stampdown({
  plugins: [stringHelpersPlugin, mathHelpersPlugin]
});

const result = sd.render('{{#uppercase name/}} = {{#add a b/}}', {
  name: 'alice',
  a: 6,
  b: 7
});
console.log(result); // => ALICE = 13
```

### Expressions
Comparison, logical operators, subexpressions:
```stampdown
{{#if (score >= 90) || (vip && score >= 80)}}
  High Score
{{else}}
  Regular
{{/if}}
```

### Partials
Static, inline, and partial blocks:
```stampdown
{{#*inline "card"}}
  **{{title}}**

  {{content}}
{{/inline}}

{{> card title="Note" content="Remember to hydrate."}}
```

### Precompiling
```typescript
import { Precompiler, Stampdown } from '@stampdwn/core';

const pre = new Precompiler();
const compiled = pre.precompile('Hello {{name}}!', {
  templateId: 'greet',
  knownHelpers: 'all'
});

const fn = new Function('context', 'stampdown', compiled.code);
const sd = new Stampdown();
sd.registerPrecompiledTemplate('greet', fn);

const result = sd.renderPrecompiled('greet', { name: 'World' });
console.log(result); // => Hello World!
```

### Custom Helpers
```typescript
const sd = new Stampdown();

sd.registerHelper('repeat', (_ctx, _opts, text, times = 2) => {
  return text.repeat(Number(times));
});

const result = sd.render('{{#repeat word 3/}}', { word: 'Hi ' });
console.log(result); // => Hi Hi Hi
```

### Custom Plugins
Bundle helpers & configuration:
```typescript
import { createPlugin } from '@stampdwn/core';

const statsPlugin = createPlugin({
  name: 'stats',
  plugin: (sd) => {
    sd.registerHelper('avg', (_c, _o, ...nums) => {
      const n = nums.map(Number);
      return (n.reduce((a, b) => a + b, 0) / n.length).toFixed(2);
    });
  }
});

const sd = new Stampdown({ plugins: [statsPlugin] });
const result = sd.render('Avg: {{#avg 3 5 7/}}', {});
console.log(result); // => Avg: 5.00
```

## API Docs

Full API reference: [`packages/core/docs/index.md`](../core/docs/index.md)

## Related Packages

This package is part of the Stampdown ecosystem:

- [@stampdwn/llm](https://www.npmjs.com/package/@stampdwn/llm) - LLM plugin for prompt templating
- [@stampdwn/cli](https://www.npmjs.com/package/@stampdwn/cli) - Command-line interface
- [@stampdwn/codemirror](https://www.npmjs.com/package/@stampdwn/codemirror) - Code mirror language support
- [@stampdwn/vscode](https://marketplace.visualstudio.com/items?itemName=AscotSoftware.stampdown-language-support) - VS Code extension

## License

MIT