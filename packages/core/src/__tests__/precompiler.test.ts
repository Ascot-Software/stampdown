/**
 * Tests for the precompiler
 */

import { Stampdown } from '../stampdown';
import { Precompiler } from '../precompiler';

describe('Precompiler', () => {
  let precompiler: Precompiler;
  let stampdown: Stampdown;

  beforeEach(() => {
    precompiler = new Precompiler();
    stampdown = new Stampdown();
  });

  describe('precompile', () => {
    it('should precompile a simple template', () => {
      const template = 'Hello {{name}}!';
      const result = precompiler.precompile(template);

      expect(result.code).toContain('const renderer = stampdown.getRenderer()');
      expect(result.code).toContain('output');
      expect(result.code).toContain('return output');
      expect(result.source).toBe(template);
      expect(result.usedHelpers).toEqual([]);
    });

    it('should extract helpers from template', () => {
      const template = '{{#if condition}}Yes{{else}}No{{/if}}';
      const result = precompiler.precompile(template);

      expect(result.usedHelpers).toContain('if');
    });

    it('should precompile with known helpers', () => {
      const template = '{{#if test}}Content{{/if}}';
      const result = precompiler.precompile(template, {
        knownHelpers: ['if', 'each'],
      });

      expect(result.usedHelpers).toContain('if');
    });

    it('should warn about unknown helpers in non-strict mode', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const template = '{{#customHelper}}Content{{/customHelper}}';

      precompiler.precompile(template, {
        knownHelpers: ['if', 'each'],
        strict: false,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown helpers: customHelper')
      );
      consoleSpy.mockRestore();
    });

    it('should throw error for unknown helpers in strict mode', () => {
      const template = '{{#customHelper}}Content{{/customHelper}}';

      expect(() => {
        precompiler.precompile(template, {
          knownHelpers: ['if', 'each'],
          strict: true,
        });
      }).toThrow('Unknown helpers: customHelper');
    });

    it('should accept "all" as known helpers', () => {
      const template = '{{#customHelper}}Content{{/customHelper}}';
      const result = precompiler.precompile(template, {
        knownHelpers: 'all',
      });

      expect(result.usedHelpers).toContain('customHelper');
    });

    it('should include templateId in result', () => {
      const template = 'Test template';
      const result = precompiler.precompile(template, {
        templateId: 'my-template',
      });

      expect(result.templateId).toBe('my-template');
    });

    it('should generate source map when requested', () => {
      const template = 'Test template';
      const result = precompiler.precompile(template, {
        sourceMap: true,
      });

      expect(result.sourceMap).toBeDefined();
      expect(typeof result.sourceMap).toBe('string');
    });
  });

  describe('Template registration and rendering', () => {
    it('should register and render a precompiled template', () => {
      const template = 'Hello {{name}}!';
      const compiled = precompiler.precompile(template, {
        templateId: 'greeting',
      });

      // Create the function from the generated code

      const templateFn = new Function('context', 'stampdown', compiled.code) as (
        context: unknown,
        stampdown: Stampdown
      ) => string;

      stampdown.registerPrecompiledTemplate('greeting', templateFn);

      const result = stampdown.renderPrecompiled('greeting', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should throw error for missing precompiled template', () => {
      expect(() => {
        stampdown.renderPrecompiled('nonexistent', {});
      }).toThrow('Precompiled template "nonexistent" not found');
    });

    it('should check if precompiled template exists', () => {
      const templateFn = (): string => 'test';
      stampdown.registerPrecompiledTemplate('test', templateFn);

      expect(stampdown.hasPrecompiledTemplate('test')).toBe(true);
      expect(stampdown.hasPrecompiledTemplate('missing')).toBe(false);
    });

    it('should get all precompiled template IDs', () => {
      stampdown.registerPrecompiledTemplate('template1', () => '1');
      stampdown.registerPrecompiledTemplate('template2', () => '2');

      const ids = stampdown.getPrecompiledTemplateIds();
      expect(ids).toContain('template1');
      expect(ids).toContain('template2');
      expect(ids.length).toBe(2);
    });
  });

  describe('Helper integration', () => {
    it('should work with built-in helpers', () => {
      const template = '{{#if condition}}True{{else}}False{{/if}}';
      const compiled = precompiler.precompile(template);

      const templateFn = new Function('context', 'stampdown', compiled.code) as (
        context: unknown,
        stampdown: Stampdown
      ) => string;

      stampdown.registerPrecompiledTemplate('conditional', templateFn);

      const resultTrue = stampdown.renderPrecompiled('conditional', {
        condition: true,
      });
      const resultFalse = stampdown.renderPrecompiled('conditional', {
        condition: false,
      });

      expect(resultTrue).toBe('True');
      expect(resultFalse).toBe('False');
    });

    it('should work with custom helpers', () => {
      stampdown.registerHelper('uppercase', (_ctx, _opts, text) => {
        return String(text).toUpperCase();
      });

      const template = '{{#uppercase name}}{{/uppercase}}';
      const compiled = precompiler.precompile(template);

      const templateFn = new Function('context', 'stampdown', compiled.code) as (
        context: unknown,
        stampdown: Stampdown
      ) => string;

      stampdown.registerPrecompiledTemplate('upper', templateFn);

      const result = stampdown.renderPrecompiled('upper', { name: 'hello' });
      expect(result).toBe('HELLO');
    });
  });
});
