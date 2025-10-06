# Contributing to Stampdown

Thank you for your interest in contributing to Stampdown! This document provides guidelines and instructions for contributing to this monorepo.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stampdown
   ```

2. **Install dependencies** (installs all workspace dependencies)
   ```bash
   npm install
   ```

3. **Build all packages**
   ```bash
   npm run build
   ```

4. **Run all tests**
   ```bash
   npm test
   ```

## Monorepo Structure

This project uses npm workspaces with the following packages:

- **[@stampdwn/core](packages/core/)** - Core templating engine
- **[@stampdwn/cli](packages/cli/)** - Command-line interface
- **[@stampdwn/llm](packages/llm/)** - LLM plugin for prompt templates
- **[@stampdwn/vscode](packages/vscode/)** - VS Code extension

## Development Workflow

### Working with Specific Packages

Each package has its own development workflow:

```bash
# Work on core package
cd packages/core
npm run dev        # Watch mode for development
npm test           # Run core tests
npm run lint       # Check linting

# Work on CLI package
cd packages/cli
npm run dev        # Watch mode
npm test           # Run CLI tests
npm run build      # Build CLI

# Work on LLM package
cd packages/llm
npm run dev        # Watch mode
npm test           # Run LLM tests
npm run build      # Build LLM package

# Work on VS Code extension
cd packages/vscode
npm run build      # Build extension
npm run package    # Create .vsix file
```

### Running All Package Commands

From the root, you can run commands across all packages:

```bash
# Build all packages
npm run build

# Test all packages
npm test

# Lint all packages
npm run lint

# Clean all packages
npm run clean
```

### Code Quality

We use ESLint and Prettier to maintain code quality:

```bash
# Check linting issues across all packages
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format

# Check formatting without making changes
npm run format:check
```

### Testing

We use Jest for testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
stampdown/
├── src/
│   ├── __tests__/          # Test files
│   ├── helpers/            # Helper-related code
│   │   ├── builtin.ts     # Built-in helpers
│   │   └── registry.ts    # Helper registry
│   ├── evaluator.ts       # Expression evaluator
│   ├── index.ts           # Main entry point
│   ├── parser.ts          # Template parser
│   ├── renderer.ts        # AST renderer
│   ├── stampdown.ts       # Main Stampdown class
│   └── types.ts           # TypeScript type definitions
├── dist/                   # Compiled output (gitignored)
├── package.json
├── tsconfig.json
└── README.md
```

## Adding New Features

### Adding a New Built-in Helper

1. Open `src/helpers/builtin.ts`
2. Add your helper to the `registerBuiltInHelpers` function
3. Write tests in `src/__tests__/stampdown.test.ts`
4. Update the documentation

Example:

```typescript
registry.register('myHelper', (context: Context, options: HelperOptions, ...args: unknown[]) => {
  // Your implementation
  return 'result';
});
```

### Extending the Parser

If you need to add new syntax:

1. Update `src/parser.ts` to recognize the new syntax
2. Update `src/types.ts` if new AST node types are needed
3. Update `src/renderer.ts` to handle the new node types
4. Add comprehensive tests

### Adding Hooks

Hooks can be added by modifying:
- `src/types.ts` for type definitions
- `src/stampdown.ts` for implementation

## Code Style Guidelines

- Use TypeScript strict mode
- Follow the existing code style (enforced by Prettier)
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Prefer explicit types over `any`

## Commit Message Guidelines

We follow conventional commit format:

```
type(scope): subject

body

footer
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(parser): add support for inline comments
fix(helpers): correct 'each' helper index counting
docs(readme): update installation instructions
test(renderer): add tests for partial rendering
```

## Testing Guidelines

- Write tests for all new features
- Maintain or improve code coverage
- Test edge cases and error conditions
- Use descriptive test names

Example test structure:

```typescript
describe('Feature Name', () => {
  describe('Specific functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const stampdown = new Stampdown();

      // Act
      const result = stampdown.render(template, context);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

3. **Ensure quality**
   ```bash
   npm run lint
   npm run format
   npm test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add my new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/my-new-feature
   ```

6. **Create a Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Ensure CI passes

## Reporting Issues

When reporting issues, please include:

- Stampdown version
- Node.js version
- Operating system
- Minimal reproduction example
- Expected vs actual behavior
- Any error messages or stack traces

## Questions?

Feel free to open an issue for:
- Feature requests
- Bug reports
- Documentation improvements
- General questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
