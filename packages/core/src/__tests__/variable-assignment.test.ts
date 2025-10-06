/**
 * Variable Assignment Tests
 * Tests for context variable assignment feature
 */

import { Stampdown } from '../stampdown';

describe('Variable Assignment', () => {
  let stampdown: Stampdown;

  beforeEach(() => {
    stampdown = new Stampdown();
  });

  describe('Basic Assignments', () => {
    it('should assign a literal number', () => {
      const template = '{{ x = 5 }}{{x}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('5');
    });

    it('should assign a literal string', () => {
      const template = '{{ name = "Alice" }}{{name}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('Alice');
    });

    it('should assign a literal boolean', () => {
      const template = '{{ active = true }}{{active}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('true');
    });

    it('should assign null', () => {
      const template = '{{ value = null }}{{value}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('');
    });

    it('should assign undefined', () => {
      const template = '{{ value = undefined }}{{value}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('');
    });
  });

  describe('Variable Assignments', () => {
    it('should assign from another variable', () => {
      const template = '{{ x = y }}{{x}}';
      const result = stampdown.render(template, { y: 42 });
      expect(result).toBe('42');
    });

    it('should assign from nested property', () => {
      const template = '{{ name = user.name }}{{name}}';
      const result = stampdown.render(template, { user: { name: 'Bob' } });
      expect(result).toBe('Bob');
    });

    it('should allow reassignment', () => {
      const template = '{{ x = 5 }}{{x}}{{ x = 10 }}{{x}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('510');
    });
  });

  describe('Template Literals', () => {
    it('should evaluate template literal with single interpolation', () => {
      const template = '{{ greeting = `Hello ${name}` }}{{greeting}}';
      const result = stampdown.render(template, { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should evaluate template literal with multiple interpolations', () => {
      const template = '{{ fullName = `${firstName} ${lastName}` }}{{fullName}}';
      const result = stampdown.render(template, { firstName: 'John', lastName: 'Doe' });
      expect(result).toBe('John Doe');
    });

    it('should evaluate template literal with nested property access', () => {
      const template = '{{ info = `${user.name} - ${user.email}` }}{{info}}';
      const result = stampdown.render(template, {
        user: { name: 'Alice', email: 'alice@example.com' },
      });
      expect(result).toBe('Alice - alice@example.com');
    });

    it('should handle template literal with expressions', () => {
      const template = '{{ result = `Sum: ${a} + ${b} = ${a + b}` }}{{result}}';
      const result = stampdown.render(template, { a: 5, b: 3 });
      expect(result).toBe('Sum: 5 + 3 = 8');
    });

    it('should handle empty template literal', () => {
      const template = '{{ empty = `` }}{{empty}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('');
    });

    it('should handle template literal with only text', () => {
      const template = '{{ text = `plain text` }}{{text}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('plain text');
    });
  });

  describe('Nested Property Assignment', () => {
    it('should assign to this.property', () => {
      const template = '{{ this.computed = 42 }}{{this.computed}}';
      const context = {};
      const result = stampdown.render(template, context);
      expect(result).toBe('42');
      expect(context).toEqual({ computed: 42 });
    });

    it('should create nested object if needed', () => {
      const template = '{{ user.name = "Charlie" }}{{user.name}}';
      const context = {};
      const result = stampdown.render(template, context);
      expect(result).toBe('Charlie');
      expect(context).toEqual({ user: { name: 'Charlie' } });
    });

    it('should assign to deeply nested property', () => {
      const template = '{{ data.user.profile.age = 30 }}{{data.user.profile.age}}';
      const context = {};
      const result = stampdown.render(template, context);
      expect(result).toBe('30');
      expect(context).toEqual({ data: { user: { profile: { age: 30 } } } });
    });
  });

  describe('Assignments in Block Helpers', () => {
    it('should work inside #if blocks', () => {
      const template = `
{{#if premium}}
  {{ discount = 20 }}
{{else}}
  {{ discount = 0 }}
{{/if}}
Discount: {{discount}}%
`.trim();
      const result1 = stampdown.render(template, { premium: true });
      expect(result1).toContain('Discount: 20%');

      const result2 = stampdown.render(template, { premium: false });
      expect(result2).toContain('Discount: 0%');
    });

    it('should work inside #each blocks', () => {
      const template = `
{{#each users}}
  {{ this.fullName = \`\${this.firstName} \${this.lastName}\` }}
  - {{this.fullName}}
{{/each}}
`.trim();
      const context = {
        users: [
          { firstName: 'John', lastName: 'Doe' },
          { firstName: 'Jane', lastName: 'Smith' },
        ],
      };
      const result = stampdown.render(template, context);
      expect(result).toContain('John Doe');
      expect(result).toContain('Jane Smith');
      // Check that context was mutated
      expect(context.users[0]).toHaveProperty('fullName', 'John Doe');
      expect(context.users[1]).toHaveProperty('fullName', 'Jane Smith');
    });

    it('should work inside #with blocks', () => {
      const template = `
{{#with user}}
  {{ this.displayName = \`\${this.firstName} \${this.lastName}\` }}
  {{this.displayName}}
{{/with}}
`.trim();
      const context = {
        user: { firstName: 'Alice', lastName: 'Johnson' },
      };
      const result = stampdown.render(template, context);
      expect(result).toContain('Alice Johnson');
      expect(context.user).toHaveProperty('displayName', 'Alice Johnson');
    });
  });

  describe('Complex Expressions', () => {
    it('should assign comparison result', () => {
      const template = '{{ isAdult = age >= 18 }}{{isAdult}}';
      const result1 = stampdown.render(template, { age: 25 });
      expect(result1).toBe('true');

      const result2 = stampdown.render(template, { age: 15 });
      expect(result2).toBe('false');
    });

    it('should assign logical AND result', () => {
      const template = '{{ eligible = premium && verified }}{{eligible}}';
      const result = stampdown.render(template, { premium: true, verified: true });
      expect(result).toBe('true');
    });

    it('should assign logical OR result', () => {
      const template = '{{ hasAccess = isAdmin || isPremium }}{{hasAccess}}';
      const result = stampdown.render(template, { isAdmin: false, isPremium: true });
      expect(result).toBe('true');
    });
  });

  describe('Assignment Without Output', () => {
    it('should not produce output', () => {
      const template = 'Before{{ x = 5 }}After';
      const result = stampdown.render(template, {});
      expect(result).toBe('BeforeAfter');
    });

    it('should work with multiple assignments', () => {
      const template = '{{ x = 1 }}{{ y = 2 }}{{ z = 3 }}{{x}},{{y}},{{z}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('1,2,3');
    });
  });

  describe('Edge Cases', () => {
    it('should handle assignment with whitespace', () => {
      const template = '{{  x  =  5  }}{{x}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('5');
    });

    it('should not confuse with comparison operators', () => {
      const template = '{{#if x === 5}}Equal{{/if}}';
      const result = stampdown.render(template, { x: 5 });
      expect(result).toBe('Equal');
    });

    it('should not confuse with != operator', () => {
      const template = '{{#if x != 5}}Not equal{{/if}}';
      const result = stampdown.render(template, { x: 3 });
      expect(result).toBe('Not equal');
    });

    it('should handle template literal with escape sequences', () => {
      const template = '{{ text = `Line 1\\nLine 2` }}{{text}}';
      const result = stampdown.render(template, {});
      expect(result).toBe('Line 1\nLine 2');
    });

    it('should handle nested ${...} in template literals', () => {
      const template = '{{ result = `Value: ${value}` }}{{result}}';
      const result = stampdown.render(template, { value: 100 });
      expect(result).toBe('Value: 100');
    });
  });

  describe('Context Persistence', () => {
    it('should persist variables across template', () => {
      const template = `
{{ total = 0 }}
{{#each items}}
  {{ total = total + this.price }}
{{/each}}
Total: {{total}}
`.trim();
      const context = {
        items: [{ price: 10 }, { price: 20 }, { price: 30 }],
      };
      const result = stampdown.render(template, context);
      expect(result).toContain('Total: 60');
    });

    it('should make assigned variables available in later expressions', () => {
      const template = `
{{ x = 5 }}
{{ y = x + 10 }}
{{ z = y * 2 }}
Result: {{z}}
`.trim();
      const result = stampdown.render(template, {});
      expect(result).toContain('Result: 30');
    });
  });

  describe('User Examples', () => {
    it('should work with top-level variable example', () => {
      const template = '{{ topLevelVariable = true }}{{topLevelVariable}}';
      const context = {};
      const result = stampdown.render(template, context);
      expect(result).toBe('true');
      expect(context).toHaveProperty('topLevelVariable', true);
    });

    it('should work with each loop example', () => {
      const template = `
{{#each users}}
  {{ this.fullName = \`\${this.firstName} \${this.lastName}\` }}
  {{this.fullName}}
{{/each}}
`.trim();
      const context = {
        users: [
          { firstName: 'Alice', lastName: 'Wonder' },
          { firstName: 'Bob', lastName: 'Builder' },
        ],
      };
      const result = stampdown.render(template, context);
      expect(result).toContain('Alice Wonder');
      expect(result).toContain('Bob Builder');
      expect((context.users[0] as Record<string, unknown>).fullName).toBe('Alice Wonder');
      expect((context.users[1] as Record<string, unknown>).fullName).toBe('Bob Builder');
    });
  });
});
