# Stampdown Language Support

Syntax highlighting and language features for Stampdown template files.

**Stampdown** is a Markdown templating language with Handlebars-like expressions, combining the simplicity of Markdown with the power of template expressions.

## ✨ Features

### 🎨 Syntax Highlighting

- ✅ **Expressions** - `{{name}}`, `{{user.email}}`
- ✅ **Block Helpers** - `{{#if}}...{{else}}...{{/if}}`
- ✅ **Self-Closing Helpers** - `{{#uppercase name/}}`
- ✅ **Partials & Layouts** - `{{> header}}`, `{{#> layout}}...{{/layout}}`
- ✅ **Dynamic Partials** - `{{> (partialName) }}`
- ✅ **Comments** - `{{!-- comment --}}`
- ✅ **Variable Assignment** - `{{ x = 5 }}`, `{{ name = \`Hello \${user}\` }}`
- ✅ **Advanced Expressions** - `{{#if age > 18}}`, `{{#unless premium && verified}}`

### ⚡ Intellisense

- 🔧 **Auto-detection** - `.sdt` files automatically use Stampdown syntax
- 🎯 **Bracket Matching** - Smart matching for `{{...}}` delimiters
- 💬 **Quick Comments** - Toggle comments with `Ctrl+/` (Cmd+/)
- 📐 **Auto-Indentation** - Indentation within block helpers

---

## 📖 Quick Start

### Installation

1. Install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=AscotSoftware.stampdown-language-support)
2. Open or create a `.sdt` file
3. Start writing Stampdown templates with full syntax highlighting!

### Basic Example

Create a file `welcome.sdt`:

```stampdown
# Welcome, {{name}}!

{{#if isPremium}}
You have premium access. Enjoy these exclusive features:

{{#each features}}
- {{#capitalize this/}}
{{/each}}
{{else}}
{{> upgrade-prompt}}
{{/if}}

---
_Last login: {{#formatDate lastLogin "YYYY-MM-DD"/}}_
```

---

## 📚 Syntax Guide

### Expressions

Access and display data with simple expressions:

```stampdown
{{name}}
{{user.email}}
{{product.price}}
```

### Control Flow

Use block helpers for conditional logic and iteration:

```stampdown
{{#if isPremium}}
  ⭐ Premium Member
{{else}}
  Standard Member
{{/if}}

{{#each items}}
  {{@index}}. {{this}}
{{/each}}

{{#with user}}
  Name: {{name}}
  Email: {{email}}
{{/with}}
```

### Self-Closing Helpers

Concise syntax for helper calls that don't need content blocks:

```stampdown
{{#uppercase name/}}
{{#lowercase email/}}
{{#capitalize title/}}
{{#add price tax/}}
{{#formatDate date "YYYY-MM-DD"/}}
```

### Partials & Layouts

Reuse templates with partials:

```stampdown
{{! Simple partial }}
{{> header}}

{{! Nested partial }}
{{> components/button}}

{{! Dynamic partial }}
{{> (partialName) }}

{{! Partial with context }}
{{> userCard user}}

{{! Partial with parameters }}
{{> button text="Submit" class="primary"}}
```

Create layouts with partial blocks:

```stampdown
{{#> layout}}
  <h1>Page Content</h1>
  <p>Your content here</p>
{{/layout}}
```

### Comments

Document your templates clearly:

```stampdown
{{! Single-line comment }}

{{!--
  Multi-line comment
  for longer explanations
--}}
```

### Variable Assignment

Set and modify variables within templates:

```stampdown
{{ total = 0 }}
{{#each items}}
  {{ total = total + this.price }}
{{/each}}

Total: ${{total}}
```

### Dynamic Partials

Load partials dynamically at runtime:

```stampdown
{{> (partialName) }}
{{> (getPartial type) }}
```

### Partial Contexts & Parameters

Pass data and parameters to partials:

```stampdown
{{! With context }}
{{> userCard user }}

{{! With hash parameters }}
{{> button class="primary" label="Submit" }}
{{> card title=cardTitle id=cardId }}
```

### Layout System

Build complex page layouts with partial blocks:

```stampdown
{{#> layout}}
  <h1>Page Title</h1>
  <p>Page content goes here</p>
{{/layout}}

{{#> wrapper class="container"}}
  Wrapped content
{{/wrapper}}
```

### Inline Partials

Define partials within the same template:

```stampdown
{{#*inline "greeting"}}
  Hello, {{name}}!
{{/inline}}

{{> greeting }}
```

### Flexible Naming

Use various naming conventions for partials:

```stampdown
{{> user-card }}
{{> user.profile }}
{{> path/to/partial }}
{{> "partial-with-dashes" }}
{{> 'another-partial' }}
{{> @partial-block }}
```

## 🎨 Customization

### Customizing Syntax Colors

Personalize the look of your Stampdown templates by customizing syntax colors in your VS Code `settings.json`:

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

## 🤝 Contributing

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/Ascot-Software/stampdown/issues).

---

## 📄 License

MIT © 2025 Ascot Software

---
