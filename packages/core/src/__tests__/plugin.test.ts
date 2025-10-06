/**
 * Tests for the plugin system
 */

import { Stampdown, createPlugin } from '../index';

describe('Plugin System', () => {
  it('should load and apply a simple plugin', () => {
    const myPlugin = createPlugin({
      name: 'test-plugin',
      plugin: (stampdown) => {
        stampdown.registerHelper('greet', (_ctx, _opts, name) => {
          return `Hello, ${String(name)}!`;
        });
      },
    });

    const stampdown = new Stampdown({
      plugins: [{ plugin: myPlugin }],
    });

    const result = stampdown.render('{{#greet name}}{{/greet}}', { name: 'World' });
    expect(result).toBe('Hello, World!');
  });

  it('should pass options to plugins', () => {
    const myPlugin = createPlugin({
      name: 'configurable-plugin',
      plugin: (stampdown, options) => {
        const prefix = (options?.prefix as string) || 'Default';
        stampdown.registerHelper('prefixed', (_ctx, _opts, text) => {
          return `${prefix}: ${String(text)}`;
        });
      },
    });

    const stampdown = new Stampdown({
      plugins: [{ plugin: myPlugin, options: { prefix: 'Custom' } }],
    });

    const result = stampdown.render('{{#prefixed text}}{{/prefixed}}', { text: 'Message' });
    expect(result).toBe('Custom: Message');
  });

  it('should load multiple plugins', () => {
    const plugin1 = createPlugin({
      name: 'plugin-1',
      plugin: (stampdown) => {
        stampdown.registerHelper('upper', (_ctx, _opts, text) => {
          return String(text).toUpperCase();
        });
      },
    });

    const plugin2 = createPlugin({
      name: 'plugin-2',
      plugin: (stampdown) => {
        stampdown.registerHelper('lower', (_ctx, _opts, text) => {
          return String(text).toLowerCase();
        });
      },
    });

    const stampdown = new Stampdown({
      plugins: [{ plugin: plugin1 }, { plugin: plugin2 }],
    });

    const result = stampdown.render('{{#upper text1}}{{/upper}} {{#lower text2}}{{/lower}}', {
      text1: 'hello',
      text2: 'WORLD',
    });
    expect(result).toBe('HELLO world');
  });

  it('should support plugins adding partials', () => {
    const myPlugin = createPlugin({
      name: 'partial-plugin',
      plugin: (stampdown) => {
        stampdown.registerPartial('header', '# {{title}}');
        stampdown.registerPartial('footer', '---\n© {{year}}');
      },
    });

    const stampdown = new Stampdown({
      plugins: [{ plugin: myPlugin }],
    });

    const result = stampdown.render('{{>header}}\nContent\n{{>footer}}', {
      title: 'My Page',
      year: 2025,
    });
    expect(result).toContain('# My Page');
    expect(result).toContain('© 2025');
  });

  it('should support plugins adding hooks', () => {
    const myPlugin = createPlugin({
      name: 'hook-plugin',
      plugin: (stampdown) => {
        stampdown.addPreProcessHook((template) => {
          return template.replace(/\[VERSION\]/g, '1.0.0');
        });
        stampdown.addPostProcessHook((output) => {
          return output.trim();
        });
      },
    });

    const stampdown = new Stampdown({
      plugins: [{ plugin: myPlugin }],
    });

    const result = stampdown.render('  Version: [VERSION]  ', {});
    expect(result).toBe('Version: 1.0.0');
  });

  it('should throw error for failing plugins', () => {
    const badPlugin = createPlugin({
      name: 'bad-plugin',
      plugin: () => {
        throw new Error('Plugin initialization failed');
      },
    });

    expect(() => {
      new Stampdown({
        plugins: [{ plugin: badPlugin }],
      });
    }).toThrow('Failed to load plugin "bad-plugin": Plugin initialization failed');
  });
});
