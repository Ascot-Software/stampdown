# GitHub Copilot Instructions for Stampdown

This document provides context and guidelines for AI assistants working on the Stampdown monorepo codebase.

## Project Overview

Stampdown is a powerful Markdown templating language with Handlebars-like expressions, partials, block helpers, and hooks. It combines the simplicity of Markdown with the power of template expressions, enabling developers to create dynamic content with clean, readable templates.

## Monorepo Structure
The Stampdown codebase is organized as a monorepo using npm workspaces. It consists of the following packages:
- `@stampdwn/core`: The core library implementing the Stampdown parser, renderer, and precompiler.
- `@stampdwn/cli`: Command-line interface for precompiling and rendering Stampdown templates.
- `@stampdwn/llm`: Plugin package providing helpers for integrating with large language models (LLMs).
- `@stampdwn/vscode`: Visual Studio Code extension for Stampdown syntax highlighting and language features.

## Understanding the Codebase
You can find the source code for each package under its `src/` directory.
To learn more about each package refer to the `README.md` files located in each package directory.

- [`@stampdwn/core/README.md`](../packages/core/README.md)
- [`@stampdwn/cli/README.md`](../packages/cli/README.md)
- [`@stampdwn/llm/README.md`](../packages/llm/README.md)
- [`@stampdwn/codemirror/README.md`](../packages/codemirror/README.md)
- [`@stampdwn/vscode/README.md`](../packages/vscode/README.md)

### API Documentation
API documentation is generated using API Extractor and API Documenter.
You can find the generated API docs in the `api/` directory:

- [`@stampdwn/core API Docs`](../.github/api/core.md)
- [`@stampdwn/cli API Docs`](../.github/api/cli.md)
- [`@stampdwn/llm API Docs`](../.github/api/llm.md)
- [`@stampdwn/codemirror API Docs`](../.github/api/codemirror.md)

## Development Guidelines

### Code Quality Standards

#### 1. TSDoc Documentation

**REQUIRED:** Every function must have TSDoc comments.

```typescript
/**
 * Parse a template string into an AST
 * @param template - The template string to parse
 * @returns The root AST node
 */
parse(template: string): ASTNode {
  // Implementation
}
```

**TSDoc Requirements:**
- Description of what the function does
- `@param` tags for all parameters descriptions
- `@returns` tag with description
- `@private` tag for internal methods
- `@throws` tag if function can throw errors
- `@example` tag for complex functions or plugins

#### 2. Testing

**REQUIRED:** Write tests for all new functionality.

**Test Location:** `packages/*/src/__tests__/`

**Running Tests:**
```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- stampdown.test  # Run specific test file
```

**Test Coverage:**
- Current: 103 tests across 6 test suites (includes 31 LLM plugin tests)
- All tests must pass before committing
- Aim for high coverage of edge cases

**Test Structure:**
```typescript
describe('Feature Name', () => {
  it('should handle basic case', () => {
    const stampdown = new Stampdown();
    const result = stampdown.render('{{name}}', { name: 'Alice' });
    expect(result).toBe('Alice');
  });

  it('should handle edge case', () => {
    // Test edge cases
  });
});
```

#### 3. Code Formatting

**REQUIRED:** Run linting and formatting before committing.

```bash
npm run lint      # Check for linting errors
npm run format    # Auto-format code with Prettier
npm run build     # Verify TypeScript compilation
```

**Standards:**
- ESLint with TypeScript rules enabled
- Prettier for consistent formatting
- Strict TypeScript mode
- No unused variables (prefix with `_` if intentional)

### Task Workflow

When working on a task, follow this workflow:

#### 1. Understand the Task
- Read the feature request or bug report carefully
- Check existing documentation in `docs/` for context
- Review related test files to understand current behavior
- Check the grammar file if it involves syntax changes

#### 2. Plan the Changes
- Identify which files need modifications
- Consider impact on other components (parser → renderer → precompiler)
- Plan test cases before implementing
- Consider backward compatibility

#### 3. Implement Changes
- Follow existing code patterns and style
- Add TSDocs comments to all new functions
- Keep functions focused and single-purpose
- Use TypeScript types strictly (no `any` unless absolutely necessary)

#### 4. Test Thoroughly
- Write unit tests for new functionality
- Test edge cases and error conditions
- Run existing tests to ensure no regressions
- Manually test if adding new syntax or features

#### 5. Documentation
- **DO NOT** write separate summary documents
- **DO** output summaries in chat conversations
- Update respective `README.md` files if adding user-facing features

#### 6. Verify Quality
```bash
npm run build     # TypeScript compilation
npm test          # Run all tests
npm run lint      # Check linting
```

All three must pass before the task is complete.

#### 7. Commit Guidelines
- Use clear, descriptive commit messages
- Reference issue numbers if applicable
- Keep commits focused on a single change
- Include test updates in the same commit as implementation

### Special Considerations

#### Parser Changes
If modifying `parser.ts`:
- Ensure AST structure matches `types.ts` definitions
- Update all three parsers: parseNode, parsePartial, parseBlockHelper
- Consider precompiler impact (it generates code from AST)
- Update grammar file if adding new syntax

#### Renderer Changes
If modifying `renderer.ts`:
- Ensure proper context handling (immutability where needed)
- Handle undefined/null values gracefully
- Consider partial resolution order (inline → regular)
- Test with nested structures

#### Precompiler Changes
If modifying `precompiler.ts`:
- Generate valid JavaScript code
- Use unique variable names (helperCounter mechanism)
- Test generated code execution
- Consider watch mode and file observation

#### Grammar Changes
If modifying `vscode-extension/syntaxes/stampdown.tmLanguage.json`:
- Test with various syntax combinations
- Ensure pattern order is correct (more specific first)
- Validate JSON syntax
- Test with test files (test-*.sdt)
- Pattern specificity matters: `{{#*inline` before `{{#`

### Common Patterns

#### Adding a New Helper

1. Decide if it's a built-in or plugin helper
2. Implement helper function with proper signature
3. Add to registry (builtin.ts or plugin file)
4. Add JSDoc with @example
5. Write tests
6. Update documentation

#### Adding New Syntax

1. Update parser to recognize new syntax
2. Add AST node type to types.ts
3. Implement renderer logic
4. Implement precompiler code generation
5. Update VS Code grammar
6. Write comprehensive tests
7. Add to documentation with examples

#### Fixing a Bug

1. Write a failing test that reproduces the bug
2. Debug to find root cause
3. Fix the issue
4. Verify test now passes
5. Add edge case tests
6. Check for similar issues elsewhere

### Performance Considerations

- **Parser:** Keep parsing fast; avoid unnecessary regex
- **Renderer:** Minimize object allocations in hot paths
- **Precompiler:** Generate minimal, efficient code
- **Helpers:** Keep helper functions lightweight

### Security Considerations

- Never use `eval()` or `Function()` with user input directly
- Expression evaluator uses safe property access only
- Validate all user inputs
- Escape output appropriately (handled by renderer)

## Key Implementation Notes

### Expression Evaluation
- Safe property access only (no function execution)
- Supports literals: numbers, strings, booleans, null, undefined
- Dot notation for nested properties
- Returns `undefined` for missing properties

### Context Management
- Mutable context for variable assignments (direct mutation)
- Immutable context passing for block helpers (spread operator for scoped variables)
- Special variables prefixed with `@`
- `this` keyword for current scope (refers to context if not explicitly set)
- Context stacking in block helpers
- `each` and `with` helpers preserve original context for mutation support

### Partial Resolution Order
1. Check inline partials (block-scoped)
2. Fall back to regular partials
3. Return undefined if not found

### Variable Naming in Precompiler
- Use counter-based unique names: `partial_0`, `context_1`
- Prevents collisions in nested structures
- Reset counter for each template

### Grammar Pattern Priority
Order matters in TextMate grammars:
1. Most specific patterns first
2. Check opening delimiters thoroughly
3. Use backreferences for matching closing tags
4. Include all patterns in nested contexts

## Testing Philosophy

- **Unit Tests:** Test individual functions in isolation
- **Integration Tests:** Test complete template rendering
- **Edge Cases:** Test error conditions and boundaries
- **Regression Tests:** Add tests for all bug fixes

## Documentation Philosophy

- **Code is Documentation:** Well-named functions and variables
- **JSDoc for API:** Complete parameter and return documentation
- **README for Users:** User-facing features and examples
- **Docs for Depth:** Detailed guides for complex features
- **NO Summary Docs:** Use chat summaries instead of creating files
- **Keep Docs Updated:** Documentation should match code

## Questions or Issues?

- Check existing tests for usage examples
- Review similar implementations in the codebase
- Consult documentation in `docs/` directory
- Follow established patterns for consistency
- Ask in chat rather than creating summary documents

## Version

This document reflects the codebase state as of October 6, 2025.
All 181 tests passing across 4 packages:
- @stampdwn/core: 133 tests (advanced expressions, variable assignment, partials, precompiler, etc.)
- @stampdwn/cli: 19 tests (CLI functionality, precompilation, rendering)
- @stampdwn/llm: 29 tests (LLM plugin helpers, normalization, token management)
- @stampdwn/vscode: VS Code extension with comprehensive TextMate grammar

100% JSDoc coverage. TypeScript strict mode enabled. ESLint flat config (v9+).

**Recent Updates:**
- **Monorepo Migration**: Completed Phase 2 migration to npm workspaces with @stampdwn/* scoped packages
- **Package Structure**: Split into core, CLI, LLM, and VS Code extension packages
- **Documentation**: Comprehensive README files for each package with usage examples
- **Import Paths**: Updated all imports to use @stampdwn/* package naming
- **LLM Plugin**: Removed mdSection helper (simplified to direct markdown headings)
- **ESLint**: Upgraded to flat config with proper TypeScript integration
- **Test Coverage**: Maintained 100% test coverage across all packages during migration
