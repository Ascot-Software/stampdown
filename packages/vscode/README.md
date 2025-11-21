# Stampdown Language Support

Syntax highlighting and language features for Stampdown template files.

**Stampdown** is a Markdown templating language with Handlebars-like expressions, combining the simplicity of Markdown with the power of template expressions.

## Features

### Syntax Highlighting

- **Expressions** - `{{name}}`, `{{user.email}}`
- **Block Helpers** - `{{#if}}...{{else}}...{{/if}}`
- **Self-Closing Helpers** - `{{#uppercase name/}}`
- **Partials & Layouts** - `{{> header}}`, `{{#> layout}}...{{/layout}}`
- **Dynamic Partials** - `{{> (partialName) }}`
- **Comments** - `{{!-- comment --}}`
- **Variable Assignment** - `{{ x = 5 }}`, `{{ name = \`Hello \${user}\` }}`
- **Advanced Expressions** - `{{#if age > 18}}`, `{{#unless premium && verified}}`

### Intellisense

- **Auto-detection** - `.sdt` files automatically use Stampdown syntax
- **Bracket Matching** - Smart matching for `{{...}}` delimiters
- **Quick Comments** - Toggle comments with `Ctrl+/` (Cmd+/)
- **Auto-Indentation** - Indentation within block helpers

## Installation

1. Install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=AscotSoftware.stampdown-language-support)
2. Open or create a `.sdt` file
3. Start writing Stampdown templates with full syntax highlighting!

## Customizing Syntax Colors

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

## Contributing

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/Ascot-Software/stampdown/issues).

---

## License

MIT © 2025 Ascot Software
