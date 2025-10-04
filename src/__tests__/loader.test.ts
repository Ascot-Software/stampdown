/**
 * Tests for TemplateLoader
 */

import { TemplateLoader } from '../loader';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const TEST_DIR = join(__dirname, '__test_templates__');

describe('TemplateLoader', () => {
  beforeAll(() => {
    // Create test directory and templates
    mkdirSync(TEST_DIR, { recursive: true });

    writeFileSync(join(TEST_DIR, 'simple.sdt'), 'Hello {{name}}!');

    writeFileSync(join(TEST_DIR, 'conditional.sdt'), '{{#if show}}Visible{{else}}Hidden{{/if}}');

    writeFileSync(join(TEST_DIR, 'loop.sdt'), '{{#each items}}- {{this}}\n{{/each}}');
  });

  afterAll(() => {
    // Clean up test directory
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('load', () => {
    it('should load and compile a template file', async () => {
      const loader = new TemplateLoader();
      const template = await loader.load(join(TEST_DIR, 'simple.sdt'));

      expect(template).toBeDefined();
      expect(template.source).toBe('Hello {{name}}!');
      expect(template.render({ name: 'World' })).toBe('Hello World!');
    });

    it('should cache loaded templates by default', async () => {
      const loader = new TemplateLoader();
      const template1 = await loader.load(join(TEST_DIR, 'simple.sdt'));
      const template2 = await loader.load(join(TEST_DIR, 'simple.sdt'));

      expect(template1).toBe(template2);
    });

    it('should not cache when useCache is false', async () => {
      const loader = new TemplateLoader();
      const template1 = await loader.load(join(TEST_DIR, 'simple.sdt'), false);
      const template2 = await loader.load(join(TEST_DIR, 'simple.sdt'), false);

      expect(template1).not.toBe(template2);
    });
  });

  describe('loadSync', () => {
    it('should load and compile a template file synchronously', () => {
      const loader = new TemplateLoader();
      const template = loader.loadSync(join(TEST_DIR, 'simple.sdt'));

      expect(template).toBeDefined();
      expect(template.source).toBe('Hello {{name}}!');
      expect(template.render({ name: 'Sync' })).toBe('Hello Sync!');
    });
  });

  describe('compile', () => {
    it('should compile a template string', () => {
      const loader = new TemplateLoader();
      const template = loader.compile('Hello {{name}}!');

      expect(template.render({ name: 'Compiled' })).toBe('Hello Compiled!');
    });

    it('should work with block helpers', () => {
      const loader = new TemplateLoader();
      const template = loader.compile('{{#if show}}Yes{{else}}No{{/if}}');

      expect(template.render({ show: true })).toBe('Yes');
      expect(template.render({ show: false })).toBe('No');
    });
  });

  describe('clearCache', () => {
    it('should clear specific cached template', async () => {
      const loader = new TemplateLoader();
      const template1 = await loader.load(join(TEST_DIR, 'simple.sdt'));

      loader.clearCache(join(TEST_DIR, 'simple.sdt'));

      const template2 = await loader.load(join(TEST_DIR, 'simple.sdt'));

      expect(template1).not.toBe(template2);
    });

    it('should clear all cached templates', async () => {
      const loader = new TemplateLoader();
      await loader.load(join(TEST_DIR, 'simple.sdt'));
      await loader.load(join(TEST_DIR, 'conditional.sdt'));

      loader.clearCache();

      const template1 = await loader.load(join(TEST_DIR, 'simple.sdt'));
      const template2 = await loader.load(join(TEST_DIR, 'conditional.sdt'));

      // Should be newly loaded instances
      expect(template1).toBeDefined();
      expect(template2).toBeDefined();
    });
  });

  describe('with options', () => {
    it('should use custom helpers', () => {
      const loader = new TemplateLoader({
        helpers: {
          uppercase: (_context, _options, text): string => {
            return String(text).toUpperCase();
          },
        },
      });

      const template = loader.compile('{{#uppercase name}}{{/uppercase}}');
      expect(template.render({ name: 'hello' })).toBe('HELLO');
    });

    it('should use partials', () => {
      const loader = new TemplateLoader({
        partials: {
          header: '# {{title}}',
        },
      });

      const template = loader.compile('{{>header}}\n\nContent');
      expect(template.render({ title: 'My Title' })).toBe('# My Title\n\nContent');
    });
  });

  describe('template rendering', () => {
    it('should render conditional templates', async () => {
      const loader = new TemplateLoader();
      const template = await loader.load(join(TEST_DIR, 'conditional.sdt'));

      expect(template.render({ show: true })).toBe('Visible');
      expect(template.render({ show: false })).toBe('Hidden');
    });

    it('should render loop templates', async () => {
      const loader = new TemplateLoader();
      const template = await loader.load(join(TEST_DIR, 'loop.sdt'));

      const result = template.render({ items: ['A', 'B', 'C'] });
      expect(result).toBe('- A\n- B\n- C\n');
    });

    it('should render with nested data', () => {
      const loader = new TemplateLoader();
      const template = loader.compile('{{user.name}} ({{user.email}})');

      const result = template.render({
        user: {
          name: 'Alice',
          email: 'alice@example.com',
        },
      });

      expect(result).toBe('Alice (alice@example.com)');
    });
  });

  describe('getStampdown', () => {
    it('should return the Stampdown instance', () => {
      const loader = new TemplateLoader();
      const stampdown = loader.getStampdown();

      expect(stampdown).toBeDefined();
      expect(typeof stampdown.render).toBe('function');
    });

    it('should allow registering helpers dynamically', () => {
      const loader = new TemplateLoader();
      const stampdown = loader.getStampdown();

      stampdown.registerHelper('double', (_context, _options, num): string => {
        return String(Number(num) * 2);
      });

      const template = loader.compile('{{#double value}}{{/double}}');
      expect(template.render({ value: 5 })).toBe('10');
    });
  });
});
