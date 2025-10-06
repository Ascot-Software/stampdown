/**
 * Tests for advanced partial features
 */

import { Stampdown } from '../stampdown';

describe('Advanced Partials', () => {
  describe('Dynamic Partials', () => {
    it('should render dynamic partials using expressions', () => {
      const stampdown = new Stampdown({
        partials: {
          greeting: 'Hello {{name}}!',
          farewell: 'Goodbye {{name}}!',
        },
      });

      const template = '{{> (whichPartial) }}';
      const context = {
        whichPartial: 'greeting',
        name: 'World',
      };

      const result = stampdown.render(template, context);
      expect(result).toBe('Hello World!');
    });

    it('should support dynamic partial names from variables', () => {
      const stampdown = new Stampdown({
        partials: {
          userCard: 'User: {{name}}',
          adminCard: 'Admin: {{name}}',
        },
      });

      const template = '{{> (partialName) }}';
      const context = {
        partialName: 'adminCard',
        name: 'Alice',
      };

      const result = stampdown.render(template, context);
      expect(result).toBe('Admin: Alice');
    });
  });

  describe('Partial Contexts', () => {
    it('should render partials with custom context', () => {
      const stampdown = new Stampdown({
        partials: {
          userInfo: 'Name: {{name}}, Age: {{age}}',
        },
      });

      const template = '{{> userInfo person}}';
      const context = {
        person: { name: 'Bob', age: 30 },
        name: 'Ignored',
      };

      const result = stampdown.render(template, context);
      expect(result).toBe('Name: Bob, Age: 30');
    });

    it('should support nested context paths', () => {
      const stampdown = new Stampdown({
        partials: {
          display: 'Value: {{value}}',
        },
      });

      const template = '{{> display data.nested}}';
      const context = {
        data: {
          nested: { value: 'Found it!' },
        },
      };

      const result = stampdown.render(template, context);
      expect(result).toBe('Value: Found it!');
    });
  });

  describe('Partial Parameters', () => {
    it('should pass hash parameters to partials', () => {
      const stampdown = new Stampdown({
        partials: {
          greeting: 'Hello {{title}} {{name}}!',
        },
      });

      const template = '{{> greeting title=Mr name=Smith}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('Hello Mr Smith!');
    });

    it('should evaluate hash parameter values from context', () => {
      const stampdown = new Stampdown({
        partials: {
          profile: 'Name: {{firstName}} {{lastName}}, Number: {{favNumber}}',
        },
      });

      const template = '{{> profile firstName=user.first lastName=user.last favNumber=luckyNum}}';
      const context = {
        user: { first: 'John', last: 'Doe' },
        luckyNum: 42,
      };

      const result = stampdown.render(template, context);
      expect(result).toBe('Name: John Doe, Number: 42');
    });

    it('should combine context and hash parameters', () => {
      const stampdown = new Stampdown({
        partials: {
          card: '{{prefix}}: {{name}} ({{status}})',
        },
      });

      const template = '{{> card person prefix=User}}';
      const context = {
        person: { name: 'Alice', status: 'active' },
      };

      const result = stampdown.render(template, context);
      expect(result).toBe('User: Alice (active)');
    });
  });

  describe('Partial Blocks', () => {
    it('should render failover content when partial not found', () => {
      const stampdown = new Stampdown();

      const template = '{{#> missingPartial}}Fallback content{{/missingPartial}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('Fallback content');
    });

    it('should render partial when found, ignoring failover', () => {
      const stampdown = new Stampdown({
        partials: {
          found: 'Partial content',
        },
      });

      const template = '{{#> found}}Fallback content{{/found}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('Partial content');
    });

    it('should support @partial-block in partial templates', () => {
      const stampdown = new Stampdown({
        partials: {
          layout: '<div class="content">{{> @partial-block}}</div>',
        },
      });

      const template = '{{#> layout}}My Content{{/layout}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('<div class="content">My Content</div>');
    });

    it('should support context variables in @partial-block', () => {
      const stampdown = new Stampdown({
        partials: {
          wrapper: 'Start: {{> @partial-block}} :End',
        },
      });

      const template = '{{#> wrapper}}{{message}}{{/wrapper}}';
      const context = { message: 'Hello' };
      const result = stampdown.render(template, context);
      expect(result).toBe('Start: Hello :End');
    });
  });

  describe('Inline Partials', () => {
    it('should define and use inline partials', () => {
      const stampdown = new Stampdown();

      const template = `
{{#*inline "myPartial"}}
  My Content
{{/inline}}
{{> myPartial}}`.trim();

      const result = stampdown.render(template, {}).trim();
      expect(result).toBe('My Content');
    });

    it('should scope inline partials to blocks', () => {
      const stampdown = new Stampdown();

      const template = `
{{#*inline "test"}}First{{/inline}}
{{> test}}`.trim();

      const result = stampdown.render(template, {}).trim();
      expect(result).toBe('First');
    });

    it('should support layout patterns with inline partials', () => {
      const stampdown = new Stampdown({
        partials: {
          layout: `
<div class="nav">
  {{> nav}}
</div>
<div class="content">
  {{> content}}
</div>`.trim(),
        },
      });

      const template = `
{{#> layout}}
  {{#*inline "nav"}}
    My Nav
  {{/inline}}
  {{#*inline "content"}}
    My Content
  {{/inline}}
{{/layout}}`.trim();

      const result = stampdown.render(template, {});
      expect(result).toContain('My Nav');
      expect(result).toContain('My Content');
    });

    it('should allow inline partials with quoted names', () => {
      const stampdown = new Stampdown();

      const template = `
{{#*inline "my-partial"}}
  Quoted name
{{/inline}}
{{> my-partial}}`.trim();

      const result = stampdown.render(template, {}).trim();
      expect(result).toBe('Quoted name');
    });

    it('should allow inline partials to access parent context', () => {
      const stampdown = new Stampdown();

      const template = `
{{#*inline "showName"}}
  Name: {{name}}
{{/inline}}
{{> showName}}`.trim();

      const context = { name: 'Test' };
      const result = stampdown.render(template, context).trim();
      expect(result).toBe('Name: Test');
    });
  });

  describe('Complex Partial Scenarios', () => {
    it('should handle nested partials with different contexts', () => {
      const stampdown = new Stampdown({
        partials: {
          outer: 'Outer: {{name}}, Inner: {{> inner data}}',
          inner: '{{value}}',
        },
      });

      const template = '{{> outer}}';
      const context = {
        name: 'Parent',
        data: { value: 'Child' },
      };

      const result = stampdown.render(template, context);
      expect(result).toBe('Outer: Parent, Inner: Child');
    });

    it('should support partials with hash parameters in blocks', () => {
      const stampdown = new Stampdown({
        partials: {
          item: '{{prefix}}: {{text}}',
        },
      });

      const template = `
{{#*inline "list"}}
  {{> item prefix=Letter text=value}}
{{/inline}}
{{> list}}`.trim();

      const context = { value: 'A' };
      const result = stampdown.render(template, context).trim();
      expect(result).toBe('Letter: A');
    });
  });
});
