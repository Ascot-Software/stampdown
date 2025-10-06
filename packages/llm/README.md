# @stampdwn/llm

Specialized Stampdown plugin for LLM prompt templating with multi-provider support.

## Installation

```bash
npm install @# Markdown sections can be added directly
## Conversation
{{#eachMessage}}...{{/eachMessage}}pdwn/llm
```

The LLM plugin requires peer dependencies:

```bash
npm install @ai-sdk/provider gpt-tokenizer yaml zod
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

## Features

### Multi-Provider Normalization

The plugin normalizes messages from different LLM providers via `@ai-sdk`:

- **OpenAI** (GPT-3.5, GPT-4, etc.)
- **Anthropic** (Claude)
- **Azure OpenAI**
- **Google Vertex AI**
- **Custom providers** via `@ai-sdk`

All providers are normalized to a consistent internal format, so your templates work across any provider.

### Role-Aware Helpers

Filter and render content based on message roles:

```typescript
// Render only user messages
{{#eachByRole role="user"}}
  User said: {{#firstText this/}}
{{/eachByRole}}

// Conditional rendering by role
{{#ifUser}}This is a user message{{/ifUser}}
{{#ifAssistant}}This is an assistant message{{/ifAssistant}}
{{#ifSystem}}This is a system message{{/ifSystem}}
{{#ifTool}}This is a tool message{{/ifTool}}
```

### Content Handling

Extract and manipulate different content types:

```typescript
// Get all text content
{{#joinText messages sep=" | "/}}

// Iterate over content items
{{#eachContent}}
  {{#if type === "text"}}Text: {{text}}{{/if}}
  {{#if type === "image"}}Image: {{url}}{{/if}}
{{/eachContent}}

// Filter to text content only
{{#eachText}}
  {{this}} <!-- 'this' is the text value -->
{{/eachText}}
```

### Token Management

Count and truncate content by token limits:

```typescript
// Count tokens in text
Token count: {{#tokenCount text/}}

// Truncate by token limit
{{#truncateTokens content max=100 on="text"/}}

// Truncate entire messages
{{#truncateTokens conversation max=2000 on="message"/}}
```

### Message Windowing

Select message ranges for context management:

```typescript
// Last 5 messages
{{#window size=5 from="end"}}
{{#eachMessage}}...{{/eachMessage}}
{{/window}}

// First 3 user messages only
{{#window size=3 from="start" role="user"}}
{{#eachMessage}}...{{/eachMessage}}
{{/window}}
```

### Output Formatting

Format chat data for debugging or API calls:

```typescript
// JSON format
{{#json chat/}}

// YAML format
{{#yaml chat/}}

// Markdown sections
{{#mdSection title="Conversation" level=2}}
{{#eachMessage}}...{{/eachMessage}}
{{/mdSection}}

// Code fences
{{#codeFence lang="json"}}
{{#json messages/}}
{{/codeFence}}
```

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



#### `codeFence`
Wraps content in markdown code fence.

```handlebars
{{#codeFence lang="json"}}
{{#json data/}}
{{/codeFence}}
```

#### `json`, `yaml`
Stringifies value as JSON or YAML.

```handlebars
{{#json chat/}}
{{#yaml config/}}
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

## Use Cases

### Prompt Engineering
- Build reusable prompt templates
- Context windowing for token limits
- Multi-turn conversation management
- Provider-agnostic prompt design

### LLM Application Development
- Request/response formatting
- Conversation history templating
- Dynamic prompt generation
- Debug output formatting

### Multi-Provider Systems
- Normalize different provider formats
- Template once, deploy everywhere
- Provider switching without code changes
- Consistent conversation handling

## Related Packages

- [`@stampdwn/core`](../core/) - Core templating engine
- [`@stampdwn/cli`](../cli/) - Command-line interface
- [`@stampdwn/vscode`](../vscode/) - VS Code extension

## License

MIT