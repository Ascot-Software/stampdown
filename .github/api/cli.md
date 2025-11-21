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

@stampdwn/cli


</td><td>

Stampdown CLI (sdt-cli)

Command-line interface for rendering and precompiling Stampdown templates


</td></tr>
</tbody></table>


---



## cli package

Stampdown CLI (sdt-cli)

Command-line interface for rendering and precompiling Stampdown templates

## Classes

<table><thead><tr><th>

Class


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

StampdownCLI


</td><td>

Stampdown CLI class


</td></tr>
</tbody></table>

## Interfaces

<table><thead><tr><th>

Interface


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

CliOptions


</td><td>

CLI options interface


</td></tr>
</tbody></table>


---



## StampdownCLI class

Stampdown CLI class

**Signature:**

```typescript
export declare class StampdownCLI 
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

Creates a new StampdownCLI instance


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

run(args)


</td><td>


</td><td>

Run the CLI


</td></tr>
</tbody></table>


---



## StampdownCLI.(constructor)

Creates a new StampdownCLI instance

**Signature:**

```typescript
constructor(options?: CliOptions);
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

CliOptions


</td><td>

_(Optional)_ CLI options


</td></tr>
</tbody></table>


---



## CliOptions interface

CLI options interface

**Signature:**

```typescript
export declare interface CliOptions 
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

data?


</td><td>


</td><td>

string\[\]


</td><td>

_(Optional)_ Data sources for templates


</td></tr>
<tr><td>

extension?


</td><td>


</td><td>

string


</td><td>

_(Optional)_ Output file extension for rendered templates


</td></tr>
<tr><td>

format?


</td><td>


</td><td>

'esm' \| 'cjs' \| 'json'


</td><td>

_(Optional)_ Output format: esm, cjs, or json


</td></tr>
<tr><td>

help?


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ Show help information


</td></tr>
<tr><td>

helpers?


</td><td>


</td><td>

string\[\]


</td><td>

_(Optional)_ Register helper templates


</td></tr>
<tr><td>

input?


</td><td>


</td><td>

string


</td><td>

_(Optional)_ Input file or glob pattern (required in precompile mode)


</td></tr>
<tr><td>

knownHelpers?


</td><td>


</td><td>

string


</td><td>

_(Optional)_ Comma-separated list of known helpers (or "all")


</td></tr>
<tr><td>

output?


</td><td>


</td><td>

string


</td><td>

_(Optional)_ Output directory for rendered templates


</td></tr>
<tr><td>

partials?


</td><td>


</td><td>

string\[\]


</td><td>

_(Optional)_ Register partial templates


</td></tr>
<tr><td>

precompile?


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ Enable precompile mode


</td></tr>
<tr><td>

sourceMap?


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ Generate source maps


</td></tr>
<tr><td>

stdin?


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ Read data from stdin


</td></tr>
<tr><td>

stdout?


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ Output rendered templates to stdout


</td></tr>
<tr><td>

strict?


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ Strict mode - error on unknown helpers


</td></tr>
<tr><td>

templates?


</td><td>


</td><td>

string\[\]


</td><td>

_(Optional)_ Template files to process


</td></tr>
<tr><td>

verbose?


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ Enable verbose output


</td></tr>
<tr><td>

version?


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ Show version information


</td></tr>
<tr><td>

watch?


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ Watch mode - recompile on file changes


</td></tr>
</tbody></table>


---



## CliOptions.data property

Data sources for templates

**Signature:**

```typescript
data?: string[];
```

---



## CliOptions.extension property

Output file extension for rendered templates

**Signature:**

```typescript
extension?: string;
```

---



## CliOptions.format property

Output format: esm, cjs, or json

**Signature:**

```typescript
format?: 'esm' | 'cjs' | 'json';
```

---



## CliOptions.help property

Show help information

**Signature:**

```typescript
help?: boolean;
```

---



## CliOptions.helpers property

Register helper templates

**Signature:**

```typescript
helpers?: string[];
```

---



## CliOptions.input property

Input file or glob pattern (required in precompile mode)

**Signature:**

```typescript
input?: string;
```

---



## CliOptions.knownHelpers property

Comma-separated list of known helpers (or "all")

**Signature:**

```typescript
knownHelpers?: string;
```

---



## CliOptions.output property

Output directory for rendered templates

**Signature:**

```typescript
output?: string;
```

---



## CliOptions.partials property

Register partial templates

**Signature:**

```typescript
partials?: string[];
```

---



## CliOptions.precompile property

Enable precompile mode

**Signature:**

```typescript
precompile?: boolean;
```

---



## CliOptions.sourceMap property

Generate source maps

**Signature:**

```typescript
sourceMap?: boolean;
```

---



## CliOptions.stdin property

Read data from stdin

**Signature:**

```typescript
stdin?: boolean;
```

---



## CliOptions.stdout property

Output rendered templates to stdout

**Signature:**

```typescript
stdout?: boolean;
```

---



## CliOptions.strict property

Strict mode - error on unknown helpers

**Signature:**

```typescript
strict?: boolean;
```

---



## CliOptions.templates property

Template files to process

**Signature:**

```typescript
templates?: string[];
```

---



## CliOptions.verbose property

Enable verbose output

**Signature:**

```typescript
verbose?: boolean;
```

---



## CliOptions.version property

Show version information

**Signature:**

```typescript
version?: boolean;
```

---



## CliOptions.watch property

Watch mode - recompile on file changes

**Signature:**

```typescript
watch?: boolean;
```

---



## StampdownCLI.run() method

Run the CLI

**Signature:**

```typescript
run(args: string[]): Promise<void>;
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

args


</td><td>

string\[\]


</td><td>

Command-line arguments


</td></tr>
</tbody></table>

**Returns:**

Promise&lt;void&gt;
