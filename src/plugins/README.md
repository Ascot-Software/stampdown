# Stampdown Plugins

This directory contains modular plugins for extending Stampdown functionality.

## Available Plugins

### String Helpers Plugin
**Location:** `src/plugins/string-helpers.ts`

Provides string manipulation helpers:
- `uppercase` - Convert text to uppercase
- `lowercase` - Convert text to lowercase
- `capitalize` - Capitalize first letter
- `trim` - Remove whitespace from both ends
- `repeat` - Repeat text N times
- `truncate` - Truncate text to max length

**Import:**
```typescript
import { stringHelpersPlugin } from 'stampdown/plugins/string-helpers';
// or
import { stringHelpersPlugin } from 'stampdown/plugins';
```

### Math Helpers Plugin
**Location:** `src/plugins/math-helpers.ts`

Provides mathematical operation helpers:
- `add` - Add numbers
- `subtract` - Subtract numbers
- `multiply` - Multiply numbers
- `divide` - Divide numbers
- `mod` - Modulo operation
- `round` - Round to decimal places
- `min` - Find minimum value
- `max` - Find maximum value

**Import:**
```typescript
import { mathHelpersPlugin } from 'stampdown/plugins/math-helpers';
// or
import { mathHelpersPlugin } from 'stampdown/plugins';
```

### Date Helpers Plugin
**Location:** `src/plugins/date-helpers.ts`

Provides date formatting and manipulation helpers:
- `formatDate` - Format date with pattern (YYYY-MM-DD, etc.)
- `now` - Get current timestamp (ISO format)
- `timeAgo` - Human-readable relative time

**Import:**
```typescript
import { dateHelpersPlugin } from 'stampdown/plugins/date-helpers';
// or
import { dateHelpersPlugin } from 'stampdown/plugins';
```

### Array Helpers Plugin
**Location:** `src/plugins/array-helpers.ts`

Provides array manipulation helpers:
- `join` - Join array elements with separator
- `length` - Get length of array/string/object
- `slice` - Extract portion of array
- `reverse` - Reverse array order
- `sort` - Sort array

**Import:**
```typescript
import { arrayHelpersPlugin } from 'stampdown/plugins/array-helpers';
// or
import { arrayHelpersPlugin } from 'stampdown/plugins';
```

### Debug Plugin
**Location:** `src/plugins/debug.ts`

Provides debugging and introspection helpers:
- `json` - Stringify value as JSON
- `typeof` - Get type of value
- `keys` - Get object keys
- `values` - Get object values

**Import:**
```typescript
import { debugPlugin } from 'stampdown/plugins/debug';
// or
import { debugPlugin } from 'stampdown/plugins';
```

### LLM Plugin
**Location:** `src/plugins/llm/`

Provides specialized helpers for prompt engineering and LLM conversation templating:
- **Context normalization**: `withChat` - Normalize provider payloads via @ai-sdk
- **Message iteration**: `eachMessage`, `eachByRole` - Iterate with role filtering
- **Role gates**: `ifUser`, `ifAssistant`, `ifSystem`, `ifTool` - Conditional rendering by role
- **Content helpers**: `eachContent`, `eachText`, `joinText`, `firstText`, `lastText` - Extract and manipulate content
- **Windowing**: `window` - Select message ranges for context management
- **Token operations**: `tokenCount`, `truncateTokens` - Token counting and truncation
- **Formatting**: `mdSection`, `codeFence`, `json`, `yaml`, `renderChat` - Output formatting

**Provider Support:** OpenAI, Anthropic, Azure OpenAI, Google Vertex AI, and custom providers

**Import:**
```typescript
import { llmPlugin } from 'stampdown/plugins/llm';
// or
import { llmPlugin } from 'stampdown/plugins';
```

**Full Documentation:** See [LLM Plugin README](./llm/README.md)

**Dependencies:** Requires `@ai-sdk/provider`, `yaml`, `gpt-tokenizer`, `zod`

## Usage Examples

### Individual Plugin Import
```typescript
import { Stampdown } from 'stampdown';
import { stringHelpersPlugin } from 'stampdown/plugins/string-helpers';
import { mathHelpersPlugin } from 'stampdown/plugins/math-helpers';

const stampdown = new Stampdown({
  plugins: [stringHelpersPlugin, mathHelpersPlugin]
});
```

### Multiple Plugins from Index
```typescript
import { Stampdown } from 'stampdown';
import {
  stringHelpersPlugin,
  mathHelpersPlugin,
  debugPlugin
} from 'stampdown/plugins';

const stampdown = new Stampdown({
  plugins: [stringHelpersPlugin, mathHelpersPlugin, debugPlugin]
});
```

### All Plugins from Main Package
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

### LLM Plugin Example
```typescript
import { Stampdown } from 'stampdown';
import { llmPlugin } from 'stampdown/plugins/llm';

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

## Creating Custom Plugins

Each plugin file follows this structure:

```typescript
import { createPlugin } from '../plugin';
import type { Context } from '../types';
import type { HelperOptions } from '../helpers/registry';

export const myPlugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  description: 'Description of what the plugin does',
  plugin: (stampdown) => {
    // Register helpers
    stampdown.registerHelper(
      'myHelper',
      (_context: Context, _options: HelperOptions, arg: unknown) => {
        return String(arg).toUpperCase();
      }
    );

    // Register partials
    stampdown.registerPartial('myPartial', 'Template content');

    // Add hooks
    stampdown.addPreProcessHook((input) => input);
    stampdown.addPostProcessHook((output) => output);
  },
});
```
