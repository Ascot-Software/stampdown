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

```handlebars
{{#withChat raw=chat}}
  <!-- chat is now normalized and available as context -->
{{/withChat}}
```

### Message Iteration

#### `eachMessage`
Iterates over all messages with special variables.

```handlebars
{{#eachMessage}}
  Message {{@index}}: {{#firstText this/}}
{{/eachMessage}}
```

#### `eachByRole`
Iterates over messages filtered by role.

```handlebars
{{#eachByRole role="user"}}
  User {{@index}}: {{#firstText this/}}
{{/eachByRole}}
```

### Role Gates

#### `ifUser`, `ifAssistant`, `ifSystem`, `ifTool`
Conditional rendering based on message role.

```handlebars
{{#eachMessage}}
  {{#ifUser}}👤 {{#firstText this/}}{{/ifUser}}
  {{#ifAssistant}}🤖 {{#firstText this/}}{{/ifAssistant}}
{{/eachMessage}}
```

### Content Helpers

#### `eachContent`
Iterates over all content items in a message.

```handlebars
{{#eachContent}}
  Type: {{type}}, Content: {{#if type === "text"}}{{text}}{{/if}}
{{/eachContent}}
```

#### `eachText`
Iterates over text content only.

```handlebars
{{#eachText}}
  {{this}} <!-- text value -->
{{/eachText}}
```

#### `joinText`
Joins all text content with separator.

```handlebars
{{#joinText messages sep=" | "/}}
```

#### `firstText`, `lastText`
Gets first or last text content from message.

```handlebars
First: {{#firstText message/}}
Last: {{#lastText message/}}
```

### Windowing & Tokens

#### `window`
Selects message range with optional role filter.

```handlebars
{{#window size=5 from="end" role="user"}}
  {{#eachMessage}}...{{/eachMessage}}
{{/window}}
```

#### `tokenCount`
Counts tokens in text using gpt-tokenizer.

```handlebars
Tokens: {{#tokenCount text/}}
```

#### `truncateTokens`
Truncates by token limit with different modes.

```handlebars
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

```handlebars
{{#json chat/}}
{{#yaml config/}}
{{#toon chat/}}
```

#### `renderChat`
Converts chat to provider-specific format.

```handlebars
{{#renderChat chat format="json" shape="openai"/}}
{{#renderChat chat format="yaml" shape="anthropic"/}}
```

## Advanced Usage

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

### Complex Prompt Templates

Build sophisticated prompts with context windowing:

```typescript
const promptTemplate = `
{{#withChat raw=conversation}}

## System Context
You are a helpful AI assistant.

## Recent Context
{{#window size=10 from="end"}}
{{#eachMessage}}
{{#ifUser}}**User**: {{#joinText this sep=" "/}}{{/ifUser}}
{{#ifAssistant}}**Assistant**: {{#joinText this sep=" "/}}{{/ifAssistant}}

{{/eachMessage}}
{{/window}}

## Current Query
{{query}}

Current token count: {{#tokenCount (renderChat this format="json" shape="openai")/}}

{{/withChat}}
`;

const prompt = stampdown.render(promptTemplate, {
  conversation: aiSdkPayload,
  query: "What did we discuss about pricing?"
});
```

### Multi-Provider Support Example

```typescript
// Works with any @ai-sdk compatible provider
const templates = {
  openai: stampdown.render(template, { chat: openaiPayload }),
  anthropic: stampdown.render(template, { chat: anthropicPayload }),
  vertex: stampdown.render(template, { chat: vertexPayload })
};

// All produce consistent output regardless of provider
```

## Type Definitions

```typescript
// Normalized types (provider-agnostic)
type NormRole = 'system' | 'user' | 'assistant' | 'tool' | 'function';

type NormContent =
  | { type: 'text'; text: string }
  | { type: 'image'; url?: string; data?: string; mime?: string }
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

// Tokenizer interface
interface Tokenizer {
  count(text: string): number;
  truncateByTokens(text: string, maxTokens: number): string;
}
```

## Related Packages

- [`@stampdwn/core`](https://www.npmjs.com/package/@stampdwn/core) - Core templating engine
- [`@stampdwn/cli`](https://www.npmjs.com/package/@stampdwn/cli) - Command-line interface

## License

MIT