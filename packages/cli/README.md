# Stampdown CLI

Command-line interface for Stampdown template compilation and processing.

## Installation

### Global Installation

```bash
npm install -g @stampdwn/cli
```

### Local Installation

```bash
npm install @stampdwn/cli
```

## Usage

### Basic Commands

```bash
# Compile templates to precompiled JavaScript
stampdown compile templates/*.sdt --output dist/

# Process templates with data
stampdown render template.sdt --data data.json

# Watch for changes and recompile
stampdown compile templates/*.sdt --output dist/ --watch
```

### Template Compilation

Compile `.sdt` (Stampdown Template) files to optimized JavaScript:

```bash
# Compile all .sdt files in src/ to dist/
stampdown compile "src/**/*.sdt" --output dist/

# Specify output format
stampdown compile templates/ --output dist/ --format esm
stampdown compile templates/ --output dist/ --format cjs
stampdown compile templates/ --output dist/ --format json

# Enable source maps
stampdown compile templates/ --output dist/ --source-map

# Tree-shake unused helpers
stampdown compile templates/ --output dist/ --known-helpers if,each,with
```

### Template Rendering

Render templates directly from the command line:

```bash
# Render with JSON data file
stampdown render template.sdt --data data.json

# Render with inline JSON
stampdown render template.sdt --data '{"name": "World"}'

# Output to file
stampdown render template.sdt --data data.json --output result.html

# Use custom helpers
stampdown render template.sdt --data data.json --helpers ./helpers.js
```

### Batch Processing

Process multiple templates with different data:

```bash
# Process all .sdt files with corresponding .json data files
stampdown batch templates/ --data-dir data/ --output dist/

# Example file structure:
# templates/
#   ├── page.sdt
#   ├── email.sdt
# data/
#   ├── page.json
#   ├── email.json
```

## Command Reference

### `compile`

Compile Stampdown templates to JavaScript.

```bash
stampdown compile [input] [options]
```

**Arguments:**
- `input` - Input file pattern (glob supported)

**Options:**
- `-o, --output <dir>` - Output directory
- `-f, --format <format>` - Output format: `esm`, `cjs`, `json` (default: `esm`)
- `-k, --known-helpers <list>` - Comma-separated list of known helpers for tree-shaking
- `-s, --strict` - Error on unknown helpers
- `-m, --source-map` - Generate source maps
- `-w, --watch` - Watch for changes and recompile
- `--template-id <id>` - Template identifier for generated code

**Examples:**

```bash
# Basic compilation
stampdown compile "templates/*.sdt" --output dist/

# ESM format with source maps
stampdown compile templates/ -o dist/ -f esm --source-map

# Optimize for known helpers
stampdown compile templates/ -o dist/ -k "if,each,with,uppercase"

# Strict mode (fails on unknown helpers)
stampdown compile templates/ -o dist/ --strict
```

### `render`

Render templates with data.

```bash
stampdown render <template> [options]
```

**Arguments:**
- `template` - Path to template file

**Options:**
- `-d, --data <data>` - JSON data (file path or inline JSON)
- `-o, --output <file>` - Output file (default: stdout)
- `-h, --helpers <file>` - Custom helpers module
- `-p, --partials <dir>` - Partials directory
- `--plugins <list>` - Comma-separated list of plugin names

**Examples:**

```bash
# Render with data file
stampdown render template.sdt --data data.json

# Render with inline data
stampdown render template.sdt -d '{"title": "My Page", "items": [1,2,3]}'

# Use custom helpers
stampdown render template.sdt --data data.json --helpers ./my-helpers.js

# Include partials
stampdown render template.sdt --data data.json --partials ./partials/
```

### `batch`

Batch process multiple templates.

```bash
stampdown batch <templates-dir> [options]
```

**Arguments:**
- `templates-dir` - Directory containing template files

**Options:**
- `-d, --data-dir <dir>` - Directory containing JSON data files
- `-o, --output <dir>` - Output directory
- `-h, --helpers <file>` - Custom helpers module
- `-p, --partials <dir>` - Partials directory
- `--ext <ext>` - Template file extension (default: `.sdt`)

### `init`

Initialize a new Stampdown project.

```bash
stampdown init [project-name]
```

Creates a new project with:
- Sample templates
- Configuration file (`stampdown.config.js`)
- Package.json with scripts
- Basic folder structure

## Configuration File

Create `stampdown.config.js` for project configuration:

```javascript
module.exports = {
  input: 'templates/**/*.sdt',
  output: 'dist/',
  format: 'esm',
  knownHelpers: ['if', 'each', 'with', 'unless'],
  strict: false,
  sourceMap: true,
  plugins: ['@stampdwn/llm'],
  helpers: './helpers.js',
  partials: './partials/',
  watch: process.env.NODE_ENV === 'development'
};
```

Then run:

```bash
stampdown compile  # Uses config file automatically
```

## Custom Helpers Module

Create reusable helpers in a separate file:

```javascript
// helpers.js
module.exports = {
  formatDate: (context, options, date, format = 'YYYY-MM-DD') => {
    // Custom date formatting logic
    return new Date(date).toLocaleDateString();
  },

  calculateTax: (context, options, amount, rate = 0.1) => {
    return (Number(amount) * Number(rate)).toFixed(2);
  }
};
```

Use with:

```bash
stampdown render template.sdt --data data.json --helpers ./helpers.js
```

## Integration Examples

### Build Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "build:templates": "stampdown compile templates/ --output dist/",
    "dev:templates": "stampdown compile templates/ --output dist/ --watch",
    "render:email": "stampdown render email.sdt --data user.json --output email.html"
  }
}
```

### GitHub Actions

```yaml
name: Build Templates
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @stampdwn/cli
      - run: stampdown compile templates/ --output dist/
      - uses: actions/upload-artifact@v3
        with:
          name: compiled-templates
          path: dist/
```

### Webpack Integration

```javascript
// webpack.config.js
const { exec } = require('child_process');

module.exports = {
  // ... other config
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.beforeCompile.tap('StampdownPlugin', () => {
          exec('stampdown compile templates/ --output src/generated/');
        });
      }
    }
  ]
};
```

## Related Packages

- [`@stampdwn/core`](https://www.npmjs.com/package/@stampdwn/core) - Core templating engine
- [`@stampdwn/llm`](https://www.npmjs.com/package/@stampdwn/llm) - LLM prompt templating plugin

## License

MIT