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

@stampdwn/core


</td><td>


</td></tr>
</tbody></table>


---



## core package

## Classes

<table><thead><tr><th>

Class


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

ExpressionEvaluator


</td><td>

ExpressionEvaluator class for safely evaluating template expressions


</td></tr>
<tr><td>

HelperRegistry


</td><td>

Registry for managing template helpers


</td></tr>
<tr><td>

Parser


</td><td>

Parser class for converting template strings to AST


</td></tr>
<tr><td>

Precompiler


</td><td>

Precompiler class for converting templates to optimized functions


</td></tr>
<tr><td>

Renderer


</td><td>

Renderer class for converting AST to rendered output


</td></tr>
<tr><td>

Stampdown


</td><td>

Stampdown class Provides methods to render templates with context, register helpers and partials, and manage pre/post processing hooks.


</td></tr>
<tr><td>

TemplateLoader


</td><td>

Template loader for .sdt files


</td></tr>
</tbody></table>

## Functions

<table><thead><tr><th>

Function


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

createPlugin(config)


</td><td>

Helper function to create a plugin with metadata


</td></tr>
<tr><td>

definePlugin(name, plugin)


</td><td>

Helper function to create a plugin


</td></tr>
</tbody></table>

## Interfaces

<table><thead><tr><th>

Interface


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

CompiledTemplate


</td><td>

Compiled template that can be rendered multiple times


</td></tr>
<tr><td>

HelperOptions


</td><td>

Options passed to helper functions


</td></tr>
<tr><td>

PluginAPI


</td><td>

Plugin API provided to plugins for extending Stampdown


</td></tr>
<tr><td>

PrecompiledTemplate


</td><td>

Precompiled template result


</td></tr>
<tr><td>

PrecompileOptions


</td><td>

Options for precompiling templates


</td></tr>
<tr><td>

StampdownOptions


</td><td>

Configuration options for Stampdown instance


</td></tr>
<tr><td>

StampdownPlugin


</td><td>

Plugin interface that all Stampdown plugins must implement


</td></tr>
</tbody></table>

## Variables

<table><thead><tr><th>

Variable


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

arrayHelpersPlugin


</td><td>

Array helpers plugin Adds helpers for join, length, slice, reverse, and sort operations


</td></tr>
<tr><td>

dateHelpersPlugin


</td><td>

Date formatting plugin Adds helpers for formatDate, now, and timeAgo operations


</td></tr>
<tr><td>

debugPlugin


</td><td>

Debug plugin Adds helpers for json, typeof, keys, and values operations


</td></tr>
<tr><td>

mathHelpersPlugin


</td><td>

Math helpers plugin Adds helpers for add, subtract, multiply, divide, mod, round, min, and max operations


</td></tr>
<tr><td>

stringHelpersPlugin


</td><td>

String manipulation plugin Adds helpers for uppercase, lowercase, capitalize, trim, repeat, and truncate operations


</td></tr>
</tbody></table>

## Type Aliases

<table><thead><tr><th>

Type Alias


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

Context


</td><td>

Context object containing variables accessible in templates


</td></tr>
<tr><td>

Helper


</td><td>

Helper function type


</td></tr>
<tr><td>

Hook


</td><td>

Hook function type for pre/post processing


</td></tr>
<tr><td>

Partial\_2


</td><td>

Partial template string


</td></tr>
<tr><td>

PluginConfig


</td><td>

Plugin configuration when registering Can be either a StampdownPlugin directly or an object with plugin and options


</td></tr>
<tr><td>

PluginOptions


</td><td>

Options that can be passed to plugins


</td></tr>
<tr><td>

PrecompiledTemplateFn


</td><td>

Precompiled template function type


</td></tr>
</tbody></table>


---



## ExpressionEvaluator class

ExpressionEvaluator class for safely evaluating template expressions

**Signature:**

```typescript
export declare class ExpressionEvaluator 
```

## Methods

<table><thead><tr><th>

Method


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

evaluate(expression, context)


</td><td>


</td><td>

Evaluate an expression in the given context Supports: - Dot notation for nested property access (e.g., "user.name") - Literal values: numbers, strings (quoted), booleans, null, undefined - Comparison operators: ===, !==, ==, !=, &gt;<!-- -->, &lt;<!-- -->, &gt;<!-- -->=, &lt;<!-- -->= - Logical operators: &amp;&amp;, \|\|, !


</td></tr>
</tbody></table>


---



## ExpressionEvaluator.evaluate() method

Evaluate an expression in the given context Supports: - Dot notation for nested property access (e.g., "user.name") - Literal values: numbers, strings (quoted), booleans, null, undefined - Comparison operators: ===, !==, ==, !=, &gt;<!-- -->, &lt;<!-- -->, &gt;<!-- -->=, &lt;<!-- -->= - Logical operators: &amp;&amp;, \|\|, !

**Signature:**

```typescript
evaluate(expression: string, context: Context): unknown;
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

expression


</td><td>

string


</td><td>

The expression to evaluate


</td></tr>
<tr><td>

context


</td><td>

Context


</td><td>

The context containing variables


</td></tr>
</tbody></table>

**Returns:**

unknown

The evaluated result or undefined if not found


---



## Context type

Context object containing variables accessible in templates

**Signature:**

```typescript
export declare type Context = Record<string, unknown>;
```

---



## HelperRegistry class

Registry for managing template helpers

**Signature:**

```typescript
export declare class HelperRegistry 
```

## Constructors

<table><thead><tr><th>

Constructor


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

(constructor)()


</td><td>


</td><td>

Creates a new HelperRegistry instance


</td></tr>
</tbody></table>

## Methods

<table><thead><tr><th>

Method


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

get(name)


</td><td>


</td><td>

Get a helper by name


</td></tr>
<tr><td>

has(name)


</td><td>


</td><td>

Check if a helper exists


</td></tr>
<tr><td>

register(name, helper)


</td><td>


</td><td>

Register a helper function


</td></tr>
<tr><td>

unregister(name)


</td><td>


</td><td>

Unregister a helper


</td></tr>
</tbody></table>


---



## HelperRegistry.(constructor)

Creates a new HelperRegistry instance

**Signature:**

```typescript
constructor();
```

---



## HelperRegistry.get() method

Get a helper by name

**Signature:**

```typescript
get(name: string): Helper | undefined;
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

name


</td><td>

string


</td><td>

The name of the helper to retrieve


</td></tr>
</tbody></table>

**Returns:**

Helper \| undefined

The helper function or undefined if not found


---



## Helper type

Helper function type

**Signature:**

```typescript
export declare type Helper = (context: Context, options: HelperOptions, ...args: unknown[]) => string;
```
**References:** Context<!-- -->, HelperOptions


---



## HelperOptions interface

Options passed to helper functions

**Signature:**

```typescript
export declare interface HelperOptions 
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

fn?


</td><td>


</td><td>

(context: Context<!-- -->) =&gt; string


</td><td>

_(Optional)_ Function to render the main block content


</td></tr>
<tr><td>

hash?


</td><td>


</td><td>

Record&lt;string, unknown&gt;


</td><td>

_(Optional)_ Hash parameters passed to the helper


</td></tr>
<tr><td>

inverse?


</td><td>


</td><td>

(context: Context<!-- -->) =&gt; string


</td><td>

_(Optional)_ Function to render the inverse (else) block content


</td></tr>
</tbody></table>


---



## HelperOptions.fn property

Function to render the main block content

**Signature:**

```typescript
fn?: (context: Context) => string;
```

---



## HelperOptions.hash property

Hash parameters passed to the helper

**Signature:**

```typescript
hash?: Record<string, unknown>;
```

---



## HelperOptions.inverse property

Function to render the inverse (else) block content

**Signature:**

```typescript
inverse?: (context: Context) => string;
```

---



## HelperRegistry.has() method

Check if a helper exists

**Signature:**

```typescript
has(name: string): boolean;
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

name


</td><td>

string


</td><td>

The name of the helper to check


</td></tr>
</tbody></table>

**Returns:**

boolean

True if the helper exists


---



## HelperRegistry.register() method

Register a helper function

**Signature:**

```typescript
register(name: string, helper: Helper): void;
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

name


</td><td>

string


</td><td>

The name of the helper


</td></tr>
<tr><td>

helper


</td><td>

Helper


</td><td>

The helper function


</td></tr>
</tbody></table>

**Returns:**

void


---



## HelperRegistry.unregister() method

Unregister a helper

**Signature:**

```typescript
unregister(name: string): boolean;
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

name


</td><td>

string


</td><td>

The name of the helper to remove


</td></tr>
</tbody></table>

**Returns:**

boolean

True if the helper was removed, false if it didn't exist


---



## Parser class

Parser class for converting template strings to AST

**Signature:**

```typescript
export declare class Parser 
```

## Methods

<table><thead><tr><th>

Method


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

parse(template)


</td><td>


</td><td>

Parse a template string into an AST


</td></tr>
</tbody></table>


---



## Parser.parse() method

Parse a template string into an AST

**Signature:**

```typescript
parse(template: string): ASTNode;
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

template


</td><td>

string


</td><td>

The template string to parse


</td></tr>
</tbody></table>

**Returns:**

ASTNode

The root AST node


---



## Precompiler class

Precompiler class for converting templates to optimized functions

**Signature:**

```typescript
export declare class Precompiler 
```

## Constructors

<table><thead><tr><th>

Constructor


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

(constructor)()


</td><td>


</td><td>

Constructs a new instance of the `Precompiler` class


</td></tr>
</tbody></table>

## Methods

<table><thead><tr><th>

Method


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

precompile(template, options)


</td><td>


</td><td>

Precompile a template string into an optimized function


</td></tr>
</tbody></table>


---



## Precompiler.(constructor)

Constructs a new instance of the `Precompiler` class

**Signature:**

```typescript
constructor();
```

---



## Precompiler.precompile() method

Precompile a template string into an optimized function

**Signature:**

```typescript
precompile(template: string, options?: PrecompileOptions): PrecompiledTemplate;
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

template


</td><td>

string


</td><td>

The template string to precompile


</td></tr>
<tr><td>

options


</td><td>

PrecompileOptions


</td><td>

_(Optional)_ Precompilation options


</td></tr>
</tbody></table>

**Returns:**

PrecompiledTemplate

The precompiled template result


---



## PrecompileOptions interface

Options for precompiling templates

**Signature:**

```typescript
export declare interface PrecompileOptions 
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

knownHelpers?


</td><td>


</td><td>

string\[\] \| 'all'


</td><td>

_(Optional)_ List of known helper names to include in the precompiled template If not specified, all helpers encountered in the template will be assumed available Specifying known helpers allows for better tree-shaking and smaller bundles


</td></tr>
<tr><td>

sourceMap?


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ Include source map information in the precompiled output


</td></tr>
<tr><td>

strict?


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ Strict mode - throw errors for unknown helpers instead of warnings


</td></tr>
<tr><td>

templateId?


</td><td>


</td><td>

string


</td><td>

_(Optional)_ Identifier/name for this precompiled template Used when storing in the template registry


</td></tr>
</tbody></table>


---



## PrecompileOptions.knownHelpers property

List of known helper names to include in the precompiled template If not specified, all helpers encountered in the template will be assumed available Specifying known helpers allows for better tree-shaking and smaller bundles

**Signature:**

```typescript
knownHelpers?: string[] | 'all';
```

---



## PrecompileOptions.sourceMap property

Include source map information in the precompiled output

**Signature:**

```typescript
sourceMap?: boolean;
```

---



## PrecompileOptions.strict property

Strict mode - throw errors for unknown helpers instead of warnings

**Signature:**

```typescript
strict?: boolean;
```

---



## PrecompileOptions.templateId property

Identifier/name for this precompiled template Used when storing in the template registry

**Signature:**

```typescript
templateId?: string;
```

---



## PrecompiledTemplate interface

Precompiled template result

**Signature:**

```typescript
export declare interface PrecompiledTemplate 
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

code


</td><td>


</td><td>

string


</td><td>

The compiled JavaScript function as a string


</td></tr>
<tr><td>

source


</td><td>


</td><td>

string


</td><td>

Original template source


</td></tr>
<tr><td>

sourceMap?


</td><td>


</td><td>

string


</td><td>

_(Optional)_ Source map if generated


</td></tr>
<tr><td>

templateId?


</td><td>


</td><td>

string


</td><td>

_(Optional)_ Template identifier if provided


</td></tr>
<tr><td>

usedHelpers


</td><td>


</td><td>

string\[\]


</td><td>

List of helpers used in the template


</td></tr>
</tbody></table>


---



## PrecompiledTemplate.code property

The compiled JavaScript function as a string

**Signature:**

```typescript
code: string;
```

---



## PrecompiledTemplate.source property

Original template source

**Signature:**

```typescript
source: string;
```

---



## PrecompiledTemplate.sourceMap property

Source map if generated

**Signature:**

```typescript
sourceMap?: string;
```

---



## PrecompiledTemplate.templateId property

Template identifier if provided

**Signature:**

```typescript
templateId?: string;
```

---



## PrecompiledTemplate.usedHelpers property

List of helpers used in the template

**Signature:**

```typescript
usedHelpers: string[];
```

---



## Renderer class

Renderer class for converting AST to rendered output

**Signature:**

```typescript
export declare class Renderer 
```

## Constructors

<table><thead><tr><th>

Constructor


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

(constructor)(helperRegistry)


</td><td>


</td><td>

Creates a new Renderer instance


</td></tr>
</tbody></table>

## Methods

<table><thead><tr><th>

Method


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

render(ast, context, stampdown)


</td><td>


</td><td>

Render an AST to string output


</td></tr>
</tbody></table>


---



## Renderer.(constructor)

Creates a new Renderer instance

**Signature:**

```typescript
constructor(helperRegistry: HelperRegistry);
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

helperRegistry


</td><td>

HelperRegistry


</td><td>

The helper registry to use for helper resolution


</td></tr>
</tbody></table>


---



## Renderer.render() method

Render an AST to string output

**Signature:**

```typescript
render(ast: ASTNode, context: Context, stampdown: Stampdown): string;
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

ast


</td><td>

ASTNode


</td><td>

The root AST node to render


</td></tr>
<tr><td>

context


</td><td>

Context


</td><td>

The template context


</td></tr>
<tr><td>

stampdown


</td><td>

Stampdown


</td><td>

The Stampdown instance for partial resolution


</td></tr>
</tbody></table>

**Returns:**

string

The rendered output


---



## Stampdown class

Stampdown class Provides methods to render templates with context, register helpers and partials, and manage pre/post processing hooks.

**Signature:**

```typescript
export declare class Stampdown 
```

## Constructors

<table><thead><tr><th>

Constructor


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

(constructor)(options)


</td><td>


</td><td>

Creates a new Stampdown instance


</td></tr>
</tbody></table>

## Methods

<table><thead><tr><th>

Method


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

addPostProcessHook(hook)


</td><td>


</td><td>

Add a postprocessing hook


</td></tr>
<tr><td>

addPreProcessHook(hook)


</td><td>


</td><td>

Add a preprocessing hook


</td></tr>
<tr><td>

clearInlinePartials()


</td><td>


</td><td>

Clear all inline partials (typically called between renders)


</td></tr>
<tr><td>

getEvaluator()


</td><td>


</td><td>

Get the evaluator instance (for precompiled templates)


</td></tr>
<tr><td>

getHelperRegistry()


</td><td>


</td><td>

Get the helper registry (for precompiled templates)


</td></tr>
<tr><td>

getPartial(name)


</td><td>


</td><td>

Get a registered partial (checks inline partials first, then regular partials)


</td></tr>
<tr><td>

getPrecompiledTemplateIds()


</td><td>


</td><td>

Get all registered precompiled template IDs


</td></tr>
<tr><td>

getRenderer()


</td><td>


</td><td>

Get the renderer instance (for precompiled templates)


</td></tr>
<tr><td>

hasPrecompiledTemplate(templateId)


</td><td>


</td><td>

Check if a precompiled template exists


</td></tr>
<tr><td>

registerHelper(name, helper)


</td><td>


</td><td>

Register a custom helper function


</td></tr>
<tr><td>

registerInlinePartial(name, content)


</td><td>


</td><td>

Register an inline partial (block-scoped)


</td></tr>
<tr><td>

registerPartial(name, content)


</td><td>


</td><td>

Register a partial template


</td></tr>
<tr><td>

registerPrecompiledTemplate(templateId, templateFn)


</td><td>


</td><td>

Register a precompiled template


</td></tr>
<tr><td>

render(template, context)


</td><td>


</td><td>

Render a template with the given context


</td></tr>
<tr><td>

renderPrecompiled(templateId, context)


</td><td>


</td><td>

Render a precompiled template by its identifier


</td></tr>
<tr><td>

unregisterInlinePartial(name)


</td><td>


</td><td>

Unregister an inline partial


</td></tr>
</tbody></table>


---



## Stampdown.(constructor)

Creates a new Stampdown instance

**Signature:**

```typescript
constructor(options?: StampdownOptions);
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

options


</td><td>

StampdownOptions


</td><td>

_(Optional)_ Configuration options


</td></tr>
</tbody></table>


---



## StampdownOptions interface

Configuration options for Stampdown instance

**Signature:**

```typescript
export declare interface StampdownOptions 
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

helpers?


</td><td>


</td><td>

Record&lt;string, Helper\_2&gt;


</td><td>

_(Optional)_ Custom helper functions to register


</td></tr>
<tr><td>

hooks?


</td><td>


</td><td>

{ preProcess?: Hook<!-- -->\[\]; postProcess?: Hook<!-- -->\[\]; }


</td><td>

_(Optional)_ Pre and post processing hooks


</td></tr>
<tr><td>

partials?


</td><td>


</td><td>

Record&lt;string, string&gt;


</td><td>

_(Optional)_ Partial template strings to register


</td></tr>
<tr><td>

plugins?


</td><td>


</td><td>



</td><td>

_(Optional)_ Plugins to load


</td></tr>
</tbody></table>


---



## StampdownOptions.helpers property

Custom helper functions to register

**Signature:**

```typescript
helpers?: Record<string, Helper_2>;
```

---



## StampdownOptions.hooks property

Pre and post processing hooks

**Signature:**

```typescript
hooks?: {
        preProcess?: Hook[];
        postProcess?: Hook[];
    };
```

---



## Hook type

Hook function type for pre/post processing

**Signature:**

```typescript
export declare type Hook = (input: string, context: Context) => string;
```
**References:** Context


---



## StampdownOptions.partials property

Partial template strings to register

**Signature:**

```typescript
partials?: Record<string, string>;
```

---



## StampdownOptions.plugins property

Plugins to load

**Signature:**

```typescript
plugins?: PluginConfig[];
```

---



## Stampdown.addPostProcessHook() method

Add a postprocessing hook

**Signature:**

```typescript
addPostProcessHook(hook: Hook): void;
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

hook


</td><td>

Hook


</td><td>

Hook function to transform output after rendering


</td></tr>
</tbody></table>

**Returns:**

void


---



## Stampdown.addPreProcessHook() method

Add a preprocessing hook

**Signature:**

```typescript
addPreProcessHook(hook: Hook): void;
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

hook


</td><td>

Hook


</td><td>

Hook function to transform template before parsing


</td></tr>
</tbody></table>

**Returns:**

void


---



## Stampdown.clearInlinePartials() method

Clear all inline partials (typically called between renders)

**Signature:**

```typescript
clearInlinePartials(): void;
```
**Returns:**

void


---



## Stampdown.getEvaluator() method

Get the evaluator instance (for precompiled templates)

**Signature:**

```typescript
getEvaluator(): ExpressionEvaluator;
```
**Returns:**

ExpressionEvaluator

The evaluator instance


---



## Stampdown.getHelperRegistry() method

Get the helper registry (for precompiled templates)

**Signature:**

```typescript
getHelperRegistry(): HelperRegistry;
```
**Returns:**

HelperRegistry

The helper registry


---



## Stampdown.getPartial() method

Get a registered partial (checks inline partials first, then regular partials)

**Signature:**

```typescript
getPartial(name: string): string | undefined;
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

name


</td><td>

string


</td><td>

The name of the partial to retrieve


</td></tr>
</tbody></table>

**Returns:**

string \| undefined

The partial content or undefined if not found


---



## Stampdown.getPrecompiledTemplateIds() method

Get all registered precompiled template IDs

**Signature:**

```typescript
getPrecompiledTemplateIds(): string[];
```
**Returns:**

string\[\]

Array of template identifiers


---



## Stampdown.getRenderer() method

Get the renderer instance (for precompiled templates)

**Signature:**

```typescript
getRenderer(): Renderer;
```
**Returns:**

Renderer

The renderer instance


---



## Stampdown.hasPrecompiledTemplate() method

Check if a precompiled template exists

**Signature:**

```typescript
hasPrecompiledTemplate(templateId: string): boolean;
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

templateId


</td><td>

string


</td><td>

The template identifier to check


</td></tr>
</tbody></table>

**Returns:**

boolean

True if the template exists


---



## Stampdown.registerHelper() method

Register a custom helper function

**Signature:**

```typescript
registerHelper(name: string, helper: (context: Context, options: HelperOptions, ...args: unknown[]) => string): void;
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

name


</td><td>

string


</td><td>

The name of the helper


</td></tr>
<tr><td>

helper


</td><td>

(context: Context<!-- -->, options: HelperOptions<!-- -->, ...args: unknown\[\]) =&gt; string


</td><td>

The helper function


</td></tr>
</tbody></table>

**Returns:**

void


---



## Stampdown.registerInlinePartial() method

Register an inline partial (block-scoped)

**Signature:**

```typescript
registerInlinePartial(name: string, content: string): void;
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

name


</td><td>

string


</td><td>

The name of the inline partial


</td></tr>
<tr><td>

content


</td><td>

string


</td><td>

The partial content (pre-rendered)


</td></tr>
</tbody></table>

**Returns:**

void


---



## Stampdown.registerPartial() method

Register a partial template

**Signature:**

```typescript
registerPartial(name: string, content: string): void;
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

name


</td><td>

string


</td><td>

The name of the partial


</td></tr>
<tr><td>

content


</td><td>

string


</td><td>

The template content


</td></tr>
</tbody></table>

**Returns:**

void


---



## Stampdown.registerPrecompiledTemplate() method

Register a precompiled template

**Signature:**

```typescript
registerPrecompiledTemplate(templateId: string, templateFn: PrecompiledTemplateFn): void;
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

templateId


</td><td>

string


</td><td>

Identifier for the template


</td></tr>
<tr><td>

templateFn


</td><td>

PrecompiledTemplateFn


</td><td>

The compiled template function


</td></tr>
</tbody></table>

**Returns:**

void


---



## PrecompiledTemplateFn type

Precompiled template function type

**Signature:**

```typescript
export declare type PrecompiledTemplateFn = (context: Context, stampdown: Stampdown) => string;
```
**References:** Context<!-- -->, Stampdown


---



## Stampdown.render() method

Render a template with the given context

**Signature:**

```typescript
render(template: string, context?: Context): string;
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

template


</td><td>

string


</td><td>

The template string to render


</td></tr>
<tr><td>

context


</td><td>

Context


</td><td>

_(Optional)_ Variables and data accessible in the template


</td></tr>
</tbody></table>

**Returns:**

string

The rendered output


---



## Stampdown.renderPrecompiled() method

Render a precompiled template by its identifier

**Signature:**

```typescript
renderPrecompiled(templateId: string, context?: Context): string;
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

templateId


</td><td>

string


</td><td>

The identifier of the precompiled template


</td></tr>
<tr><td>

context


</td><td>

Context


</td><td>

_(Optional)_ Variables and data accessible in the template


</td></tr>
</tbody></table>

**Returns:**

string

The rendered output


---



## Stampdown.unregisterInlinePartial() method

Unregister an inline partial

**Signature:**

```typescript
unregisterInlinePartial(name: string): void;
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

name


</td><td>

string


</td><td>

The name of the inline partial to remove


</td></tr>
</tbody></table>

**Returns:**

void


---



## TemplateLoader class

Template loader for .sdt files

**Signature:**

```typescript
export declare class TemplateLoader 
```

## Constructors

<table><thead><tr><th>

Constructor


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

(constructor)(options)


</td><td>


</td><td>

Creates a new TemplateLoader instance


</td></tr>
</tbody></table>

## Methods

<table><thead><tr><th>

Method


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

clearCache(filePath)


</td><td>


</td><td>

Clear the template cache


</td></tr>
<tr><td>

compile(source)


</td><td>


</td><td>

Compile a template string


</td></tr>
<tr><td>

getStampdown()


</td><td>


</td><td>

Get the Stampdown instance


</td></tr>
<tr><td>

load(filePath, useCache)


</td><td>


</td><td>

Load and compile a template file


</td></tr>
<tr><td>

loadSync(filePath, useCache)


</td><td>


</td><td>

Load a template file synchronously (Node.js only)


</td></tr>
</tbody></table>


---



## TemplateLoader.(constructor)

Creates a new TemplateLoader instance

**Signature:**

```typescript
constructor(options?: StampdownOptions);
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

options


</td><td>

StampdownOptions


</td><td>

_(Optional)_ Configuration options for the Stampdown instance


</td></tr>
</tbody></table>


---



## TemplateLoader.clearCache() method

Clear the template cache

**Signature:**

```typescript
clearCache(filePath?: string): void;
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

filePath


</td><td>

string


</td><td>

_(Optional)_ Optional specific file to clear, or clear all if not provided


</td></tr>
</tbody></table>

**Returns:**

void


---



## TemplateLoader.compile() method

Compile a template string

**Signature:**

```typescript
compile(source: string): CompiledTemplate;
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

source


</td><td>

string


</td><td>

The template source code


</td></tr>
</tbody></table>

**Returns:**

CompiledTemplate

The compiled template


---



## CompiledTemplate interface

Compiled template that can be rendered multiple times

**Signature:**

```typescript
export declare interface CompiledTemplate 
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

source


</td><td>


</td><td>

string


</td><td>

The original template string


</td></tr>
</tbody></table>

## Methods

<table><thead><tr><th>

Method


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

render(context)


</td><td>

Render the template with the given context


</td></tr>
</tbody></table>


---



## CompiledTemplate.source property

The original template string

**Signature:**

```typescript
source: string;
```

---



## CompiledTemplate.render() method

Render the template with the given context

**Signature:**

```typescript
render(context?: Context): string;
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

context


</td><td>

Context


</td><td>

_(Optional)_ Variables and data accessible in the template


</td></tr>
</tbody></table>

**Returns:**

string

The rendered output


---



## TemplateLoader.getStampdown() method

Get the Stampdown instance

**Signature:**

```typescript
getStampdown(): Stampdown;
```
**Returns:**

Stampdown

The Stampdown instance


---



## TemplateLoader.load() method

Load and compile a template file

**Signature:**

```typescript
load(filePath: string, useCache?: boolean): Promise<CompiledTemplate>;
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

filePath


</td><td>

string


</td><td>

Path to the .sdt template file


</td></tr>
<tr><td>

useCache


</td><td>

boolean


</td><td>

_(Optional)_ Whether to use cached compiled template


</td></tr>
</tbody></table>

**Returns:**

Promise&lt;CompiledTemplate<!-- -->&gt;

The compiled template


---



## TemplateLoader.loadSync() method

Load a template file synchronously (Node.js only)

**Signature:**

```typescript
loadSync(filePath: string, useCache?: boolean): CompiledTemplate;
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

filePath


</td><td>

string


</td><td>

Path to the .sdt template file


</td></tr>
<tr><td>

useCache


</td><td>

boolean


</td><td>

_(Optional)_ Whether to use cached compiled template


</td></tr>
</tbody></table>

**Returns:**

CompiledTemplate

The compiled template


---



## createPlugin() function

Helper function to create a plugin with metadata

**Signature:**

```typescript
export declare function createPlugin(config: {
    name: string;
    version?: string;
    description?: string;
    plugin: (stampdown: Stampdown, options?: PluginOptions) => void | Promise<void>;
}): StampdownPlugin;
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

config


</td><td>

{ name: string; version?: string; description?: string; plugin: (stampdown: Stampdown<!-- -->, options?: PluginOptions<!-- -->) =&gt; void \| Promise&lt;void&gt;; }


</td><td>

Plugin configuration


</td></tr>
</tbody></table>

**Returns:**

StampdownPlugin

The plugin object


---



## PluginOptions type

Options that can be passed to plugins

**Signature:**

```typescript
export declare type PluginOptions = Record<string, unknown>;
```

---



## StampdownPlugin interface

Plugin interface that all Stampdown plugins must implement

**Signature:**

```typescript
export declare interface StampdownPlugin 
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

description?


</td><td>


</td><td>

string


</td><td>

_(Optional)_ Optional description of what the plugin does


</td></tr>
<tr><td>

name


</td><td>


</td><td>

string


</td><td>

Unique name for the plugin


</td></tr>
<tr><td>

plugin


</td><td>


</td><td>

(stampdown: Stampdown<!-- -->, options?: PluginOptions<!-- -->) =&gt; void \| Promise&lt;void&gt;


</td><td>

The main plugin function that receives the Stampdown instance


</td></tr>
<tr><td>

version?


</td><td>


</td><td>

string


</td><td>

_(Optional)_ Optional version string


</td></tr>
</tbody></table>


---



## StampdownPlugin.description property

Optional description of what the plugin does

**Signature:**

```typescript
description?: string;
```

---



## StampdownPlugin.name property

Unique name for the plugin

**Signature:**

```typescript
name: string;
```

---



## StampdownPlugin.plugin property

The main plugin function that receives the Stampdown instance

**Signature:**

```typescript
plugin: (stampdown: Stampdown, options?: PluginOptions) => void | Promise<void>;
```

---



## StampdownPlugin.version property

Optional version string

**Signature:**

```typescript
version?: string;
```

---



## definePlugin() function

Helper function to create a plugin

**Signature:**

```typescript
export declare function definePlugin(name: string, plugin: (stampdown: Stampdown, options?: PluginOptions) => void | Promise<void>): StampdownPlugin;
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

name


</td><td>

string


</td><td>

Plugin name


</td></tr>
<tr><td>

plugin


</td><td>

(stampdown: Stampdown<!-- -->, options?: PluginOptions<!-- -->) =&gt; void \| Promise&lt;void&gt;


</td><td>

Plugin function


</td></tr>
</tbody></table>

**Returns:**

StampdownPlugin

The plugin object


---



## PluginAPI interface

Plugin API provided to plugins for extending Stampdown

**Signature:**

```typescript
export declare interface PluginAPI 
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

addPostProcessHook


</td><td>


</td><td>

(hook: Hook<!-- -->) =&gt; void


</td><td>

Add a post-processing hook


</td></tr>
<tr><td>

addPreProcessHook


</td><td>


</td><td>

(hook: Hook<!-- -->) =&gt; void


</td><td>

Add a pre-processing hook


</td></tr>
<tr><td>

getVersion


</td><td>


</td><td>

() =&gt; string


</td><td>

Get the Stampdown version


</td></tr>
<tr><td>

registerHelper


</td><td>


</td><td>

(name: string, helper: Helper\_2) =&gt; void


</td><td>

Register a helper function


</td></tr>
<tr><td>

registerPartial


</td><td>


</td><td>

(name: string, content: string) =&gt; void


</td><td>

Register a partial template


</td></tr>
</tbody></table>


---



## PluginAPI.addPostProcessHook property

Add a post-processing hook

**Signature:**

```typescript
addPostProcessHook: (hook: Hook) => void;
```

---



## PluginAPI.addPreProcessHook property

Add a pre-processing hook

**Signature:**

```typescript
addPreProcessHook: (hook: Hook) => void;
```

---



## PluginAPI.getVersion property

Get the Stampdown version

**Signature:**

```typescript
getVersion: () => string;
```

---



## PluginAPI.registerHelper property

Register a helper function

**Signature:**

```typescript
registerHelper: (name: string, helper: Helper_2) => void;
```

---



## PluginAPI.registerPartial property

Register a partial template

**Signature:**

```typescript
registerPartial: (name: string, content: string) => void;
```

---



## arrayHelpersPlugin variable

Array helpers plugin Adds helpers for join, length, slice, reverse, and sort operations

**Signature:**

```typescript
arrayHelpersPlugin: StampdownPlugin
```

## Example


```typescript
import { Stampdown } from '@stampdwn/core';
import { arrayHelpersPlugin } from '@stampdwn/core/plugins/array-helpers';

const stampdown = new Stampdown({
  plugins: [arrayHelpersPlugin]
});

stampdown.render('{{#join items ", "}}{{/join}}', { items: ['A', 'B', 'C'] }); // "A, B, C"
stampdown.render('{{#length items}}{{/length}}', { items: [1, 2, 3] }); // "3"
```


---



## dateHelpersPlugin variable

Date formatting plugin Adds helpers for formatDate, now, and timeAgo operations

**Signature:**

```typescript
dateHelpersPlugin: StampdownPlugin
```

## Example


```typescript
import { Stampdown } from '@stampdwn/core';
import { dateHelpersPlugin } from '@stampdwn/core/plugins/date-helpers';

const stampdown = new Stampdown({
  plugins: [dateHelpersPlugin]
});

const date = new Date();
stampdown.render('{{#formatDate date "YYYY-MM-DD"}}{{/formatDate}}', { date });
stampdown.render('{{#now}}{{/now}}', {});
stampdown.render('{{#timeAgo date}}{{/timeAgo}}', { date });
```


---



## debugPlugin variable

Debug plugin Adds helpers for json, typeof, keys, and values operations

**Signature:**

```typescript
debugPlugin: StampdownPlugin
```

## Example


```typescript
import { Stampdown } from '@stampdwn/core';
import { debugPlugin } from '@stampdwn/core/plugins/debug';

const stampdown = new Stampdown({
  plugins: [debugPlugin]
});

const data = { name: 'Alice', age: 30 };
stampdown.render('{{#json data}}{{/json}}', { data }); // '{"name":"Alice","age":30}'
stampdown.render('{{#typeof name}}{{/typeof}}', { name: 'Alice' }); // "string"
stampdown.render('{{#keys data}}{{/keys}}', { data }); // '["name","age"]'
```


---



## mathHelpersPlugin variable

Math helpers plugin Adds helpers for add, subtract, multiply, divide, mod, round, min, and max operations

**Signature:**

```typescript
mathHelpersPlugin: StampdownPlugin
```

## Example


```typescript
import { Stampdown } from '@stampdwn/core';
import { mathHelpersPlugin } from '@stampdwn/core/plugins/math-helpers';

const stampdown = new Stampdown({
  plugins: [mathHelpersPlugin]
});

stampdown.render('{{#multiply 6 7}}{{/multiply}}', {}); // "42"
stampdown.render('{{#add 10 5 3}}{{/add}}', {}); // "18"
```


---



## stringHelpersPlugin variable

String manipulation plugin Adds helpers for uppercase, lowercase, capitalize, trim, repeat, and truncate operations

**Signature:**

```typescript
stringHelpersPlugin: StampdownPlugin
```

## Example


```typescript
import { Stampdown } from '@stampdwn/core';
import { stringHelpersPlugin } from '@stampdwn/core/plugins/string-helpers';

const stampdown = new Stampdown({
  plugins: [stringHelpersPlugin]
});

stampdown.render('{{#uppercase name}}{{/uppercase}}', { name: 'alice' }); // "ALICE"
stampdown.render('{{#capitalize title}}{{/capitalize}}', { title: 'hello world' }); // "Hello world"
```


---



## Partial\_2 type

Partial template string

**Signature:**

```typescript
declare type Partial_2 = string;
```

---



## PluginConfig type

Plugin configuration when registering Can be either a StampdownPlugin directly or an object with plugin and options

**Signature:**

```typescript
export declare type PluginConfig = StampdownPlugin | {
    plugin: StampdownPlugin;
    options?: PluginOptions;
};
```
**References:** StampdownPlugin<!-- -->, PluginOptions
