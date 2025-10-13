# @stampdwn/codemirror

Stampdown language support for CodeMirror 6.

This package provides syntax highlighting for Stampdown templates in CodeMirror editors. It extends `@codemirror/lang-markdown` with custom syntax highlighting for Handlebars-like template expressions.

## Features

- Full syntax highlighting for Stampdown template features
- Extends CodeMirror's markdown language mode
- Lightweight implementation with minimal overhead
- Drop-in language support for CodeMirror 6

### Supported Syntax

- **Variables**: `{{variable}}`, `{{object.property}}`
- **Block Helpers**: `{{#if}}...{{/if}}`, `{{#each}}...{{/each}}`
- **Self-Closing Helpers**: `{{#helper arg/}}`
- **Partials**: `{{> partialName}}`
- **Comments**: `{{! comment }}`

## Installation

```bash
npm install @stampdwn/codemirror
```

### Peer Dependencies

This package requires CodeMirror 6 and the markdown language package:

```bash
npm install @codemirror/lang-markdown @codemirror/language @codemirror/view
```

## Usage

### Basic Setup

```javascript
import { EditorView, basicSetup } from 'codemirror'
import { stampdown } from '@stampdwn/codemirror'

const editor = new EditorView({
  doc: `# Welcome, {{name}}!

{{#if isPremium}}
You have premium access.
{{/if}}`,
  extensions: [
    basicSetup,
    stampdown()
  ],
  parent: document.querySelector('#editor')
})
```

### Custom Configuration

Configuration options can be passed to the underlying markdown language:

```javascript
import { stampdown } from '@stampdwn/codemirror'

const editor = new EditorView({
  extensions: [
    basicSetup,
    stampdown({
      codeLanguages: [
        { name: 'javascript', alias: ['js'] },
        { name: 'typescript', alias: ['ts'] }
      ]
    })
  ],
  parent: document.querySelector('#editor')
})
```

## Styling

The language parser adds CSS classes to Stampdown syntax elements. Style them in your CSS:

```css
/* Variables: {{name}} */
.stampdown-variable {
  color: #9cdcfe;
  font-weight: 500;
}

/* Block helpers: {{#if}}, {{/if}} */
.stampdown-block-open,
.stampdown-block-close {
  color: #c586c0;
  font-weight: bold;
}

/* Self-closing helpers: {{#helper arg/}} */
.stampdown-self-closing {
  color: #4ec9b0;
  font-weight: 600;
}

/* Partials: {{> partial}} */
.stampdown-partial {
  color: #dcdcaa;
  font-style: italic;
}

/* Comments: {{! comment }} */
.stampdown-comment {
  color: #6a9955;
  font-style: italic;
  opacity: 0.8;
}
```

### CSS Classes

| Class | Syntax Element | Example |
|-------|---------------|---------|
| `.stampdown-variable` | Variables | `{{name}}`, `{{user.email}}` |
| `.stampdown-block-open` | Opening block tags | `{{#if}}`, `{{#each}}` |
| `.stampdown-block-close` | Closing block tags | `{{/if}}`, `{{/each}}` |
| `.stampdown-self-closing` | Self-closing helpers | `{{#uppercase name/}}` |
| `.stampdown-partial` | Partials | `{{> header}}` |
| `.stampdown-comment` | Comments | `{{! comment }}` |

## API

### `stampdown(config?)`

Creates a Stampdown language support extension for CodeMirror.

**Parameters:**
- `config` (Object, optional) - Configuration options passed to the underlying markdown language support

**Returns:**
- `LanguageSupport` - A CodeMirror language support object

**Example:**
```javascript
import { stampdown } from '@stampdwn/codemirror'

const languageSupport = stampdown({
  codeLanguages: [...],
  addKeymap: true
})
```

## Examples

### Template Editor

```javascript
import { EditorView, basicSetup } from 'codemirror'
import { stampdown } from '@stampdwn/codemirror'

function createTemplateEditor(element, initialContent) {
  return new EditorView({
    doc: initialContent,
    extensions: [
      basicSetup,
      stampdown(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          // Handle template changes
          console.log(update.state.doc.toString())
        }
      })
    ],
    parent: element
  })
}

const editor = createTemplateEditor(
  document.querySelector('#template-editor'),
  '# {{title}}\n\n{{#each items}}{{this}}{{/each}}'
)
```

### React Component

```jsx
import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { stampdown } from '@stampdwn/codemirror'

function StampdownEditor({ value, onChange }) {
  const editorRef = useRef(null)
  const viewRef = useRef(null)

  useEffect(() => {
    if (!editorRef.current) return

    viewRef.current = new EditorView({
      doc: value,
      extensions: [
        basicSetup,
        stampdown(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        })
      ],
      parent: editorRef.current
    })

    return () => {
      viewRef.current?.destroy()
    }
  }, [])

  return <div ref={editorRef} />
}
```

### Vue Component

```vue
<template>
  <div ref="editor"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { stampdown } from '@stampdwn/codemirror'

const editor = ref(null)
let view = null

const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue'])

onMounted(() => {
  view = new EditorView({
    doc: props.modelValue,
    extensions: [
      basicSetup,
      stampdown(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('update:modelValue', update.state.doc.toString())
        }
      })
    ],
    parent: editor.value
  })
})

onUnmounted(() => {
  view?.destroy()
})
</script>
```

## Advanced Usage

### Custom Themes

```javascript
import { EditorView } from '@codemirror/view'
import { stampdown } from '@stampdwn/codemirror'

const customTheme = EditorView.theme({
  '.stampdown-variable': {
    color: '#ff6b6b',
    fontWeight: '600'
  },
  '.stampdown-block-open, .stampdown-block-close': {
    color: '#4ecdc4',
    fontWeight: 'bold',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: '2px 4px',
    borderRadius: '3px'
  },
  '.stampdown-comment': {
    color: '#95a5a6',
    fontStyle: 'italic',
    opacity: 0.7
  }
}, { dark: false })

const editor = new EditorView({
  extensions: [
    basicSetup,
    stampdown(),
    customTheme
  ],
  parent: document.querySelector('#editor')
})
```

### Read-Only Template Viewer

```javascript
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { stampdown } from '@stampdwn/codemirror'

const viewer = new EditorView({
  state: EditorState.create({
    doc: templateContent,
    extensions: [
      basicSetup,
      stampdown(),
      EditorState.readOnly.of(true),
      EditorView.editable.of(false)
    ]
  }),
  parent: document.querySelector('#template-viewer')
})
```

## Related Packages

This package is part of the Stampdown ecosystem:

- [@stampdwn/core](https://www.npmjs.com/package/@stampdwn/core) - Core templating engine
- [@stampdwn/cli](https://www.npmjs.com/package/@stampdwn/cli) - Command-line interface
- [@stampdwn/llm](https://www.npmjs.com/package/@stampdwn/llm) - LLM plugin for prompt templating
- [stampdown-language-support](https://marketplace.visualstudio.com/items?itemName=AscotSoftware.stampdown-language-support) - VS Code extension

## Resources

- [Documentation](https://github.com/Ascot-Software/stampdown#readme)
- [GitHub Repository](https://github.com/Ascot-Software/stampdown)
- [CodeMirror 6](https://codemirror.net/)

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/Ascot-Software/stampdown/issues).

## License

MIT © 2025 Stampdown
