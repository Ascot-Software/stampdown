#!/usr/bin/env node

/**
 * Stampdown CLI
 *
 * Command-line interface for precompiling Stampdown templates
 */

import * as fs from 'fs';
import * as path from 'path';
import { Precompiler } from './precompiler';

interface CliOptions {
  input?: string;
  output?: string;
  knownHelpers?: string;
  strict?: boolean;
  format?: 'esm' | 'cjs' | 'json';
  watch?: boolean;
  verbose?: boolean;
  sourceMap?: boolean;
}

class StampdownCLI {
  private precompiler: Precompiler;
  private options: CliOptions;

  constructor(options: CliOptions = {}) {
    this.precompiler = new Precompiler();
    this.options = options;
  }

  /**
   * Show help message
   */
  private showHelp(): void {
    console.log(`
Stampdown Precompiler CLI

Usage:
  stampdown-precompile [options]

Options:
  -i, --input <glob>          Input file or glob pattern (e.g., "src/**/*.sdt")
  -o, --output <dir>          Output directory (default: "./precompiled")
  -k, --known-helpers <list>  Comma-separated list of known helpers (or "all")
  -s, --strict                Strict mode - error on unknown helpers
  -f, --format <format>       Output format: esm, cjs, or json (default: esm)
  -w, --watch                 Watch mode - recompile on file changes
  -m, --source-map            Generate source maps
  -v, --verbose               Verbose output
  -h, --help                  Show this help message

Examples:
  # Precompile all .sdt files
  stampdown-precompile -i "templates/**/*.sdt" -o dist/templates

  # Precompile with known helpers
  stampdown-precompile -i "*.sdt" -k "uppercase,lowercase,if,each"

  # Generate CJS modules
  stampdown-precompile -i "templates/*.sdt" -f cjs -o build

  # Strict mode with source maps
  stampdown-precompile -i "src/**/*.sdt" -s -m -v

  # Watch mode for development
  stampdown-precompile -i "templates/**/*.sdt" -w
`);
  }

  /**
   * Parse command-line arguments
   */
  private parseArgs(args: string[]): CliOptions {
    const options: CliOptions = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '-h':
        case '--help':
          this.showHelp();
          process.exit(0);
          break;

        case '-i':
        case '--input':
          options.input = args[++i];
          break;

        case '-o':
        case '--output':
          options.output = args[++i];
          break;

        case '-k':
        case '--known-helpers':
          options.knownHelpers = args[++i];
          break;

        case '-s':
        case '--strict':
          options.strict = true;
          break;

        case '-f':
        case '--format':
          options.format = args[++i] as 'esm' | 'cjs' | 'json';
          break;

        case '-w':
        case '--watch':
          options.watch = true;
          break;

        case '-m':
        case '--source-map':
          options.sourceMap = true;
          break;

        case '-v':
        case '--verbose':
          options.verbose = true;
          break;

        default:
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
      }
    }

    return options;
  }

  /**
   * Find files matching glob pattern
   */
  private findFiles(pattern: string): string[] {
    // Simple glob implementation
    const cwd = process.cwd();
    const files: string[] = [];

    // Check if pattern contains wildcards
    if (pattern.includes('*')) {
      // Extract directory and file pattern
      let currentDir = cwd;

      const searchDir = (dir: string, remainingParts: string[]): void => {
        if (remainingParts.length === 0) return;

        const part = remainingParts[0];

        if (!fs.existsSync(dir)) return;

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (part === '**') {
            // Recursive wildcard
            if (entry.isDirectory()) {
              searchDir(fullPath, remainingParts);
              searchDir(fullPath, remainingParts.slice(1));
            } else if (remainingParts.length > 1) {
              // Check remaining pattern
              const remaining = remainingParts.slice(1);
              if (this.matchPattern(entry.name, remaining[0])) {
                files.push(fullPath);
              }
            }
          } else if (part === '*' || this.matchPattern(entry.name, part)) {
            if (remainingParts.length === 1 && entry.isFile()) {
              files.push(fullPath);
            } else if (entry.isDirectory()) {
              searchDir(fullPath, remainingParts.slice(1));
            }
          }
        }
      };

      // Start search
      const patternParts = pattern.split('/');
      if (patternParts[0] && !patternParts[0].includes('*')) {
        currentDir = path.join(cwd, patternParts[0]);
        patternParts.shift();
      }

      searchDir(currentDir, patternParts);
    } else {
      // Single file
      const filePath = path.resolve(cwd, pattern);
      if (fs.existsSync(filePath)) {
        files.push(filePath);
      }
    }

    return files;
  }

  /**
   * Match filename against pattern
   */
  private matchPattern(name: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (!pattern.includes('*')) return name === pattern;

    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    return regex.test(name);
  }

  /**
   * Generate template ID from file path
   */
  private generateTemplateId(filePath: string, inputPattern: string): string {
    // Remove base directory and extension
    let id = filePath;

    // Try to find common base
    const patternDir = path.dirname(inputPattern);
    if (patternDir && patternDir !== '.') {
      const baseDir = path.resolve(process.cwd(), patternDir);
      if (filePath.startsWith(baseDir)) {
        id = filePath.substring(baseDir.length + 1);
      }
    }

    // Remove extension
    id = id.replace(/\.sdt$/, '');

    // Convert to template ID format
    return id.replace(/\\/g, '/');
  }

  /**
   * Generate output code based on format
   */
  private generateOutput(
    templates: Array<{ id: string; code: string; usedHelpers: string[] }>,
    format: 'esm' | 'cjs' | 'json'
  ): string {
    const lines: string[] = [];

    if (format === 'json') {
      // JSON format - just the compiled code as strings
      const json: Record<string, { code: string; helpers: string[] }> = {};
      templates.forEach(({ id, code, usedHelpers }) => {
        json[id] = { code, helpers: usedHelpers };
      });
      return JSON.stringify(json, null, 2);
    }

    // ESM or CJS format
    lines.push('// Auto-generated by Stampdown Precompiler');
    lines.push('// DO NOT EDIT - This file is automatically generated');
    lines.push('');

    if (format === 'cjs') {
      lines.push('// CommonJS format');
      lines.push('');

      // Export individual templates
      templates.forEach(({ id, code }) => {
        const varName = this.sanitizeVarName(id);
        lines.push(`exports.${varName} = function(context, stampdown) {`);
        code.split('\n').forEach((line) => {
          if (line.trim()) {
            lines.push(`  ${line}`);
          }
        });
        lines.push('};');
        lines.push('');
      });

      // Export template map
      lines.push('// Template map');
      lines.push('exports.templates = {');
      templates.forEach(({ id }, index) => {
        const varName = this.sanitizeVarName(id);
        const comma = index < templates.length - 1 ? ',' : '';
        lines.push(`  '${id}': exports.${varName}${comma}`);
      });
      lines.push('};');
    } else {
      // ESM format
      lines.push('// ES Module format');
      lines.push('');

      // Export individual templates
      templates.forEach(({ id, code }) => {
        const varName = this.sanitizeVarName(id);
        lines.push(`export const ${varName} = function(context, stampdown) {`);
        code.split('\n').forEach((line) => {
          if (line.trim()) {
            lines.push(`  ${line}`);
          }
        });
        lines.push('};');
        lines.push('');
      });

      // Export template map
      lines.push('// Template map');
      lines.push('export const templates = {');
      templates.forEach(({ id }, index) => {
        const varName = this.sanitizeVarName(id);
        const comma = index < templates.length - 1 ? ',' : '';
        lines.push(`  '${id}': ${varName}${comma}`);
      });
      lines.push('};');
    }

    return lines.join('\n');
  }

  /**
   * Sanitize template ID to valid variable name
   */
  private sanitizeVarName(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');
  }

  /**
   * Precompile a single file
   */
  private precompileFile(
    filePath: string,
    templateId: string
  ): {
    id: string;
    code: string;
    usedHelpers: string[];
  } | null {
    try {
      const source = fs.readFileSync(filePath, 'utf-8');

      const knownHelpers = this.options.knownHelpers
        ? this.options.knownHelpers === 'all'
          ? 'all'
          : this.options.knownHelpers.split(',').map((h) => h.trim())
        : undefined;

      const compiled = this.precompiler.precompile(source, {
        templateId,
        knownHelpers,
        strict: this.options.strict,
        sourceMap: this.options.sourceMap,
      });

      if (this.options.verbose) {
        console.log(`  ✓ ${templateId} (${compiled.usedHelpers.length} helpers)`);
      }

      return {
        id: templateId,
        code: compiled.code,
        usedHelpers: compiled.usedHelpers,
      };
    } catch (error) {
      console.error(`  ✗ ${templateId}: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Run the precompiler
   */
  run(args: string[]): void {
    this.options = { ...this.options, ...this.parseArgs(args) };

    if (!this.options.input) {
      console.error('Error: Input pattern is required (-i or --input)');
      this.showHelp();
      process.exit(1);
    }

    const outputDir = this.options.output || './precompiled';
    const format = this.options.format || 'esm';

    const processFiles = (): void => {
      const files = this.findFiles(this.options.input!);

      if (files.length === 0) {
        console.error(`No files found matching: ${this.options.input}`);
        return;
      }

      console.log(`Found ${files.length} template(s)`);
      if (this.options.verbose) {
        console.log('');
      }

      const templates: Array<{ id: string; code: string; usedHelpers: string[] }> = [];

      for (const file of files) {
        const templateId = this.generateTemplateId(file, this.options.input!);
        const result = this.precompileFile(file, templateId);

        if (result) {
          templates.push(result);
        }
      }

      if (templates.length === 0) {
        console.error('No templates were successfully compiled');
        return;
      }

      // Create output directory
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate output file
      const output = this.generateOutput(templates, format);
      const ext = format === 'json' ? 'json' : format === 'cjs' ? 'cjs' : 'mjs';
      const outputFile = path.join(outputDir, `templates.${ext}`);

      fs.writeFileSync(outputFile, output, 'utf-8');

      console.log('');
      console.log(`✓ Compiled ${templates.length} template(s) to ${outputFile}`);

      // Show summary
      if (this.options.verbose) {
        const allHelpers = new Set<string>();
        templates.forEach((t) => t.usedHelpers.forEach((h) => allHelpers.add(h)));
        console.log(`  Total unique helpers: ${allHelpers.size}`);
        if (allHelpers.size > 0) {
          console.log(`  Helpers: ${Array.from(allHelpers).join(', ')}`);
        }
      }
    };

    // Initial processing
    processFiles();

    // Watch mode
    if (this.options.watch) {
      console.log('\nWatching for changes...');

      const files = this.findFiles(this.options.input);
      const watchedDirs = new Set<string>();

      files.forEach((file) => {
        const dir = path.dirname(file);
        watchedDirs.add(dir);
      });

      watchedDirs.forEach((dir) => {
        fs.watch(dir, { recursive: true }, (_eventType, filename) => {
          if (filename && filename.endsWith('.sdt')) {
            console.log(`\nChange detected: ${filename}`);
            processFiles();
            console.log('\nWatching for changes...');
          }
        });
      });

      // Keep process alive
      process.stdin.resume();
    }
  }
}

// Run CLI
if (require.main === module) {
  const cli = new StampdownCLI();
  try {
    cli.run(process.argv.slice(2));
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

export { StampdownCLI };
