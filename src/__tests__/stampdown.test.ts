/**
 * Tests for Stampdown main class
 */

import { Stampdown } from '../stampdown';

describe('Stampdown', () => {
  describe('Basic Expressions', () => {
    it('should render simple variable expressions', () => {
      const stampdown = new Stampdown();
      const result = stampdown.render('Hello {{name}}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should render nested property access', () => {
      const stampdown = new Stampdown();
      const result = stampdown.render('Hello {{user.name}}!', {
        user: { name: 'Alice' },
      });
      expect(result).toBe('Hello Alice!');
    });

    it('should handle missing variables gracefully', () => {
      const stampdown = new Stampdown();
      const result = stampdown.render('Hello {{name}}!', {});
      expect(result).toBe('Hello !');
    });
  });

  describe('Built-in Helpers', () => {
    it('should handle if helper with truthy condition', () => {
      const stampdown = new Stampdown();
      const template = '{{#if show}}Visible{{/if}}';
      const result = stampdown.render(template, { show: true });
      expect(result).toBe('Visible');
    });

    it('should handle if helper with falsy condition', () => {
      const stampdown = new Stampdown();
      const template = '{{#if show}}Visible{{/if}}';
      const result = stampdown.render(template, { show: false });
      expect(result).toBe('');
    });

    it('should handle if/else helper', () => {
      const stampdown = new Stampdown();
      const template = '{{#if show}}Yes{{else}}No{{/if}}';
      expect(stampdown.render(template, { show: true })).toBe('Yes');
      expect(stampdown.render(template, { show: false })).toBe('No');
    });

    it('should handle each helper with array', () => {
      const stampdown = new Stampdown();
      const template = '{{#each items}}- {{this}}\n{{/each}}';
      const result = stampdown.render(template, { items: ['a', 'b', 'c'] });
      expect(result).toBe('- a\n- b\n- c\n');
    });

    it('should handle unless helper', () => {
      const stampdown = new Stampdown();
      const template = '{{#unless hide}}Visible{{/unless}}';
      expect(stampdown.render(template, { hide: false })).toBe('Visible');
      expect(stampdown.render(template, { hide: true })).toBe('');
    });
  });

  describe('Partials', () => {
    it('should render registered partials', () => {
      const stampdown = new Stampdown({
        partials: {
          header: '# {{title}}',
        },
      });
      const result = stampdown.render('{{>header}}', { title: 'My Title' });
      expect(result).toBe('# My Title');
    });

    it('should register partials dynamically', () => {
      const stampdown = new Stampdown();
      stampdown.registerPartial('footer', '---\n{{copyright}}');
      const result = stampdown.render('{{>footer}}', { copyright: '© 2025' });
      expect(result).toBe('---\n© 2025');
    });
  });

  describe('Custom Helpers', () => {
    it('should register and use custom helpers', () => {
      const stampdown = new Stampdown({
        helpers: {
          uppercase: (_context, _options, text): string => {
            return String(text).toUpperCase();
          },
        },
      });
      const result = stampdown.render('{{#uppercase name}}{{/uppercase}}', { name: 'hello' });
      expect(result).toBe('HELLO');
    });
  });

  describe('Hooks', () => {
    it('should apply preprocessing hooks', () => {
      const stampdown = new Stampdown({
        hooks: {
          preProcess: [(input): string => input.replace(/XXX/g, 'YYY')],
        },
      });
      const result = stampdown.render('XXX {{name}}', { name: 'test' });
      expect(result).toBe('YYY test');
    });

    it('should apply postprocessing hooks', () => {
      const stampdown = new Stampdown({
        hooks: {
          postProcess: [(output): string => output.toUpperCase()],
        },
      });
      const result = stampdown.render('hello {{name}}', { name: 'world' });
      expect(result).toBe('HELLO WORLD');
    });
  });

  describe('Self-Closing Blocks', () => {
    it('should handle self-closing block helpers', () => {
      const stampdown = new Stampdown({
        helpers: {
          uppercase: (_context, _options, text): string => {
            return String(text).toUpperCase();
          },
        },
      });
      const result = stampdown.render('{{#uppercase name/}}', { name: 'hello' });
      expect(result).toBe('HELLO');
    });

    it('should handle self-closing blocks with multiple arguments', () => {
      const stampdown = new Stampdown({
        helpers: {
          add: (_context, _options, a, b): string => {
            return String(Number(a) + Number(b));
          },
        },
      });
      const result = stampdown.render('{{#add 5 3/}}', {});
      expect(result).toBe('8');
    });

    it('should handle self-closing blocks with variable arguments', () => {
      const stampdown = new Stampdown({
        helpers: {
          multiply: (_context, _options, a, b): string => {
            return String(Number(a) * Number(b));
          },
        },
      });
      const result = stampdown.render('{{#multiply x y/}}', { x: 6, y: 7 });
      expect(result).toBe('42');
    });

    it('should work with built-in plugins using self-closing syntax', () => {
      const stampdown = new Stampdown({
        helpers: {
          lowercase: (_context, _options, text): string => {
            return String(text).toLowerCase();
          },
          capitalize: (_context, _options, text): string => {
            const str = String(text);
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
          },
        },
      });

      expect(stampdown.render('{{#lowercase text/}}', { text: 'HELLO' })).toBe('hello');
      expect(stampdown.render('{{#capitalize text/}}', { text: 'hello world' })).toBe(
        'Hello world'
      );
    });

    it('should handle self-closing blocks in combination with regular syntax', () => {
      const stampdown = new Stampdown({
        helpers: {
          uppercase: (_context, _options, text): string => {
            return String(text).toUpperCase();
          },
        },
      });
      const template = 'Hello {{#uppercase name/}}, welcome to {{#uppercase place/}}!';
      const result = stampdown.render(template, { name: 'alice', place: 'wonderland' });
      expect(result).toBe('Hello ALICE, welcome to WONDERLAND!');
    });

    it('should handle self-closing blocks with expressions as arguments', () => {
      const stampdown = new Stampdown({
        helpers: {
          double: (_context, _options, num): string => {
            return String(Number(num) * 2);
          },
        },
      });
      const result = stampdown.render('{{#double user.age/}}', { user: { age: 21 } });
      expect(result).toBe('42');
    });
  });
});
