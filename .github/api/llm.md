<!-- Combined API docs generated from @microsoft/api-documenter output -->

Home

## API Reference

## Packages

<table><thead><tr><th>

Package


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

@stampdwn/llm


</td><td>

Stampdown LLM Plugin Provides LLM-focused helpers for chat message templating


</td></tr>
</tbody></table>


---



## llm package

Stampdown LLM Plugin Provides LLM-focused helpers for chat message templating

## Interfaces

<table><thead><tr><th>

Interface


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

LLMHelperOptions


</td><td>

Options for LLM helper registration


</td></tr>
<tr><td>

NormChat


</td><td>

Normalized chat structure with provider metadata


</td></tr>
<tr><td>

NormMessage


</td><td>

Normalized message structure


</td></tr>
<tr><td>

Tokenizer


</td><td>

Tokenizer interface for counting and truncating text by tokens


</td></tr>
</tbody></table>

## Variables

<table><thead><tr><th>

Variable


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

llmPlugin


</td><td>

LLM Plugin for Stampdown Normalizes provider payloads using `@ai-sdk` and provides role-aware helpers


</td></tr>
</tbody></table>

## Type Aliases

<table><thead><tr><th>

Type Alias


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

NormContent


</td><td>

Normalized content types for message content


</td></tr>
<tr><td>

NormRole


</td><td>

Normalized message role types across LLM providers


</td></tr>
</tbody></table>


---



## LLMHelperOptions interface

Options for LLM helper registration

**Signature:**

```typescript
export declare interface LLMHelperOptions 
```

## Properties

<table><thead><tr><th>

Property


</th><th>

Modifiers


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

tokenizer?


</td><td>


</td><td>

Tokenizer


</td><td>

_(Optional)_


</td></tr>
</tbody></table>


---



## LLMHelperOptions.tokenizer property

**Signature:**

```typescript
tokenizer?: Tokenizer;
```

---



## Tokenizer interface

Tokenizer interface for counting and truncating text by tokens

**Signature:**

```typescript
export declare interface Tokenizer 
```

## Methods

<table><thead><tr><th>

Method


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

count(text)


</td><td>

Count tokens in text


</td></tr>
<tr><td>

truncateByTokens(text, \_maxTokens)


</td><td>

Truncate text to maximum token count


</td></tr>
</tbody></table>


---



## Tokenizer.count() method

Count tokens in text

**Signature:**

```typescript
count(text: string): number;
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

text


</td><td>

string


</td><td>

Text to count tokens for


</td></tr>
</tbody></table>

**Returns:**

number

- Token count


---



## Tokenizer.truncateByTokens() method

Truncate text to maximum token count

**Signature:**

```typescript
truncateByTokens(text: string, _maxTokens: number): string;
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

text


</td><td>

string


</td><td>

Text to truncate


</td></tr>
<tr><td>

\_maxTokens


</td><td>

number


</td><td>

Maximum number of tokens


</td></tr>
</tbody></table>

**Returns:**

string

Truncated text


---



## NormChat interface

Normalized chat structure with provider metadata

**Signature:**

```typescript
export declare interface NormChat 
```

## Properties

<table><thead><tr><th>

Property


</th><th>

Modifiers


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

messages


</td><td>


</td><td>



</td><td>


</td></tr>
<tr><td>

meta?


</td><td>


</td><td>

Record&lt;string, unknown&gt;


</td><td>

_(Optional)_


</td></tr>
<tr><td>

model?


</td><td>


</td><td>

string


</td><td>

_(Optional)_


</td></tr>
<tr><td>

provider


</td><td>


</td><td>

'openai' \| 'anthropic' \| 'azure' \| 'vertex' \| 'other'


</td><td>


</td></tr>
</tbody></table>


---



## NormChat.messages property

**Signature:**

```typescript
messages: NormMessage[];
```

---



## NormChat.meta property

**Signature:**

```typescript
meta?: Record<string, unknown>;
```

---



## NormChat.model property

**Signature:**

```typescript
model?: string;
```

---



## NormChat.provider property

**Signature:**

```typescript
provider: 'openai' | 'anthropic' | 'azure' | 'vertex' | 'other';
```

---



## NormMessage interface

Normalized message structure

**Signature:**

```typescript
export declare interface NormMessage 
```

## Properties

<table><thead><tr><th>

Property


</th><th>

Modifiers


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

content


</td><td>


</td><td>



</td><td>


</td></tr>
<tr><td>

meta?


</td><td>


</td><td>

Record&lt;string, unknown&gt;


</td><td>

_(Optional)_


</td></tr>
<tr><td>

name?


</td><td>


</td><td>

string


</td><td>

_(Optional)_


</td></tr>
<tr><td>

role


</td><td>


</td><td>

NormRole


</td><td>


</td></tr>
</tbody></table>


---



## NormMessage.content property

**Signature:**

```typescript
content: NormContent[];
```

---



## NormMessage.meta property

**Signature:**

```typescript
meta?: Record<string, unknown>;
```

---



## NormMessage.name property

**Signature:**

```typescript
name?: string;
```

---



## NormMessage.role property

**Signature:**

```typescript
role: NormRole;
```

---



## NormRole type

Normalized message role types across LLM providers

**Signature:**

```typescript
export declare type NormRole = 'system' | 'user' | 'assistant' | 'tool' | 'function';
```

---



## llmPlugin variable

LLM Plugin for Stampdown Normalizes provider payloads using `@ai-sdk` and provides role-aware helpers

**Signature:**

```typescript
llmPlugin: StampdownPlugin
```

## Example


```typescript
import { Stampdown } from '@stampdwn/core';
import { llmPlugin } from '@stampdwn/llm';

const stampdown = new Stampdown({
  plugins: [llmPlugin]
});

const template = `
{{#withChat raw=chat}}
{{#eachMessage}}
  {{#ifUser}}User: {{firstText this}}{{/ifUser}}
  {{#ifAssistant}}Assistant: {{firstText this}}{{/ifAssistant}}
{{/eachMessage}}
{{/withChat}}
`;
```


---



## NormContent type

Normalized content types for message content

**Signature:**

```typescript
export declare type NormContent = {
    type: 'text';
    text: string;
} | {
    type: 'image';
    url?: string;
    data?: string;
    mime?: string;
    alt?: string;
} | {
    type: 'tool_result';
    toolName?: string;
    callId?: string;
    result: unknown;
};
```