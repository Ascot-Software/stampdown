# Stampdown CLI

Command-line interface for rendering and precompiling Stampdown templates.

The package installs the `stampdown` binary.

## Installation

```bash
npm install -g @stampdwn/cli
```

## Overview

The CLI has two modes:

- Render mode is the default and processes one or more templates into Markdown output.
- Precompile mode is enabled with `--precompile` and turns templates into optimized JavaScript bundles.

## Render Mode

```bash
# Render a template with a JSON data file
stampdown -D data.json template.sdt

# Render with inline JSON data
stampdown -D '{"name":"World"}' template.sdt

# Register partials and helpers from globs
stampdown -P "partials/*.sdt" -H "helpers/*.js" -D data.json template.sdt

# Write rendered output into a directory with a custom extension
stampdown -D data.json -o dist -e html template.sdt

# Write rendered output to stdout
stampdown -D data.json -s template.sdt

# Read data from stdin
echo '{"name":"Alice"}' | stampdown -i template.sdt
```

### Render Options

- `-D, --data <glob|json>...` Parse data from a file or inline JSON
- `-P, --partial <glob>...` Register partial templates from one or more globs
- `-H, --helper <glob>...` Register helper modules from one or more globs
- `-o, --output <directory>` Output directory for rendered files
- `-e, --extension <ext>` Output extension for generated files (default: `md`)
- `-s, --stdout` Output rendered content to stdout
- `-i, --stdin` Read JSON data from stdin
- `--verbose` Enable verbose logging

## Precompile Mode

```bash
# Precompile all templates matched by a glob
stampdown --precompile --input "templates/**/*.sdt" -o dist

# Change output format
stampdown --precompile --input "templates/**/*.sdt" -o dist -f cjs
stampdown --precompile --input "templates/**/*.sdt" -o dist -f json

# Generate source maps
stampdown --precompile --input "templates/**/*.sdt" -o dist --source-map

# Restrict known helpers for tree-shaking
stampdown --precompile --input "templates/**/*.sdt" -k "if,each,with"

# Enable strict helper validation
stampdown --precompile --input "templates/**/*.sdt" --strict
```

### Precompile Options

- `--precompile` Enable precompile mode
- `--input <glob>` Input file or glob pattern
- `-o, --output <dir>` Output directory (default: `./precompiled`)
- `-f, --format <format>` Output format: `esm`, `cjs`, or `json` (default: `esm`)
- `-k, --known-helpers <list>` Comma-separated list of known helpers or `all`
- `--strict` Error on unknown helpers
- `-w, --watch` Watch matched files and rebuild on changes
- `-m, --source-map` Generate source maps
- `--verbose` Enable verbose logging

## Helper Modules

Helper files can export a single function or named helper functions. Pass them with `-H` or `--helper`.

```javascript
// helpers.js
module.exports = {
  formatDate: (_context, _options, value) => new Date(value).toISOString().slice(0, 10),
  repeat: (_context, _options, text, count = 2) => String(text).repeat(Number(count)),
};
```

```bash
stampdown -H ./helpers.js -D data.json template.sdt
```

## Output Files

- Render mode writes one output file per input template unless `--stdout` is used.
- Precompile mode writes a single bundle file into the output directory:
  - `templates.mjs` for `esm`
  - `templates.cjs` for `cjs`
  - `templates.json` for `json`

## API Docs

Full API reference: [`docs/index.md`](docs/index.md)

## Related Packages

- [`@stampdwn/core`](https://www.npmjs.com/package/@stampdwn/core) - Core templating engine
- [`@stampdwn/llm`](https://www.npmjs.com/package/@stampdwn/llm) - LLM prompt templating plugin
- [`@stampdwn/codemirror`](https://www.npmjs.com/package/@stampdwn/codemirror) - CodeMirror language support
- [`stampdown-language-support`](https://marketplace.visualstudio.com/items?itemName=AscotSoftware.stampdown-language-support) - VS Code extension

## License

MIT