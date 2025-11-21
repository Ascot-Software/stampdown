# Stampdown

Stampdown is a simple Markdown templating language with a minimal, Handlebars‑style syntax. It uses a template and an input object to generate a Markdown document.

## Why Stampdown?

- **Dynamic Markdown**: Author content as Markdown; make it dynamic with templating features.
- **Expressive**: Conditionals, loops, inline math/string/date helpers, subexpressions, and assignment.
- **Composable**: Partials, partial blocks, inline partials, and plugins keep large templates maintainable.
- **Performant**: Precompile to tiny JS functions (tree‑shake helpers) for 10× faster render throughput.
- **Tooling**: CLI for build pipelines, VS Code & CodeMirror syntax highlighting.

## Example

Template file (`welcome.sdt`):
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
import { dateHelpersPlugin, stringHelpersPlugin } from '@stampdwn/core/plugins';
import { readFileSync } from 'fs';

const stampdown = new Stampdown({ plugins: [dateHelpersPlugin, stringHelpersPlugin] });

const templateSource = readFileSync('welcome.sdt', 'utf-8');
const data = {
  user: { name: 'Alice', premium: true },
  items: ['Getting Started Guide', 'FAQ', 'Release Notes'],
  now: new Date()
};

const output = stampdown.render(templateSource, data);
console.log(output);
```

Resulting Markdown (rendered output):
```markdown
# Welcome, Alice!

**Premium Member**

- Getting Started Guide
- FAQ
- Release Notes

---
Generated on 2025-11-21
```

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@stampdwn/core`](packages/core/) | Core templating engine with built‑in helpers and plugin system | ![npm](https://img.shields.io/npm/v/@stampdwn/core) |
| [`@stampdwn/cli`](packages/cli/) | CLI for compiling, rendering, batching, project scaffolding | ![npm](https://img.shields.io/npm/v/@stampdwn/cli) |
| [`@stampdwn/llm`](packages/llm/) | LLM prompt engineering helpers (chat normalization, tokens) | ![npm](https://img.shields.io/npm/v/@stampdwn/llm) |
| [`@stampdwn/codemirror`](packages/codemirror/) | CodeMirror language support (inline highlighting) | ![npm](https://img.shields.io/npm/v/@stampdwn/codemirror) |
| [`@stampdwn/vscode`](packages/vscode/) | VS Code extension for `.sdt` templates | - |

## API Docs

| Package | API Reference |
|---------|---------------|
| Core | [`packages/core/docs/index.md`](packages/core/docs/index.md) |
| CLI | [`packages/cli/docs/index.md`](packages/cli/docs/index.md) |
| LLM | [`packages/llm/docs/index.md`](packages/llm/docs/index.md) |
| CodeMirror | [`packages/codemirror/docs/index.md`](packages/codemirror/docs/index.md) |
| VS Code | (Extension commands & grammar – no generated API) |

## Feature Overview (High Level)

- **Expressions & Operators**: Dot access, literals, comparison & logical operators, subexpressions.
- **Loops & Context**: `#each`, `#with`, iteration metadata (`@index`, `@first`, `@last`).
- **Built‑in Helpers**: Strings, math, dates, arrays, debug (opt‑in via plugins).
- **Partials**: Static, dynamic, context passing, hash params, inline partials, partial blocks (`#>` / `@partial-block`).
- **Custom Helpers**: Register synchronous helpers (`(context, options, ...args) => string`).
- **Variable Assignment**: Mutate context inline: `{{ total = total + item.price }}`.
- **Hooks**: Pre/post process transforms for template or output.
- **Plugins**: Load helper bundles or author your own via `createPlugin/definePlugin`.
- **Precompiling**: Convert templates to lean JS functions; specify `knownHelpers` for tree‑shaking.
- **CLI**: Compile, render, batch, watch, strict helper validation, source maps.
- **Editor Tooling**: VS Code & CodeMirror highlighting for `.sdt`, including helpers & partial syntax.

## Getting Started

```bash
npm install @stampdwn/core
```

```typescript
import { Stampdown } from '@stampdwn/core';
const engine = new Stampdown();
engine.render('Hello {{name}}', { name: 'World' });
```

Add helper plugins:
```typescript
import { stringHelpersPlugin, mathHelpersPlugin } from '@stampdwn/core/plugins';
const engine = new Stampdown({ plugins: [stringHelpersPlugin, mathHelpersPlugin] });
```

## Precompile

```typescript
import { Precompiler, Stampdown } from '@stampdwn/core';
const pre = new Precompiler();
const compiled = pre.precompile('Hi {{name}}', { templateId: 'greet', knownHelpers: ['if'] });
const fn = new Function('context', 'stampdown', compiled.code);
const sd = new Stampdown();
sd.registerPrecompiledTemplate('greet', fn);
sd.renderPrecompiled('greet', { name: 'Ada' });
```

## CLI

```bash
stampdown compile "templates/**/*.sdt" --output dist/ --format esm
stampdown render template.sdt --data data.json --partials partials/
stampdown batch templates/ --data-dir data/ --output dist/
```

## Editor Extensions

- **VS Code**: Install "Stampdown Language Support" for `.sdt` syntax, folding & comments.
- **CodeMirror**: Use `@stampdwn/codemirror` to extend Markdown highlighting with Stampdown tokens.

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run format
```

## License

MIT
