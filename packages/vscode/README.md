# @stampdwn/vscode

VS Code extension providing syntax highlighting and language support for Stampdown templates.

## Installation

Install from the VS Code Marketplace or build from source.

### From Marketplace
Search for "Stampdown" in the VS Code Extensions view and install.

### From Source
```bash
# Clone and build
git clone https://github.com/your-org/stampdown
cd stampdown/packages/vscode
npm install
npm run build

# Install extension
code --install-extension stampdown-0.1.0.vsix
```

Or use the provided installer from the project root:
```bash
./install-extension.sh
```

## Features

### Syntax Highlighting

Complete syntax highlighting support for all Stampdown template features:

- **Expressions**: `{{name}}`, `{{user.email}}`
- **Block Helpers**: `{{#if premium}}...{{/if}}`
- **Self-Closing Helpers**: `{{#uppercase name/}}`
- **Partials**: `{{> header}}`, `{{> (dynamic) }}`
- **Partial Blocks**: `{{#> layout}}...{{/layout}}`
- **Inline Partials**: `{{#*inline "name"}}...{{/inline}}`
- **Comments**: `{{!-- comment --}}`
- **Variable Assignment**: `{{ x = 5 }}`, `{{ name = \`Hello \${user}\` }}`
- **Advanced Expressions**: `{{#if age > 18}}`, `{{#unless premium && verified}}`

### Language Configuration

Automatic language detection and configuration:

- **File Extensions**: `.sdt` files automatically use Stampdown syntax
- **Bracket Matching**: Proper matching for `{{...}}` expressions
- **Comment Toggle**: Use `Ctrl+/` (Cmd+/) to toggle `{{!-- --}}` comments
- **Auto-Indentation**: Smart indentation within block helpers

## Syntax Highlighting

**Expressions:**
```stampdown
{{name}}
{{user.email}}
{{product.price}}
```

**Block Helpers:**
```stampdown
{{#if condition}}
  Content when true
{{else}}
  Content when false
{{/if}}

{{#each items}}
  - {{this}} (index: {{@index}})
{{/each}}

{{#with user}}
  Name: {{name}}
{{/with}}
```

**Self-Closing Blocks:**
```stampdown
{{#uppercase name/}}
{{#lowercase email/}}
{{#capitalize title/}}
{{#add price tax/}}
{{#multiply quantity price/}}
```

**Partials:**
```stampdown
{{>header}}
{{>components/button}}
```

**Comments:**
```stampdown
{{! Single-line comment }}

{{!--
  Multi-line
  block comment
--}}
```

## Customizing Colors

Customize syntax colors in your VS Code `settings.json`:

```json
{
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "scope": "entity.name.function.handlebars",
        "settings": {
          "foreground": "#C586C0",
          "fontStyle": "bold"
        }
      },
      {
        "scope": "variable.other.handlebars",
        "settings": {
          "foreground": "#9CDCFE"
        }
      },
      {
        "scope": "variable.language.handlebars",
        "settings": {
          "foreground": "#4FC1FF",
          "fontStyle": "bold"
        }
      },
      {
        "scope": "keyword.control.handlebars",
        "settings": {
          "foreground": "#C586C0",
          "fontStyle": "bold"
        }
      },
      {
        "scope": "constant.numeric.handlebars",
        "settings": {
          "foreground": "#B5CEA8"
        }
      },
      {
        "scope": "string.quoted.double.handlebars, string.quoted.single.handlebars",
        "settings": {
          "foreground": "#CE9178"
        }
      },
      {
        "scope": "comment.block.handlebars",
        "settings": {
          "foreground": "#6A9955",
          "fontStyle": "italic"
        }
      }
    ]
  }
}
```

**Available Scopes:**

The grammar uses standard Handlebars scope names for better theme compatibility:

- `entity.name.function.handlebars` - Helper and partial names
- `keyword.control.handlebars` - Block operators (#, /, >, #>, #*)
- `keyword.operator.self-closing.handlebars` - Self-closing slash (/)
- `keyword.operator.assignment.handlebars` - Hash parameter assignment (=)
- `support.constant.handlebars` - Delimiters ({{ }})
- `variable.other.handlebars` - Regular variables
- `variable.parameter.handlebars` - Helper parameters and hash keys
- `variable.language.handlebars` - Built-in variables (@index, @first, @last, @key, @root, @partial-block, this)
- `string.quoted.double.handlebars` - Double-quoted strings
- `string.quoted.single.handlebars` - Single-quoted strings
- `constant.numeric.handlebars` - Numbers
- `constant.language.boolean.handlebars` - Booleans (true, false)
- `constant.language.null.handlebars` - Null values (null, undefined)
- `constant.character.escape.handlebars` - Escape sequences in strings
- `comment.block.handlebars` - Comments

**Inspect Token Scopes:**
1. Open Command Palette (Cmd/Ctrl + Shift + P)
2. Run "Developer: Inspect Editor Tokens and Scopes"
3. Click any token to see its scope name

## Advanced Partial Support

The extension provides full syntax highlighting for Handlebars-compatible advanced partials:

### Dynamic Partials
```stampdown
{{> (partialName) }}
{{> (getPartial type) }}
```

### Partial Contexts
```stampdown
{{> userCard user }}
{{> profile this }}
```

### Hash Parameters
```stampdown
{{> button class="primary" label="Submit" }}
{{> card title=cardTitle id=cardId }}
```

### Partial Blocks
```stampdown
{{#> layout}}
  <h1>Content</h1>
{{/layout}}

{{#> wrapper class="container"}}
  Wrapped content
{{/wrapper}}
```

### Inline Partials
```stampdown
{{#*inline "greeting"}}
  Hello, {{name}}!
{{/inline}}

{{> greeting }}
```

### @partial-block Variable
```stampdown
{{> @partial-block }}
```

### Extended Identifiers
```stampdown
{{> user-card }}
{{> user.profile }}
{{> path/to/partial }}
{{> @partial-block }}
```

### Quoted Partial Names
```stampdown
{{> "partial-with-dashes" }}
{{> 'another-partial' }}
```

## Self-Closing Block Syntax

The extension fully supports self-closing syntax for concise helper usage:

### Basic Self-Closing Blocks
```stampdown
{{#uppercase name/}}
{{#lowercase email/}}
{{#capitalize title/}}
```

### Multiple Arguments
```stampdown
{{#add x y/}}
{{#multiply quantity price/}}
{{#divide total count/}}
```

### Nested Properties
```stampdown
{{#uppercase user.profile.name/}}
{{#add order.subtotal order.tax/}}
```

### Inline Usage
```stampdown
Welcome {{#capitalize firstName/}} {{#uppercase lastName/}}!
Total: ${{#add price tax/}} (with {{#multiply discount 100/}}% off)
```

### Argument Types

**Variables:**
```stampdown
{{#uppercase name/}}
{{#capitalize user.firstName/}}
```

**Numbers:**
```stampdown
{{#add 100 50/}}
{{#multiply price 1.15/}}
```

**Strings:**
```stampdown
{{#repeat "Hello" 3/}}
{{#concat 'Hello' 'World'/}}
```

## Grammar Implementation

### Partial Patterns

The extension includes sophisticated pattern matching for all partial features:

1. **Dynamic Partials**: Matches `{{> (expression) }}` with parentheses highlighting
2. **Partial Content**: Handles hash parameters (`key=value`), contexts, and quoted names
3. **Partial Blocks**: Matches `{{#> name}}...{{/name}}` with backreference validation
4. **Inline Partials**: Matches `{{#*inline "name"}}...{{/inline}}` with quoted names

### Self-Closing Pattern

```regex
({{)(#)([a-zA-Z_][a-zA-Z0-9_-]*)(\s+)([^}/]*?)(\s*)(/)(}})
```

**Components:**
1. `({{)` - Opening delimiter
2. `(#)` - Block operator
3. `([a-zA-Z_][a-zA-Z0-9_-]*)` - Helper name
4. `(\s+)` - Required space
5. `([^}/]*?)` - Arguments (non-greedy)
6. `(\s*)` - Optional trailing space
7. `(/)` - Self-closing slash
8. `(}})` - Closing delimiter

### Scope Hierarchy

| Element | Scope | Color |
|---------|-------|-------|
| `{{` / `}}` | `punctuation.definition` | Gray |
| `#` / `/` | `keyword.operator` | Purple |
| Helper name | `entity.name.function` | Yellow |
| Variables | `variable.parameter` | Blue |
| Partial name | `entity.name.function.partial` | Yellow |
| `@special` | `variable.language.special` | Bright Blue |
| Strings | `string.quoted` | Orange |
| Numbers | `constant.numeric` | Green |

## Testing

Test files are provided to verify syntax highlighting:
- `test-self-closing.sdt` - Self-closing block examples
- `test-advanced-partials.sdt` - Advanced partial features

### How to Test

1. Open the test files in VS Code
2. Verify proper syntax highlighting for all features
3. Use **Developer: Inspect Editor Tokens and Scopes** (Cmd/Ctrl+Shift+P) to check scopes
4. Ensure all partial types and self-closing blocks are correctly colored

## Grammar Development Notes

### Pattern Matching Approach

The Stampdown TextMate grammar uses **single `match` patterns** for self-closing helpers instead of `begin/end` patterns to ensure accurate scope assignment.

**Self-Closing Helper Pattern:**
```json
{
  "match": "(\\{\\{)(~?\\#)([a-zA-Z_][a-zA-Z0-9_-]*)\\s+([^}]*?)\\s*(/)(~?\\}\\})"
}
```

This requires:
1. `{{` - Opening delimiter
2. `~?#` - Optional whitespace control + hash
3. Helper name
4. At least one space
5. Arguments (non-greedy)
6. **Required** `/` - Self-closing slash
7. `~?}}` - Closing delimiter

**Pattern Order Priority:**
1. Comments (highest priority)
2. Inline partials (`{{#*inline}}`)
3. Partial blocks (`{{#> layout}}`)
4. End blocks (`{{/helper}}`)
5. Else tokens (`{{else}}`)
6. Self-closing helpers (`{{#helper args/}}`)
7. Block helpers (`{{#helper args}}`)
8. Partials, expressions, markdown (lowest priority)

### Markdown Integration

Custom markdown pattern prevents greedy matching while preserving formatting:

```json
"markdown": {
  "patterns": [{
    "name": "meta.embedded.block.markdown",
    "begin": "^(?!\\s*\\{\\{)",  // Don't match lines starting with {{
    "end": "(?=\\{\\{)|$",       // Stop at {{ or end of line
    "patterns": [
      {"include": "text.html.markdown#fenced_code_block"},
      {"include": "text.html.markdown#heading"},
      {"include": "text.html.markdown#inline"}
      // ... specific features only
    ]
  }]
}
```

This ensures:
- ✅ Stampdown expressions are matched first
- ✅ Markdown formatting still works (bold, italic, etc.)
- ✅ Nested expressions in block helpers are properly highlighted
- ✅ No greedy paragraph matching overrides Stampdown scopes

### Key Lessons

1. **Use `match` for complete patterns** - When the entire pattern must be present
2. **Pattern order matters** - More specific patterns before general ones
3. **Beware of greedy grammars** - External grammars (like markdown) can override with greedy matching
4. **Use negative lookahead** - Prevent patterns from matching where other patterns should take precedence
5. **Include specific features** - Don't include entire grammars, include only needed features
6. **Verify with scope inspector** - Use "Developer: Inspect Editor Tokens and Scopes" to verify

## Configuration

### VS Code Settings

Configure Stampdown language settings in your VS Code `settings.json`:

```json
{
  "[stampdown]": {
    "editor.tabSize": 2,
    "editor.insertSpaces": true,
    "editor.wordWrap": "on"
  },
  "files.associations": {
    "*.sdt": "stampdown",
    "*.stampdown": "stampdown"
  }
}
```

### File Type Associations

Associate additional file extensions with Stampdown:

```json
{
  "files.associations": {
    "*.tmpl": "stampdown",
    "*.template": "stampdown",
    "*.hbs": "stampdown"
  }
}
```

## Development

### Building the Extension

```bash
npm install
npm run build
```

### Packaging

```bash
npm run package
# Creates stampdown-VERSION.vsix
```

### Installing Development Build

```bash
code --install-extension stampdown-VERSION.vsix
```

### Testing

Test the grammar with various template patterns:

```bash
# Open test file
code test-grammar.sdt

# Verify syntax highlighting for all patterns
```

## License

MIT

````
