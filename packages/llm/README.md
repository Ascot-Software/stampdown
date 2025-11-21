# Stampdown Prompt Engineering Plugin

Specialized Stampdown plugin for LLM prompt templating with multi-provider support.

## Installation

```bash
npm install @stampdwn/llm
```

## Quick Start

```typescript
import { Stampdown } from '@stampdwn/core';
import { llmPlugin } from '@stampdwn/llm';

const stampdown = new Stampdown({
  plugins: [llmPlugin]
});

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

## Multi-Provider Normalization

The plugin normalizes messages from different LLM providers via `@ai-sdk`:

- **OpenAI** (GPT-3.5, GPT-4, etc.)
- **Anthropic** (Claude)
- **Azure OpenAI**
- **Google Vertex AI**
- **Custom providers** via `@ai-sdk`

All providers are normalized to a consistent internal format, so your templates work across any provider.

## Helper Reference

### Context Normalization

#### `withChat`
Normalizes raw chat payload and sets as block context.

```markdown
{{#withChat raw=chat}}
  <!-- chat is now normalized and available as context -->
{{/withChat}}
```

### Message Iteration

#### `eachMessage`
Iterates over all messages with special variables.

```markdown
{{#eachMessage}}
  **Message** {{@index}}: {{#firstText this/}}
{{/eachMessage}}
```

#### `eachByRole`
Iterates over messages filtered by role.

```markdown
{{#eachByRole role="user"}}
  **User** {{@index}}: {{#firstText this/}}
{{/eachByRole}}
```

### Role Gates

#### `ifUser`, `ifAssistant`, `ifSystem`, `ifTool`
Conditional rendering based on message role.

```markdown
{{#eachMessage}}
  {{#ifUser}}👤 {{#firstText this/}}{{/ifUser}}
  {{#ifAssistant}}🤖 {{#firstText this/}}{{/ifAssistant}}
{{/eachMessage}}
```

### Content Helpers

#### `eachContent`
Iterates over all content items in a message.

```markdown
{{#eachContent}}
  **Type**: {{type}}, **Content**: {{#if type === "text"}}{{text}}{{/if}}
{{/eachContent}}
```

#### `eachText`
Iterates over text content only.

```markdown
{{#eachText}}
  {{this}} <!-- text value -->
{{/eachText}}
```

#### `joinText`
Joins all text content with separator.

```markdown
{{#joinText messages sep=" | "/}}
```

#### `firstText`, `lastText`
Gets first or last text content from message.

```markdown
**First**: {{#firstText message/}}
**Last**: {{#lastText message/}}
```

### Windowing & Tokens

#### `window`
Selects message range with optional role filter.

```markdown
{{#window size=5 from="end" role="user"}}
  {{#eachMessage}}...{{/eachMessage}}
{{/window}}
```

#### `tokenCount`
Counts tokens in text using gpt-tokenizer.

```markdown
Tokens: {{#tokenCount text/}}
```

#### `truncateTokens`
Truncates by token limit with different modes.

```markdown
<!-- Truncate text -->
{{#truncateTokens text max=100 on="text"/}}

<!-- Truncate message content -->
{{#truncateTokens message max=200 on="message"/}}

<!-- Truncate in block mode -->
{{#truncateTokens max=500 on="block"}}
  Long content here...
{{/truncateTokens}}
```

### Formatting Helpers

#### `json`, `yaml`, `toon`
Stringifies value as JSON, YAML or TOON

```markdown
{{#json chat/}}
{{#yaml config/}}
{{#toon chat/}}
```

#### `renderChat`
Converts chat to provider-specific format.

```markdown
{{#renderChat chat format="json" shape="openai"/}}
{{#renderChat chat format="yaml" shape="anthropic"/}}
```

### Custom Tokenizer

Provide your own tokenization logic:

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

## API Docs

Full API reference: [`packages/llm/docs/index.md`](docs/index.md)

## Related Packages

This package is part of the Stampdown ecosystem:

- [@stampdwn/core](https://www.npmjs.com/package/@stampdwn/core) - Core templating engine
- [@stampdwn/cli](https://www.npmjs.com/package/@stampdwn/cli) - Command-line interface
- [@stampdwn/codemirror](https://www.npmjs.com/package/@stampdwn/codemirror) - Code mirror language support
- [@stampdwn/vscode](https://marketplace.visualstudio.com/items?itemName=AscotSoftware.stampdown-language-support) - VS Code extension

## License

MIT