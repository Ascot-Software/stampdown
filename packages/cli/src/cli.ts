#!/usr/bin/env node

/**
 * Stampdown CLI (sdt-cli)
 *
 * Command-line interface for rendering and precompiling Stampdown templates
 */

import * as fs from 'fs';
import * as path from 'path';
import { Stampdown } from '@stampdwn/core';
import { Precompiler } from '@stampdwn/core';

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
  -e, --extension <ext>         Output extension of generated files (default: md)
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
   * Find files matching a glob pattern
   * @param {string} pattern - Glob pattern to match
   * @returns {string[]} - Array of matching file paths
   * @private
   */
  private findFiles(pattern: string): string[] {
    const results: string[] = [];

    // Check if pattern contains glob characters
    const hasGlob = pattern.includes('*') || pattern.includes('?');

    if (!hasGlob) {
      // No glob, just check if file exists
      if (fs.existsSync(pattern)) {
        return [pattern];
      }
      return [];
    }

    // Parse the pattern to find the base directory
    const parts = pattern.split('/');
    let baseDir = '';
    let patternPart = pattern;

    // Find the first part with glob characters
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].includes('*') || parts[i].includes('?')) {
        baseDir = parts.slice(0, i).join('/') || '.';
        patternPart = parts.slice(i).join('/');
        break;
      }
    }

    // Recursively search for files
    const searchDir = (dir: string, remainingPattern: string): void => {
      if (!fs.existsSync(dir)) return;

      const stat = fs.statSync(dir);
      if (!stat.isDirectory()) return;

      const entries = fs.readdirSync(dir);
      const patternParts = remainingPattern.split('/');
      const currentPattern = patternParts[0];
      const restPattern = patternParts.slice(1).join('/');

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);

        // Handle ** (recursive wildcard)
        if (currentPattern === '**') {
          if (stat.isDirectory()) {
            // Continue with ** pattern
            searchDir(fullPath, remainingPattern);
            // Also try the next pattern part
            if (restPattern) {
              searchDir(fullPath, restPattern);
            }
          } else if (restPattern && this.matchPattern(entry, restPattern)) {
            results.push(fullPath);
          }
        }
        // Regular pattern matching
        else if (this.matchPattern(entry, currentPattern)) {
          if (restPattern) {
            // More pattern parts, continue searching
            if (stat.isDirectory()) {
              searchDir(fullPath, restPattern);
            }
          } else {
            // Last pattern part, add file
            if (stat.isFile()) {
              results.push(fullPath);
            }
          }
        }
      }
    };

    searchDir(baseDir, patternPart);
    return results;
  }

  /**
   * Check if a filename matches a glob pattern
   * @param {string} name - Filename to check
   * @param {string} pattern - Glob pattern
   * @returns {boolean} - True if name matches pattern
   * @private
   */
  private matchPattern(name: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(name);
  }

  /**
   * Load data from file or inline JSON
   * @param {string} dataSource - Path to data file or inline JSON string
   * @returns {Record<string, unknown>} - Parsed data object
   * @private
   */
  private loadData(dataSource: string): Record<string, unknown> {
    // Try to parse as inline JSON first
    if (dataSource.trim().startsWith('{')) {
      try {
        return JSON.parse(dataSource) as Record<string, unknown>;
      } catch (e) {
        // Not valid JSON, treat as file path
      }
    }

    // Find files matching the pattern
    const files = this.findFiles(dataSource);

    if (files.length === 0) {
      throw new Error(`No data files found matching: ${dataSource}`);
    }

    // Load and merge all data files
    let mergedData: Record<string, unknown> = {};

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const ext = path.extname(file).toLowerCase();

      let data: Record<string, unknown>;

      if (ext === '.json') {
        data = JSON.parse(content) as Record<string, unknown>;
      } else if (ext === '.yaml' || ext === '.yml') {
        // YAML support - for now, throw error
        throw new Error('YAML support not yet implemented. Please use JSON files.');
      } else {
        // Try JSON parse anyway
        try {
          data = JSON.parse(content) as Record<string, unknown>;
        } catch (e) {
          throw new Error(`Unable to parse data file: ${file}`);
        }
      }

      mergedData = { ...mergedData, ...data };

      if (this.options.verbose) {
        console.log(`Loaded data from: ${file}`);
      }
    }

    return mergedData;
  }

  /**
   * Read data from stdin
   * @returns {Promise<string>} - Data from stdin
   * @private
   */
  private readStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = '';

      process.stdin.setEncoding('utf8');
      process.stdin.resume();

      process.stdin.on('data', (chunk: string) => {
        data += chunk;
      });

      process.stdin.on('end', () => {
        resolve(data);
      });

      process.stdin.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Load partials from files
   * @param {string} pattern - Glob pattern for partial files
   * @returns {Record<string, string>} - Map of partial names to content
   * @private
   */
  private loadPartials(pattern: string): Record<string, string> {
    const files = this.findFiles(pattern);
    const partials: Record<string, string> = {};

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const basename = path.basename(file, path.extname(file));
      partials[basename] = content;

      if (this.options.verbose) {
        console.log(`Registered partial: ${basename} from ${file}`);
      }
    }

    return partials;
  }

  /**
   * Load helper functions from files
   * @param {string} pattern - Glob pattern for helper files
   * @returns {Record<string, Function>} - Map of helper names to functions
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private loadHelpers(pattern: string): Record<string, any> {
    const files = this.findFiles(pattern);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const helpers: Record<string, any> = {};

    for (const file of files) {
      const absolutePath = path.resolve(file);

      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
        const module = require(absolutePath);

        // Handle different export formats
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        if (typeof module === 'function') {
          // Single function export - use filename as helper name
          const basename = path.basename(file, path.extname(file));
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          helpers[basename] = module;

          if (this.options.verbose) {
            console.log(`Registered helper: ${basename} from ${file}`);
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        } else if (module.default && typeof module.default === 'function') {
          // Default export - use filename as helper name
          const basename = path.basename(file, path.extname(file));
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          helpers[basename] = module.default;

          if (this.options.verbose) {
            console.log(`Registered helper: ${basename} from ${file}`);
          }
        } else {
          // Named exports - register all functions
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          for (const key of Object.keys(module)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (typeof module[key] === 'function' && key !== 'default') {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              helpers[key] = module[key];

              if (this.options.verbose) {
                console.log(`Registered helper: ${key} from ${file}`);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error loading helper from ${file}:`, error);
      }
    }

    return helpers;
  }

  /**
   * Run render mode
   * @returns {Promise<void>}
   * @private
   */
  private async runRenderMode(): Promise<void> {
    // Validate options
    if (!this.options.stdin && (!this.options.templates || this.options.templates.length === 0)) {
      console.error('Error: No template files specified');
      console.error('Use --help for usage information');
      process.exit(1);
    }

    // Load data
    let data: Record<string, unknown> = {};

    if (this.options.stdin) {
      const stdinData = await this.readStdin();
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data = JSON.parse(stdinData);
        if (this.options.verbose) {
          console.log('Loaded data from stdin');
        }
      } catch (e) {
        throw new Error('Invalid JSON data from stdin');
      }
    } else if (this.options.data && this.options.data.length > 0) {
      // Load and merge data from all sources
      for (const dataSource of this.options.data) {
        const sourceData = this.loadData(dataSource);
        data = { ...data, ...sourceData };
      }
    }

    // Create Stampdown instance
    const stampdown = new Stampdown();

    // Load partials
    if (this.options.partials && this.options.partials.length > 0) {
      for (const partialPattern of this.options.partials) {
        const partials = this.loadPartials(partialPattern);
        for (const [name, content] of Object.entries(partials)) {
          stampdown.registerPartial(name, content);
        }
      }
    }

    // Load helpers
    if (this.options.helpers && this.options.helpers.length > 0) {
      for (const helperPattern of this.options.helpers) {
        const helpers = this.loadHelpers(helperPattern);
        for (const [name, fn] of Object.entries(helpers)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          stampdown.registerHelper(name, fn);
        }
      }
    }

    // Process templates
    const templates = this.options.templates || [];

    for (const templatePattern of templates) {
      const files = this.findFiles(templatePattern);

      if (files.length === 0) {
        console.error(`No template files found matching: ${templatePattern}`);
        continue;
      }

      for (const file of files) {
        if (this.options.verbose) {
          console.log(`Processing: ${file}`);
        }

        const template = fs.readFileSync(file, 'utf8');
        const result = stampdown.render(template, data);

        // Output result
        if (this.options.stdout) {
          console.log(result);
        } else {
          const outputDir = this.options.output || process.cwd();
          const ext = this.options.extension || 'md';
          const basename = path.basename(file, path.extname(file));
          const outputFile = path.join(outputDir, `${basename}.${ext}`);

          // Create output directory if it doesn't exist
          fs.mkdirSync(outputDir, { recursive: true });

          fs.writeFileSync(outputFile, result, 'utf8');

          if (this.options.verbose) {
            console.log(`Written: ${outputFile}`);
          }
        }
      }
    }

    if (this.options.verbose) {
      console.log('Done!');
    }

    // Exit successfully (needed to prevent stdin from keeping process alive)
    process.exit(0);
  }

  /**
   * Generate a template ID from file path
   * @param {string} filePath - Path to template file
   * @param {string} inputPattern - Original input pattern
   * @returns {string} - Generated template ID
   * @private
   */
  private generateTemplateId(filePath: string, inputPattern: string): string {
    // Remove base directory from input pattern
    const baseDir = inputPattern.split('*')[0].replace(/\/$/, '');
    let id = filePath;

    if (baseDir) {
      const basePath = path.resolve(baseDir);
      const fullPath = path.resolve(filePath);
      id = path.relative(basePath, fullPath);
    }

    // Remove extension and normalize separators
    id = id.replace(/\\/g, '/').replace(/\.sdt$/, '');

    return id;
  }

  /**
   * Precompile a single file
   * @param {Precompiler} precompiler - Precompiler instance
   * @param {string} filePath - Path to template file
   * @param {string} templateId - Template ID
   * @returns {{ id: string; code: string; sourceMap?: string } | null} - Precompiled template or null on error
   * @private
   */
  private precompileFile(
    precompiler: Precompiler,
    filePath: string,
    templateId: string
  ): { id: string; code: string; sourceMap?: string } | null {
    try {
      const template = fs.readFileSync(filePath, 'utf8');

      const result = precompiler.precompile(template, {
        templateId,
        knownHelpers: this.options.knownHelpers?.split(','),
        strict: this.options.strict,
        sourceMap: this.options.sourceMap,
      });

      if (this.options.verbose) {
        console.log(`Precompiled: ${filePath} → ${templateId}`);
      }

      return {
        id: templateId,
        code: result.code,
        sourceMap: result.sourceMap,
      };
    } catch (error) {
      console.error(`Error precompiling ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Generate output code for precompiled templates
   * @param {Array<{ id: string; code: string; sourceMap?: string }>} templates - Array of precompiled templates
   * @param {string} format - Output format (esm, cjs, or json)
   * @returns {string} - Generated output code
   * @private
   */
  private generatePrecompileOutput(
    templates: Array<{ id: string; code: string; sourceMap?: string }>,
    format: string
  ): string {
    if (format === 'json') {
      const json: Record<string, string> = {};
      for (const template of templates) {
        json[template.id] = template.code;
      }
      return JSON.stringify(json, null, 2);
    }

    // Generate ESM or CJS
    let output = '';

    if (format === 'esm') {
      output += "import { Stampdown } from 'stampdown';\n\n";
    } else {
      output += "const { Stampdown } = require('stampdown');\n\n";
    }

    output += 'const templates = {};\n\n';

    for (const template of templates) {
      output += `// Template: ${template.id}\n`;
      output += `templates['${template.id}'] = function(context, stampdown) {\n`;
      output += `  ${template.code.split('\n').join('\n  ')}\n`;
      output += `};\n\n`;
    }

    if (format === 'esm') {
      output += 'export default templates;\n';
      output += 'export { templates };\n';
    } else {
      output += 'module.exports = templates;\n';
    }

    return output;
  }

  /**
   * Run precompile mode
   * @returns {void}
   * @private
   */
  private runPrecompileMode(): void {
    // Validate options
    if (!this.options.input) {
      console.error('Error: --input is required in precompile mode');
      console.error('Use --help for usage information');
      process.exit(1);
    }

    const precompiler = new Precompiler();
    const outputDir = this.options.output || './precompiled';
    const format = this.options.format || 'esm';

    // Find all template files
    const files = this.findFiles(this.options.input);

    if (files.length === 0) {
      console.error(`No template files found matching: ${this.options.input}`);
      process.exit(1);
    }

    if (this.options.verbose) {
      console.log(`Found ${files.length} template(s)`);
    }

    // Precompile all files
    const templates: Array<{ id: string; code: string; sourceMap?: string }> = [];

    for (const file of files) {
      const templateId = this.generateTemplateId(file, this.options.input);
      const result = this.precompileFile(precompiler, file, templateId);

      if (result) {
        templates.push(result);
      }
    }

    if (templates.length === 0) {
      console.error('No templates were successfully precompiled');
      process.exit(1);
    }

    // Generate output
    const output = this.generatePrecompileOutput(templates, format);

    // Write output file
    const ext = format === 'json' ? 'json' : format === 'esm' ? 'mjs' : 'cjs';
    const outputFile = path.join(outputDir, `templates.${ext}`);

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputFile, output, 'utf8');

    console.log(`Precompiled ${templates.length} template(s) to: ${outputFile}`);

    // Watch mode
    if (this.options.watch) {
      console.log('\nWatching for changes... (press Ctrl+C to stop)');

      for (const file of files) {
        fs.watchFile(file, { interval: 1000 }, () => {
          if (this.options.verbose) {
            console.log(`\nChange detected: ${file}`);
          }
          // Re-run precompilation
          this.runPrecompileMode();
        });
      }
    }
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

    // Run appropriate mode
    if (this.options.precompile) {
      this.runPrecompileMode();
    } else {
      await this.runRenderMode();
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
