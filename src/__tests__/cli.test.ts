/**
 * CLI Tests
 *
 * Tests for the Stampdown CLI (sdt-cli)
 */

import * as fs from 'fs';
import * as path from 'path';
import { StampdownCLI } from '../cli';

describe('CLI', () => {
  const testDir = path.join(__dirname, '../../cli-test');
  const outputDir = path.join(testDir, 'test-output');

  // Clean up test output directory before each test
  beforeEach(() => {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });
  });

  // Clean up after all tests
  afterAll(() => {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  });

  describe('Basic Options', () => {
    it('should show version', async () => {
      const cli = new StampdownCLI();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.run(['--version']);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('sdt-cli'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('0.1.0'));
      consoleSpy.mockRestore();
    });

    it('should show help', async () => {
      const cli = new StampdownCLI();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.run(['--help']);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Render Mode'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Precompile Mode'));
      consoleSpy.mockRestore();
    });
  });

  describe('Render Mode', () => {
    it('should render a template with data file', async () => {
      const cli = new StampdownCLI();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      const templatePath = path.join(testDir, 'template.sdt');
      const dataPath = path.join(testDir, 'data.json');

      try {
        await cli.run(['-D', dataPath, '-o', outputDir, templatePath]);
      } catch (e) {
        // Expected - process.exit(0) is called
      }

      const outputFile = path.join(outputDir, 'template.md');
      expect(fs.existsSync(outputFile)).toBe(true);

      const content = fs.readFileSync(outputFile, 'utf8');
      expect(content).toContain('Hello Alice!');
      expect(content).toContain('30 years old');
      expect(content).toContain('premium access');

      exitSpy.mockRestore();
    });

    it('should render to stdout', async () => {
      const cli = new StampdownCLI();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      const templatePath = path.join(testDir, 'template.sdt');
      const dataPath = path.join(testDir, 'data.json');

      try {
        await cli.run(['-D', dataPath, '-s', templatePath]);
      } catch (e) {
        // Expected - process.exit(0) is called
      }

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Hello Alice!'));

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should use custom extension', async () => {
      const cli = new StampdownCLI();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      const templatePath = path.join(testDir, 'template.sdt');
      const dataPath = path.join(testDir, 'data.json');

      try {
        await cli.run(['-D', dataPath, '-o', outputDir, '-e', 'html', templatePath]);
      } catch (e) {
        // Expected - process.exit(0) is called
      }

      const outputFile = path.join(outputDir, 'template.html');
      expect(fs.existsSync(outputFile)).toBe(true);

      exitSpy.mockRestore();
    });

    it('should handle inline JSON data', async () => {
      const cli = new StampdownCLI();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      const templatePath = path.join(testDir, 'template.sdt');
      const inlineData = '{"name":"Bob","age":25,"premium":false}';

      try {
        await cli.run(['-D', inlineData, '-s', templatePath]);
      } catch (e) {
        // Expected - process.exit(0) is called
      }

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Hello Bob!'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('25 years old'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('free access'));

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should merge multiple data sources', async () => {
      const cli = new StampdownCLI();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      // Create second data file
      const data2Path = path.join(outputDir, 'data2.json');
      fs.writeFileSync(data2Path, JSON.stringify({ age: 35 }), 'utf8');

      const templatePath = path.join(testDir, 'template.sdt');
      const dataPath = path.join(testDir, 'data.json');

      try {
        await cli.run(['-D', dataPath, '-D', data2Path, '-s', templatePath]);
      } catch (e) {
        // Expected - process.exit(0) is called
      }

      // Should use age from second file (35)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('35 years old'));

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should error on missing template', async () => {
      const cli = new StampdownCLI();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await cli.run(['-D', path.join(testDir, 'data.json')]);
      } catch (e) {
        // Expected
      }

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('No template files specified'));
      expect(exitSpy).toHaveBeenCalledWith(1);

      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });

  describe('Partials', () => {
    beforeEach(() => {
      // Create test partials
      const partialsDir = path.join(outputDir, 'partials');
      fs.mkdirSync(partialsDir, { recursive: true });

      fs.writeFileSync(path.join(partialsDir, 'header.sdt'), '# Header: {{title}}', 'utf8');

      fs.writeFileSync(path.join(partialsDir, 'footer.sdt'), '---\nFooter content', 'utf8');
    });

    it('should load and use partials', async () => {
      const cli = new StampdownCLI();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      // Create template that uses partials
      const templatePath = path.join(outputDir, 'with-partials.sdt');
      fs.writeFileSync(templatePath, '{{> header}}\n\nContent here\n\n{{> footer}}', 'utf8');

      const partialsPattern = path.join(outputDir, 'partials/*.sdt');
      const inlineData = '{"title":"My Page"}';

      try {
        await cli.run(['-P', partialsPattern, '-D', inlineData, '-s', templatePath]);
      } catch (e) {
        // Expected - process.exit(0) is called
      }

      const output = consoleSpy.mock.calls.map((call) => String(call[0])).join('\n');
      expect(output).toContain('Header: My Page');
      expect(output).toContain('Footer content');

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });

  describe('Helpers', () => {
    beforeEach(() => {
      // Create test helpers
      const helpersDir = path.join(outputDir, 'helpers');
      fs.mkdirSync(helpersDir, { recursive: true });

      // Single function export
      fs.writeFileSync(
        path.join(helpersDir, 'shout.js'),
        `module.exports = function(context, options, text) {
          return String(text).toUpperCase() + '!!!';
        };`,
        'utf8'
      );

      // Named exports
      fs.writeFileSync(
        path.join(helpersDir, 'text-utils.js'),
        `exports.reverse = function(context, options, text) {
          return String(text).split('').reverse().join('');
        };
        exports.double = function(context, options, text) {
          return String(text) + String(text);
        };`,
        'utf8'
      );
    });

    it('should load and use helpers with single function export', async () => {
      const cli = new StampdownCLI();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      // Create template that uses helpers
      const templatePath = path.join(outputDir, 'with-helpers.sdt');
      fs.writeFileSync(templatePath, '{{#shout name/}}', 'utf8');

      const helpersPattern = path.join(outputDir, 'helpers/shout.js');
      const inlineData = '{"name":"hello"}';

      try {
        await cli.run(['-H', helpersPattern, '-D', inlineData, '-s', templatePath]);
      } catch (e) {
        // Expected - process.exit(0) is called
      }

      expect(consoleSpy).toHaveBeenCalledWith('HELLO!!!');

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should load and use helpers with named exports', async () => {
      const cli = new StampdownCLI();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      // Create template that uses helpers
      const templatePath = path.join(outputDir, 'with-named-helpers.sdt');
      fs.writeFileSync(templatePath, '{{#reverse name/}} | {{#double name/}}', 'utf8');

      const helpersPattern = path.join(outputDir, 'helpers/text-utils.js');
      const inlineData = '{"name":"abc"}';

      try {
        await cli.run(['-H', helpersPattern, '-D', inlineData, '-s', templatePath]);
      } catch (e) {
        // Expected - process.exit(0) is called
      }

      expect(consoleSpy).toHaveBeenCalledWith('cba | abcabc');

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });

  describe('Precompile Mode', () => {
    it('should precompile templates', async () => {
      const cli = new StampdownCLI();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const templatePath = path.join(testDir, 'template.sdt');
      const precompiledDir = path.join(outputDir, 'precompiled');

      await cli.run(['--precompile', '--input', templatePath, '-o', precompiledDir]);

      const outputFile = path.join(precompiledDir, 'templates.mjs');
      expect(fs.existsSync(outputFile)).toBe(true);

      const content = fs.readFileSync(outputFile, 'utf8');
      expect(content).toContain("import { Stampdown } from 'stampdown'");
      expect(content).toContain('const templates = {}');
      expect(content).toContain('export default templates');

      consoleSpy.mockRestore();
    });

    it('should precompile with CommonJS format', async () => {
      const cli = new StampdownCLI();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const templatePath = path.join(testDir, 'template.sdt');
      const precompiledDir = path.join(outputDir, 'precompiled-cjs');

      await cli.run(['--precompile', '--input', templatePath, '-o', precompiledDir, '-f', 'cjs']);

      const outputFile = path.join(precompiledDir, 'templates.cjs');
      expect(fs.existsSync(outputFile)).toBe(true);

      const content = fs.readFileSync(outputFile, 'utf8');
      expect(content).toContain("const { Stampdown } = require('stampdown')");
      expect(content).toContain('module.exports = templates');

      consoleSpy.mockRestore();
    });

    it('should precompile with JSON format', async () => {
      const cli = new StampdownCLI();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const templatePath = path.join(testDir, 'template.sdt');
      const precompiledDir = path.join(outputDir, 'precompiled-json');

      await cli.run(['--precompile', '--input', templatePath, '-o', precompiledDir, '-f', 'json']);

      const outputFile = path.join(precompiledDir, 'templates.json');
      expect(fs.existsSync(outputFile)).toBe(true);

      const content = fs.readFileSync(outputFile, 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const json = JSON.parse(content);
      // The template ID depends on the path structure, so just check that we got templates
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(Object.keys(json).length).toBeGreaterThan(0);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      const firstTemplate = Object.values(json)[0];
      expect(typeof firstTemplate).toBe('string');

      consoleSpy.mockRestore();
    });

    it('should error on missing input in precompile mode', async () => {
      const cli = new StampdownCLI();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await cli.run(['--precompile']);
      } catch (e) {
        // Expected
      }

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('--input is required'));
      expect(exitSpy).toHaveBeenCalledWith(1);

      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });

  describe('Glob Patterns', () => {
    beforeEach(() => {
      // Create multiple template files
      const templatesDir = path.join(outputDir, 'templates');
      fs.mkdirSync(templatesDir, { recursive: true });

      fs.writeFileSync(path.join(templatesDir, 'page1.sdt'), 'Page 1: {{title}}', 'utf8');

      fs.writeFileSync(path.join(templatesDir, 'page2.sdt'), 'Page 2: {{title}}', 'utf8');

      const subDir = path.join(templatesDir, 'sub');
      fs.mkdirSync(subDir, { recursive: true });

      fs.writeFileSync(path.join(subDir, 'page3.sdt'), 'Page 3: {{title}}', 'utf8');
    });

    it('should match wildcard patterns', async () => {
      const cli = new StampdownCLI();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      const templatesPattern = path.join(outputDir, 'templates/*.sdt');
      const inlineData = '{"title":"Test"}';

      try {
        await cli.run(['-D', inlineData, '-o', outputDir, templatesPattern]);
      } catch (e) {
        // Expected - process.exit(0) is called
      }

      expect(fs.existsSync(path.join(outputDir, 'page1.md'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'page2.md'))).toBe(true);

      exitSpy.mockRestore();
    });

    it('should match recursive patterns with **', async () => {
      const cli = new StampdownCLI();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      const templatesPattern = path.join(outputDir, 'templates/**/*.sdt');
      const inlineData = '{"title":"Test"}';

      try {
        await cli.run(['-D', inlineData, '-o', outputDir, templatesPattern]);
      } catch (e) {
        // Expected - process.exit(0) is called
      }

      expect(fs.existsSync(path.join(outputDir, 'page1.md'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'page2.md'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'page3.md'))).toBe(true);

      exitSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid data file', async () => {
      const cli = new StampdownCLI();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      const templatePath = path.join(testDir, 'template.sdt');

      await expect(async () => {
        try {
          await cli.run(['-D', 'nonexistent.json', '-s', templatePath]);
        } catch (e) {
          if ((e as Error).message !== 'process.exit called') {
            throw e;
          }
        }
      }).rejects.toThrow();

      exitSpy.mockRestore();
    });

    it('should handle unknown option', async () => {
      const cli = new StampdownCLI();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await cli.run(['--unknown-option']);
      } catch (e) {
        // Expected
      }

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown option'));
      expect(exitSpy).toHaveBeenCalledWith(1);

      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });
});
