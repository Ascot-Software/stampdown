# Monorepo Migration Status

## ✅ Phase 1: Basic Structure - COMPLETE

Created monorepo structure with npm workspaces and package.json files for all packages.

### Completed Steps:

1. **Root Package Configuration**
   - Updated `package.json` to configure npm workspaces
   - Removed main/types/bin entries (moved to packages)
   - Removed dependencies (distributed to packages)
   - Added workspace-aware scripts
   - Marked as private monorepo root

2. **Package Structure Created**
   - `@stampdwn/core` - Core templating engine with standard plugins
   - `@stampdwn/cli` - Command-line interface (renamed from sdt-cli to stampdown)
   - `@stampdwn/llm` - LLM plugin with AI SDK dependencies
   - `@stampdwn/vscode` - VS Code extension

3. **Package.json Files**
   - ✅ Created `packages/core/package.json`
   - ✅ Created `packages/cli/package.json`
   - ✅ Created `packages/llm/package.json`
   - ✅ Updated `packages/vscode/package.json` (moved from vscode-extension/)

4. **TypeScript Configuration**
   - ✅ Created `packages/core/tsconfig.json`
   - ✅ Created `packages/cli/tsconfig.json`
   - ✅ Created `packages/llm/tsconfig.json`

5. **Workspace Dependencies**
   - ✅ Ran `npm install` to link workspaces
   - ✅ Verified workspace structure with `npm ls --workspaces`
   - ✅ All packages properly linked

### Current Workspace Structure:

```
stampdown-monorepo@0.1.0
├── @stampdwn/cli@0.1.0
│   └── @stampdwn/core@0.1.0 (workspace link)
├── @stampdwn/core@0.1.0
├── @stampdwn/llm@0.1.0
│   ├── @stampdwn/core@0.1.0 (workspace link)
│   ├── @ai-sdk/provider@2.0.0
│   ├── gpt-tokenizer@3.0.1
│   ├── yaml@2.8.1
│   └── zod@4.1.11
└── @stampdwn/vscode@0.1.0
```

## ✅ Phase 2: Move Files to Packages - COMPLETE

All files have been successfully moved to their respective packages!

### Files Moved:

#### To `packages/core/src/`:
- [x] `src/stampdown.ts`
- [x] `src/parser.ts`
- [x] `src/renderer.ts`
- [x] `src/evaluator.ts`
- [x] `src/loader.ts`
- [x] `src/precompiler.ts`
- [x] `src/plugin.ts`
- [x] `src/types.ts`
- [x] `src/index.ts`
- [x] `src/helpers/` (directory)
- [x] `src/plugins/` (excluding llm/)

#### To `packages/core/src/__tests__/`:
- [x] `src/__tests__/stampdown.test.ts`
- [x] `src/__tests__/precompiler.test.ts`
- [x] `src/__tests__/loader.test.ts`
- [x] `src/__tests__/partials.test.ts`
- [x] `src/__tests__/plugin.test.ts`
- [x] `src/__tests__/advanced-expressions.test.ts`
- [x] `src/__tests__/variable-assignment.test.ts`

#### To `packages/cli/src/`:
- [x] `src/cli.ts`

#### To `packages/cli/src/__tests__/`:
- [x] `src/__tests__/cli.test.ts`

#### To `packages/cli/bin/`:
- [x] `bin/sdt-cli.js` → `bin/stampdown.js` (renamed)

#### To `packages/llm/src/`:
- [x] `src/plugins/llm/` (directory) → moved to root of package

#### To `packages/llm/src/__tests__/`:
- [x] `src/__tests__/llm-plugin.test.ts`

### Import Path Updates - COMPLETE:

All imports have been updated successfully:

**In `packages/cli/src/cli.ts`:**
- [x] `import { Stampdown } from './stampdown'` → `import { Stampdown } from '@stampdwn/core'`
- [x] `import { Precompiler } from './precompiler'` → `import { Precompiler } from '@stampdwn/core'`

**In `packages/llm/src/index.ts`:**
- [x] `import { createPlugin } from '../../plugin'` → `import { createPlugin } from '@stampdwn/core'`

**In `packages/llm/src/helpers.ts`:**
- [x] `import type { Stampdown } from '../../stampdown'` → `import type { Stampdown } from '@stampdwn/core'`
- [x] `import type { Context } from '../../types'` → `import type { Context } from '@stampdwn/core'`
- [x] `import type { HelperOptions } from '../../helpers/registry'` → `import type { HelperOptions } from '@stampdwn/core'`

**In `packages/llm/src/__tests__/llm-plugin.test.ts`:**
- [x] `import { Stampdown } from '../stampdown'` → `import { Stampdown } from '@stampdwn/core'`
- [x] `import { llmPlugin } from '../plugins/llm'` → `import { llmPlugin } from '../index'`

**In `packages/core/src/index.ts` and `packages/core/src/plugins/index.ts`:**
- [x] Removed llmPlugin export (now in separate package)

## ✅ Phase 3: Update Build Configuration - COMPLETE

Build configuration has been successfully updated:

- [x] Created `jest.config.js` for each package (core, cli, llm)
- [x] TypeScript configurations already in place (tsconfig.json per package)
- [x] Test build: `npm run build` - ALL PACKAGES BUILD SUCCESSFULLY
- [x] Test all tests: `npm test` - ALL 183 TESTS PASSING
  - @stampdwn/cli: 19 tests passing
  - @stampdwn/core: 133 tests passing
  - @stampdwn/llm: 31 tests passing
- [x] Verified CLI executable works: `node packages/cli/bin/stampdown.js --version`

## ⏳ Phase 4: Update Documentation

- [ ] Update `README.md` with new package structure
- [ ] Update installation instructions
- [ ] Update import examples
- [ ] Create package-specific README files

## ⏳ Phase 5: Test & Verify

- [ ] Verify all 183 tests pass
- [ ] Test CLI executable: `./packages/cli/bin/stampdown.js --version`
- [ ] Test package imports between workspaces
- [ ] Verify build artifacts in each package's dist/

## Notes:

- Using `@stampdwn` scope (stampdown was taken on npm)
- CLI renamed from `sdt-cli` to `stampdown`
- Core package is `@stampdwn/core`
- All packages configured with `"access": "public"` for npm publishing
