# LLM Plugin for Stampdown

The LLM Plugin provides specialized helpers for prompt engineering and LLM conversation templating. It normalizes chat payloads from various AI providers (via `@ai-sdk`) and offers role-aware helpers for building dynamic prompts.

## Features

- **Multi-Provider Support**: Normalize messages from OpenAI, Anthropic, Azure OpenAI, Google Vertex AI, and custom providers
- **Role-Aware Helpers**: Filter and format messages by role (user, assistant, system, tool)
- **Content Handling**: Extract and manipulate text, images, and tool content
- **Token Management**: Count tokens and truncate content by token limits
- **Message Windowing**: Select message ranges for context management
- **Formatting Utilities**: JSON, YAML, Markdown sections, and code fences

## Installation

```bash
npm install stampdown @ai-sdk/provider yaml gpt-tokenizer zod
```

## Basic Usage

```typescript
import { Stampdown } from 'stampdown';
import { llmPlugin } from 'stampdown/plugins/llm';

const stampdown = new Stampdown({
  plugins: [llmPlugin]
});

const template = `
{{#withChat raw=chat}}
    {{#eachMessage}}
        {{#ifUser}}**User**: {{#firstText this/}}{{/ifUser}}
        {{#ifAssistant}}**Assistant**: {{#firstText this/}}{{/ifAssistant}}
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

## Normalized Types

The plugin uses a normalized type system for cross-provider compatibility:

### NormRole
```typescript
type NormRole = 'system' | 'user' | 'assistant' | 'tool' | 'function';
```

### NormContent
```typescript
type NormContent =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string }
  | { type: 'tool-call'; id: string; name: string; args: unknown }
  | { type: 'tool-result'; id: string; result: unknown };
```

### NormMessage
```typescript
interface NormMessage {
  role: NormRole;
  content: NormContent[];
  name?: string;
}
```

### NormChat
```typescript
interface NormChat {
  provider?: string;
  model?: string;
  messages: NormMessage[];
}
```

## Helpers Reference

### Context Normalization

#### `withChat`
Normalizes a raw chat payload and sets it as the block context.

**Usage:**
```handlebars
{{#withChat raw=chat}}
  <!-- chat is now normalized -->
  {{provider}} / {{model}}
{{/withChat}}
```

**Parameters:**
- `raw` (hash): The raw chat object to normalize

---

### Message Iteration

#### `eachMessage`
Iterates over all messages in the chat.

**Usage:**
```handlebars
{{#withChat raw=chat}}
    {{#eachMessage}}
        Role: {{role}}
    {{/eachMessage}}
{{/withChat}}
```

**Context Variables:**
- `@index` - Message index
- `@first` - true if first message
- `@last` - true if last message

#### `eachByRole`
Iterates over messages filtered by role.

**Usage:**
```handlebars
{{#eachByRole role="user"}}
  User message: {{#firstText this/}}
{{/eachByRole}}
```

**Parameters:**
- `role` (hash): Role to filter by ('user', 'assistant', 'system', 'tool')

---

### Role Gates

Role gate helpers conditionally render content based on message role.

#### `ifUser` / `ifAssistant` / `ifSystem` / `ifTool`

**Usage:**
```handlebars
{{#eachMessage}}
    {{#ifUser}}👤 User: {{#firstText this/}}{{/ifUser}}
    {{#ifAssistant}}🤖 Assistant: {{#firstText this/}}{{/ifAssistant}}
    {{#ifSystem}}⚙️ System: {{#firstText this/}}{{/ifSystem}}
    {{#ifTool}}🔧 Tool: {{#firstText this/}}{{/ifTool}}
{{/eachMessage}}
```

**Inverse blocks:**
```handlebars
{{#ifUser}}
  This is a user message
{{else}}
  This is NOT a user message
{{/ifUser}}
```

---

### Content Helpers

#### `eachContent`
Iterates over all content items in a message.

**Usage:**
```handlebars
{{#eachContent}}
  Type: {{type}}
  {{#if text}}Text: {{text}}{{/if}}
{{/eachContent}}
```

**Context Variables:**
- `type` - Content type ('text', 'image', 'tool-call', 'tool-result')
- `text` - Text content (if type is 'text')
- `url` - Image URL (if type is 'image')
- `@index`, `@first`, `@last`

#### `eachText`
Iterates over text content items only.

**Usage:**
```handlebars
{{#eachText}}
  [{{@index}}] {{this}}
{{/eachText}}
```

**Context:**
- `this` - The text string
- `text` - Same as `this`

#### `joinText`
Joins all text content with a separator.

**Usage:**
```handlebars
{{#joinText this sep=" | "/}}
```

**Parameters:**
- `this` - Message or array of messages
- `sep` (hash): Separator string (default: " ")

#### `firstText`
Gets the first text content from a message.

**Usage:**
```handlebars
{{#firstText message/}}
```

#### `lastText`
Gets the last text content from a message.

**Usage:**
```handlebars
{{#lastText message/}}
```

---

### Windowing & Tokens

#### `window`
Selects a range of messages for context windowing.

**Usage:**
```handlebars
{{#window size=5 from="end"}}
  <!-- Last 5 messages -->
{{/window}}

{{#window size=3 from="start"}}
  <!-- First 3 messages -->
{{/window}}

{{#window size=10 from="end" role="user"}}
  <!-- Last 10 user messages -->
{{/window}}
```

**Parameters:**
- `size` (hash): Number of messages to include
- `from` (hash): 'start' or 'end' (default: 'end')
- `role` (hash): Optional role filter

#### `tokenCount`
Counts tokens in text using gpt-tokenizer.

**Usage:**
```handlebars
Token count: {{#tokenCount "Hello world"/}}
```

#### `truncateTokens`
Truncates content by token limit.

**Block mode** (truncate rendered content):
```handlebars
{{#truncateTokens max=100 on="block"}}
  {{#eachMessage}}...{{/eachMessage}}
{{/truncateTokens}}
```

**Text mode** (truncate specific text):
```handlebars
{{#truncateTokens text max=50 on="text"/}}
```

**Message mode** (truncate message text content):
```handlebars
{{#truncateTokens message max=200 on="message"/}}
```

**Parameters:**
- `max` (hash): Maximum token count (default: 2000)
- `on` (hash): Mode - 'block', 'text', or 'message' (default: 'block')

---

### Formatting Helpers

#### `mdSection`
Creates a Markdown section with heading.

**Usage:**
```handlebars
{{#mdSection title="Conversation" level=2}}
  Content here
{{/mdSection}}
```

**Output:**
```markdown
## Conversation

Content here
```

**Parameters:**
- `title` (hash): Section title
- `level` (hash): Heading level 1-6 (default: 2)

#### `codeFence`
Creates a Markdown code fence.

**Usage:**
```handlebars
{{#codeFence lang="typescript"}}
    const x = 42;
{{/codeFence}}
```

**Output:**
````markdown
```typescript
const x = 42;
```
````

**Parameters:**
- `lang` (hash): Language identifier

#### `json`
Stringifies a value as JSON.

**Usage:**
```handlebars
{{#json object/}}
{{#json object indent=2/}}
```

**Parameters:**
- First arg: Value to stringify
- `indent` (hash): Indentation level (default: 0)

#### `yaml`
Stringifies a value as YAML.

**Usage:**
```handlebars
{{#yaml object/}}
```

#### `renderChat`
Renders the normalized chat in various provider formats.

**Usage:**
```handlebars
<!-- OpenAI format -->
{{#renderChat chat format="json" shape="openai"/}}

<!-- Anthropic format -->
{{#renderChat chat format="json" shape="anthropic"/}}

<!-- Normalized format -->
{{#renderChat chat format="yaml" shape="norm"/}}

<!-- Custom format (returns chat object) -->
{{#renderChat chat format="custom" shape="norm"/}}
```

**Parameters:**
- `format` (hash): 'json', 'yaml', or 'custom'
- `shape` (hash): 'norm', 'openai', or 'anthropic'

---

## Custom Tokenizer

You can provide a custom tokenizer for token counting:

```typescript
import { Stampdown } from 'stampdown';
import { llmPlugin, type Tokenizer } from 'stampdown/plugins/llm';

const customTokenizer: Tokenizer = {
  count: (text: string) => {
    // Custom token counting logic
    return text.split(/\s+/).length;
  },
  truncateByTokens: (text: string, maxTokens: number) => {
    // Custom truncation logic
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

## Complete Example

```typescript
import { Stampdown } from 'stampdown';
import { llmPlugin } from 'stampdown/plugins/llm';

const stampdown = new Stampdown({
  plugins: [llmPlugin]
});

const template = `
{{#withChat raw=chat}}
    {{#mdSection title="Conversation Summary" level=1}}

        **Model**: {{model}} ({{provider}})
        **Messages**: {{messages.length}}

        {{#mdSection title="Recent Messages" level=2}}
            {{#window size=5 from="end"}}
                {{#eachMessage}}

                    {{#ifSystem}}
                        ### System Prompt
                        {{#codeFence lang="text"}}
                            {{#joinText this/}}
                        {{/codeFence}}
                    {{/ifSystem}}

                    {{#ifUser}}
                        **User** ({{#tokenCount (firstText this)/}} tokens):
                        {{#firstText this/}}
                    {{/ifUser}}

                    {{#ifAssistant}}
                        **Assistant** ({{#tokenCount (firstText this)/}} tokens):
                        {{#truncateTokens this max=100 on="message"/}}
                    {{/ifAssistant}}

                {{/eachMessage}}
            {{/window}}
        {{/mdSection}}

        {{#mdSection title="All User Messages" level=2}}
            {{#eachByRole role="user"}}
                - {{#firstText this/}}
            {{/eachByRole}}
        {{/mdSection}}

    {{/mdSection}}
{{/withChat}}
`;

const result = stampdown.render(template, {
  chat: {
    provider: 'openai',
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: [{ type: 'text', text: 'You are a helpful assistant.' }]
      },
      {
        role: 'user',
        content: [{ type: 'text', text: 'What is TypeScript?' }]
      },
      {
        role: 'assistant',
        content: [{ type: 'text', text: 'TypeScript is a typed superset of JavaScript...' }]
      },
      {
        role: 'user',
        content: [{ type: 'text', text: 'Can you show an example?' }]
      },
      {
        role: 'assistant',
        content: [{ type: 'text', text: 'Sure! Here\'s a simple example...' }]
      }
    ]
  }
});

console.log(result);
```

## Provider Support

The plugin normalizes messages from these providers via `@ai-sdk`:

- **OpenAI** (`openai`)
- **Anthropic** (`anthropic`)
- **Azure OpenAI** (`azure`)
- **Google Vertex AI** (`vertex`)
- **Custom providers** (any provider implementing @ai-sdk interface)

All provider-specific message formats are normalized to the `NormChat` structure for consistent templating.

## Type Safety

The plugin includes full TypeScript support with exported types:

```typescript
import type {
  NormRole,
  NormContent,
  NormMessage,
  NormChat,
  Tokenizer,
  LLMHelperOptions
} from 'stampdown/plugins/llm';
```

## Testing

The plugin includes comprehensive tests covering:
- Message normalization from @ai-sdk
- All helper functions
- Role filtering and gating
- Content extraction
- Token counting and truncation
- Formatting helpers
- Integration scenarios

Run tests:
```bash
npm test -- llm-plugin.test
```

## Dependencies

- `@ai-sdk/provider` - Provider normalization
- `yaml` - YAML formatting
- `gpt-tokenizer` - Token counting
- `zod` - Runtime validation

## License

Part of the Stampdown project. See main LICENSE file.
