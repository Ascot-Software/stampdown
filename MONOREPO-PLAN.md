# Monorepo Migration Plan

## Overview
Restructure Stampdown into a monorepo with npm workspaces and scoped packages.

## Package Structure

```
stampdown/
├── package.json                    (root - workspace configuration)
├── packages/
│   ├── stampdown/                  (@stampdown/stampdown - core package)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── stampdown.ts
│   │   │   ├── parser.ts
│   │   │   ├── renderer.ts
│   │   │   ├── evaluator.ts
│   │   │   ├── loader.ts
│   │   │   ├── precompiler.ts
│   │   │   ├── plugin.ts
│   │   │   ├── types.ts
│   │   │   ├── index.ts
│   │   │   ├── helpers/
│   │   │   │   ├── builtin.ts
│   │   │   │   └── registry.ts
│   │   │   ├── plugins/
│   │   │   │   ├── index.ts
│   │   │   │   ├── string-helpers.ts
│   │   │   │   ├── math-helpers.ts
│   │   │   │   ├── date-helpers.ts
│   │   │   │   ├── array-helpers.ts
│   │   │   │   ├── debug.ts
│   │   │   │   └── README.md
│   │   │   └── __tests__/
│   │   │       ├── stampdown.test.ts
│   │   │       ├── parser.test.ts
│   │   │       ├── precompiler.test.ts
│   │   │       ├── loader.test.ts
│   │       │       ├── partials.test.ts
│   │   │       ├── plugin.test.ts
│   │   │       ├── advanced-expressions.test.ts
│   │   │       └── variable-assignment.test.ts
│   │   └── README.md
│   │
│   ├── cli/                        (@stampdown/cli)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── bin/
│   │   │   └── sdt-cli.js
│   │   ├── src/
│   │   │   ├── cli.ts
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   │       └── cli.test.ts
│   │   └── README.md
│   │
│   ├── llm/                        (@stampdown/llm)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── helpers.ts
│   │   │   ├── types.ts
│   │   │   ├── tokenizer.ts
│   │   │   ├── adapters/
│   │   │   │   └── ai-sdk.ts
│   │   │   └── __tests__/
│   │   │       └── llm-plugin.test.ts
│   │   └── README.md
│   │
│   └── vscode/                     (@stampdown/vscode)
│       ├── package.json
│       ├── README.md
│       ├── extension files...
│       └── syntaxes/
│           └── stampdown.tmLanguage.json
```

## Package Dependencies

### @stampdown/stampdown (Core)
**Version:** 0.1.0
**Dependencies:** None (no external dependencies for core)
**Exports:**
- `Stampdown` class
- `Precompiler` class
- `Parser`, `Renderer`, `Evaluator`
- Standard plugins (string, math, date, array, debug)
- Plugin system types

### @stampdown/cli
**Version:** 0.1.0
**Dependencies:**
- `@stampdown/stampdown: ^0.1.0`
**Bin:**
- `sdt-cli`

### @stampdown/llm
**Version:** 0.1.0
**Dependencies:**
- `@stampdown/stampdown: ^0.1.0`
- `@ai-sdk/provider: ^2.0.0`
- `gpt-tokenizer: ^3.0.1`
- `yaml: ^2.8.1`
- `zod: ^4.1.11`
**Exports:**
- `llmPlugin`
- LLM-specific types

### @stampdown/vscode
**Version:** 0.1.0
**Dependencies:**
- None (VS Code extension, separate from npm)
**Note:** This remains a standalone VS Code extension

## Migration Steps

### Phase 1: Setup Monorepo Structure
1. ✅ Create `packages/` directory
2. ✅ Create subdirectories for each package
3. Update root `package.json` with workspaces
4. Create package.json for each workspace

### Phase 2: Move Core Files
1. Move core Stampdown files to `packages/stampdown/src/`
2. Move standard plugins (string, math, date, array, debug)
3. Move core tests
4. Create `packages/stampdown/package.json`
5. Create `packages/stampdown/tsconfig.json`

### Phase 3: Move CLI
1. Move `src/cli.ts` to `packages/cli/src/`
2. Move `bin/sdt-cli.js` to `packages/cli/bin/`
3. Move CLI tests to `packages/cli/src/__tests__/`
4. Create `packages/cli/package.json`
5. Update imports to use `@stampdown/stampdown`

### Phase 4: Move LLM Plugin
1. Move `src/plugins/llm/` to `packages/llm/src/`
2. Move LLM test to `packages/llm/src/__tests__/`
3. Create `packages/llm/package.json` with LLM dependencies
4. Update imports to use `@stampdown/stampdown`

### Phase 5: Move VS Code Extension
1. Move `vscode-extension/` to `packages/vscode/`
2. Update package.json with proper scope
3. No code dependencies needed

### Phase 6: Update Build System
1. Update root tsconfig.json to reference workspaces
2. Create tsconfig.json for each package
3. Update build scripts
4. Update test configuration

### Phase 7: Update Documentation
1. Update main README.md
2. Create README.md for each package
3. Update import examples in documentation

## Import Changes

### Before:
```typescript
import { Stampdown } from 'stampdown';
import { llmPlugin } from 'stampdown/plugins/llm';
```

### After:
```typescript
import { Stampdown } from '@stampdown/stampdown';
import { llmPlugin } from '@stampdown/llm';
```

## Publishing Strategy

Each package can be published independently:

```bash
# Publish core
cd packages/stampdown && npm publish --access public

# Publish CLI
cd packages/cli && npm publish --access public

# Publish LLM
cd packages/llm && npm publish --access public

# VS Code extension published separately via marketplace
```

## Benefits

1. **Separation of Concerns**: Core library separate from CLI and plugins
2. **Smaller Install Size**: Users only install what they need
3. **Independent Versioning**: Each package can be versioned separately
4. **Better Dependency Management**: LLM dependencies don't bloat core package
5. **Clearer API Surface**: Each package has focused exports

## Rollout Plan

1. Complete migration in feature branch
2. Run all tests to ensure nothing breaks
3. Update all documentation
4. Merge to main
5. Publish v0.2.0 with new structure
6. Update GitHub README with new installation instructions

## Notes

- All packages will be under `@stampdown` scope
- Root package.json manages shared dev dependencies
- Each package has its own tsconfig extending a base config
- Tests remain with their respective packages
