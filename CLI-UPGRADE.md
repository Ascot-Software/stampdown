# CLI Upgrade Plan: stampdown-precompile → sdt-cli

## Overview

Upgrading the Stampdown CLI to support two modes of operation, similar to `hbs-cli`:

1. **Render Mode** (default) - Process templates on the fly with data, partials, and helpers
2. **Precompile Mode** - Compile templates to optimized JavaScript (existing functionality)

## Changes Made

### ✅ Completed

1. **Renamed CLI executable**: `stampdown-precompile` → `sdt-cli`
   - Renamed: `bin/stampdown-precompile.js` → `bin/sdt-cli.js`
   - Updated: `package.json` bin entry

2. **Created new CLI structure** in `src/cli.ts`:
   - Dual-mode interface (render + precompile)
   - Comprehensive help documentation
   - Option parsing for both modes
   - Command-line argument handling with `--` separator support

3. **Created test files** in `cli-test/`:
   - `data.json` - Sample data for testing
   - `template.sdt` - Sample template for testing

### 🚧 To Be Implemented

The following methods need to be added to `src/cli.ts` (approximately 600 lines):

#### Utility Methods
- `findFiles(pattern: string): string[]` - Glob pattern file matching
- `matchPattern(name: string, pattern: string): boolean` - Filename pattern matching

#### Data Loading
- `loadData(dataSource: string): Record<string, unknown>` - Load JSON/YAML data files
- `readStdin(): Promise<string>` - Read data from stdin

#### Template Components
- `loadPartials(pattern: string): Record<string, string>` - Load partial templates from files
- `loadHelpers(pattern: string): Record<string, Function>` - Dynamically load helper functions from JS/TS files

#### Execution Modes
- `runRenderMode(): Promise<void>` - **NEW**: Execute template rendering with data
  - Load data from files or stdin
  - Load partials and helpers
  - Process templates
  - Output to files or stdout

- `runPrecompileMode(): void` - Port existing precompilation logic
  - Find template files
  - Precompile templates
  - Generate output (ESM, CJS, or JSON)
  - Watch mode support

#### Precompile Helper Methods
- `generateTemplateId(filePath: string, inputPattern: string): string`
- `precompileFile(precompiler: Precompiler, filePath: string, templateId: string)`
- `generatePrecompileOutput(templates: Array, format: string): string`
- `sanitizeVarName(id: string): string`

## New CLI Usage

### Render Mode (Default)

```bash
# Basic rendering
sdt-cli -D data.json template.sdt

# With partials and helpers
sdt-cli -P ./partials/*.sdt -H ./helpers/*.js -D data.json template.sdt

# Output to directory with custom extension
sdt-cli -D data.json -o ./dist -e md template.sdt

# Output to stdout
sdt-cli -D data.json -s template.sdt

# Read data from stdin
echo '{"name": "Alice"}' | sdt-cli -i template.sdt

# Multiple data files (merged)
sdt-cli -D data1.json -D data2.json template.sdt

# Inline JSON data
sdt-cli -D '{"name":"Alice"}' template.sdt
```

### Precompile Mode

```bash
# Basic precompilation
sdt-cli --precompile --input "templates/**/*.sdt" -o dist

# With known helpers for tree-shaking
sdt-cli --precompile --input "*.sdt" -k "uppercase,lowercase,if,each"

# Generate CommonJS modules
sdt-cli --precompile --input "templates/*.sdt" -f cjs -o build

# Watch mode
sdt-cli --precompile --input "templates/**/*.sdt" -w

# Strict mode with source maps
sdt-cli --precompile --input "src/**/*.sdt" --strict -m --verbose
```

## Options

### Common Options
- `-h, --help` - Show help message
- `-v, --version` - Show version
- `--verbose` - Verbose output

### Render Mode Options
- `-o, --output <directory>` - Output directory (default: cwd)
- `-e, --extension <ext>` - Output file extension (default: html)
- `-s, --stdout` - Output to stdout instead of files
- `-i, --stdin` - Read data from stdin
- `-P, --partial <glob>` - Register partials (repeatable, supports globs)
- `-H, --helper <glob>` - Register helpers (repeatable, supports globs)
- `-D, --data <glob|json>` - Load data files or inline JSON (repeatable)

### Precompile Mode Options
- `--precompile` - Enable precompile mode
- `--input <glob>` - Input file pattern (required)
- `-k, --known-helpers <list>` - Known helpers for tree-shaking
- `--strict` - Error on unknown helpers
- `-f, --format <format>` - Output format: esm, cjs, json (default: esm)
- `-w, --watch` - Watch mode
- `-m, --source-map` - Generate source maps

## Implementation Notes

### Helper Loading

Helpers can be loaded from JS/TS files in multiple formats:

```javascript
// Single function export (uses filename as helper name)
module.exports = function(context, options, ...args) { /*...*/ };

// Default export
export default function(context, options, ...args) { /*...*/ };

// Named exports (registers all exported functions)
export function uppercase(context, options, text) { /*...*/ }
export function lowercase(context, options, text) { /*...*/ }
```

### Partial Loading

Partials are loaded from `.sdt` files. The filename (without extension) becomes the partial name:

```
partials/
  header.sdt    → {{> header}}
  footer.sdt    → {{> footer}}
  nav.sdt       → {{> nav}}
```

### Data Loading

Data can be loaded from:
- JSON files (`.json`)
- YAML files (`.yaml`, `.yml`) - *to be implemented*
- Inline JSON strings
- Stdin (JSON format)

Multiple data sources are merged together, with later sources overriding earlier ones.

### Glob Pattern Support

All file patterns support glob syntax:
- `*` - Match any characters except `/`
- `**` - Match any characters including `/` (recursive)
- `?` - Match any single character

Examples:
- `templates/*.sdt` - All `.sdt` files in templates/
- `**/*.sdt` - All `.sdt` files recursively
- `partials/nav*.sdt` - nav-related partials

## Testing

Test the CLI with the provided test files:

```bash
# After implementation is complete:

# Test render mode
npm run build
./bin/sdt-cli.js -D cli-test/data.json cli-test/template.sdt

# Test with stdout
./bin/sdt-cli.js -D cli-test/data.json -s cli-test/template.sdt

# Test precompile mode (existing functionality)
./bin/sdt-cli.js --precompile --input "cli-test/*.sdt" -o cli-test/compiled
```

## Migration from stampdown-precompile

The old `stampdown-precompile` command is now `sdt-cli --precompile`:

```bash
# Old
stampdown-precompile -i "templates/**/*.sdt" -o dist -k "if,each"

# New
sdt-cli --precompile --input "templates/**/*.sdt" -o dist -k "if,each"
```

All existing precompile options remain the same, just add `--precompile` flag.

## Next Steps

1. Implement all the methods listed in "To Be Implemented"
2. Port the existing precompile logic from the old CLI
3. Add comprehensive error handling
4. Test with real-world templates and data
5. Update main README.md with new CLI usage
6. Consider adding YAML support for data files
7. Add tests for CLI functionality

## File Structure

```
stampdown/
├── bin/
│   └── sdt-cli.js              # Renamed CLI entry point
├── src/
│   └── cli.ts                  # Main CLI implementation (in progress)
├── cli-test/                   # Test files for CLI
│   ├── data.json               # Sample test data
│   └── template.sdt            # Sample test template
└── CLI-UPGRADE.md              # This file
```
