#!/usr/bin/env node

/**
 * Stampdown CLI (sdt-cli)
 *
 * Command-line interface for rendering and precompiling Stampdown templates
 */

import * as fs from 'fs';
import * as path from 'path';
import { Stampdown } from './stampdown';
import { Precompiler } from './precompiler';

/**
 * CLI options interface
 */
interface CliOptions {
  // Common options
  help?: boolean;
  version?: boolean;
  verbose?: boolean;

  // Render mode options
  output?: string;
  extension?: string;
  stdout?: boolean;
  stdin?: boolean;
  partials?: string[];
  helpers?: string[];
  data?: string[];
  templates?: string[];

  // Precompile mode options
  precompile?: boolean;
  knownHelpers?: string;
  strict?: boolean;
  format?: 'esm' | 'cjs' | 'json';
  watch?: boolean;
  sourceMap?: boolean;
  input?: string;
}

/**
 * Stampdown CLI class
 */
class StampdownCLI {
  private options: CliOptions;
  private readonly version = '0.1.0';

  /**
   * Creates a new StampdownCLI instance
   * @param {CliOptions} options - CLI options
   */
  constructor(options: CliOptions = {}) {
    this.options = options;
  }

  /**
   * Show help message
   * @returns {void}
   */
  private showHelp(): void {
    console.log(`
Stampdown CLI (sdt-cli) v${this.version}

Usage:
  sdt-cli --version
  sdt-cli --help
  sdt-cli [options] [--] <template...>
  sdt-cli --precompile [options]

Render Mode (default):
  Process templates and output rendered results

  -h, --help                    Output usage information
  -v, --version                 Output the version number
  -o, --output <directory>      Directory to output rendered templates (default: cwd)
  -e, --extension <ext>         Output extension of generated files (default: html)
  -s, --stdout                  Output to standard output
  -i, --stdin                   Receive data directly from stdin
  -P, --partial <glob>...       Register a partial (use as many as you want, supports globs)
  -H, --helper <glob>...        Register a helper (use as many as you want, supports globs)
  -D, --data <glob|json>...     Parse data from file or inline JSON
      --verbose                 Verbose output

Precompile Mode:
  Precompile templates to optimized JavaScript functions

      --precompile              Enable precompile mode
      --input <glob>            Input file or glob pattern (required in precompile mode)
  -o, --output <dir>            Output directory (default: "./precompiled")
  -k, --known-helpers <list>    Comma-separated list of known helpers (or "all")
      --strict                  Strict mode - error on unknown helpers
  -f, --format <format>         Output format: esm, cjs, or json (default: esm)
  -w, --watch                   Watch mode - recompile on file changes
  -m, --source-map              Generate source maps
      --verbose                 Verbose output

Examples:

  # Render a template with data
  sdt-cli -D data.json template.sdt

  # Render with partials and helpers
  sdt-cli -P ./partials/*.sdt -H ./helpers/*.js -D data.json template.sdt

  # Output to directory with custom extension
  sdt-cli -D data.json -o ./dist -e md template.sdt

  # Output to stdout
  sdt-cli -D data.json -s template.sdt

  # Read data from stdin
  echo '{"name": "Alice"}' | sdt-cli -i template.sdt

  # Precompile templates
  sdt-cli --precompile --input "templates/**/*.sdt" -o dist

  # Precompile with known helpers
  sdt-cli --precompile --input "*.sdt" -k "uppercase,lowercase,if,each"
`);
  }

  /**
   * Show version
   * @returns {void}
   */
  private showVersion(): void {
    console.log(`sdt-cli v${this.version}`);
  }

  /**
   * Parse command-line arguments
   * @param {string[]} args - Command-line arguments to parse
   * @returns {CliOptions} - Parsed options object
   */
  private parseArgs(args: string[]): CliOptions {
    const options: CliOptions = {
      partials: [],
      helpers: [],
      data: [],
      templates: [],
    };

    let i = 0;
    let afterDash = false;

    while (i < args.length) {
      const arg = args[i];

      // Handle -- separator
      if (arg === '--') {
        afterDash = true;
        i++;
        continue;
      }

      // After --, everything is a template
      if (afterDash) {
        options.templates!.push(arg);
        i++;
        continue;
      }

      // Parse options
      switch (arg) {
        case '-h':
        case '--help':
          options.help = true;
          break;

        case '-v':
        case '--version':
          options.version = true;
          break;

        case '--verbose':
          options.verbose = true;
          break;

        case '-o':
        case '--output':
          options.output = args[++i];
          break;

        case '-e':
        case '--extension':
          options.extension = args[++i];
          break;

        case '-s':
        case '--stdout':
          options.stdout = true;
          break;

        case '-i':
        case '--stdin':
          options.stdin = true;
          break;

        case '-P':
        case '--partial':
          options.partials!.push(args[++i]);
          break;

        case '-H':
        case '--helper':
          options.helpers!.push(args[++i]);
          break;

        case '-D':
        case '--data':
          options.data!.push(args[++i]);
          break;

        case '--precompile':
          options.precompile = true;
          break;

        case '--input':
          options.input = args[++i];
          break;

        case '-k':
        case '--known-helpers':
          options.knownHelpers = args[++i];
          break;

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

        default:
          // If it starts with -, it's an unknown option
          if (arg.startsWith('-')) {
            console.error(`Unknown option: ${arg}`);
            process.exit(1);
          }
          // Otherwise, it's a template file
          options.templates!.push(arg);
      }

      i++;
    }

    return options;
  }

  /**
   * Run the CLI
   * @param {string[]} args - Command-line arguments
   * @returns {Promise<void>}
   */
  async run(args: string[]): Promise<void> {
    this.options = { ...this.options, ...this.parseArgs(args) };

    // Handle help and version
    if (this.options.help) {
      this.showHelp();
      return;
    }

    if (this.options.version) {
      this.showVersion();
      return;
    }

    // For now, just show a message about the modes
    if (this.options.precompile) {
      console.log('Precompile mode coming soon...');
    } else {
      console.log('Render mode coming soon...');
    }
  }
}

// Run CLI
if (require.main === module) {
  const cli = new StampdownCLI();
  cli
    .run(process.argv.slice(2))
    .then(() => {
      // Success
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { StampdownCLI };
