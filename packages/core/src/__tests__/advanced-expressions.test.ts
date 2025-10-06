/**
 * Advanced Expressions Test Suite
 * Tests for subexpressions, else-if chaining, and comparison operators
 */

import { Stampdown } from '../stampdown';

describe('Advanced Expressions', () => {
  describe('Comparison Operators', () => {
    let stampdown: Stampdown;

    beforeEach(() => {
      stampdown = new Stampdown();
    });

    it('should support === operator', () => {
      const template = '{{#if name === "Alice"}}Match{{else}}No match{{/if}}';
      expect(stampdown.render(template, { name: 'Alice' })).toBe('Match');
      expect(stampdown.render(template, { name: 'Bob' })).toBe('No match');
    });

    it('should support !== operator', () => {
      const template = '{{#if name !== "Alice"}}Different{{else}}Same{{/if}}';
      expect(stampdown.render(template, { name: 'Bob' })).toBe('Different');
      expect(stampdown.render(template, { name: 'Alice' })).toBe('Same');
    });

    it('should support == operator', () => {
      const template = '{{#if count == 5}}Match{{else}}No match{{/if}}';
      expect(stampdown.render(template, { count: 5 })).toBe('Match');
      expect(stampdown.render(template, { count: '5' })).toBe('Match');
    });

    it('should support != operator', () => {
      const template = '{{#if count != 5}}Different{{else}}Same{{/if}}';
      expect(stampdown.render(template, { count: 3 })).toBe('Different');
      expect(stampdown.render(template, { count: 5 })).toBe('Same');
    });

    it('should support > operator', () => {
      const template = '{{#if age > 18}}Adult{{else}}Minor{{/if}}';
      expect(stampdown.render(template, { age: 25 })).toBe('Adult');
      expect(stampdown.render(template, { age: 15 })).toBe('Minor');
    });

    it('should support < operator', () => {
      const template = '{{#if age < 18}}Minor{{else}}Adult{{/if}}';
      expect(stampdown.render(template, { age: 15 })).toBe('Minor');
      expect(stampdown.render(template, { age: 25 })).toBe('Adult');
    });

    it('should support >= operator', () => {
      const template = '{{#if age >= 18}}Adult{{else}}Minor{{/if}}';
      expect(stampdown.render(template, { age: 18 })).toBe('Adult');
      expect(stampdown.render(template, { age: 15 })).toBe('Minor');
    });

    it('should support <= operator', () => {
      const template = '{{#if age <= 18}}Young{{else}}Older{{/if}}';
      expect(stampdown.render(template, { age: 18 })).toBe('Young');
      expect(stampdown.render(template, { age: 25 })).toBe('Older');
    });

    it('should support && operator', () => {
      const template = '{{#if premium && active}}VIP{{else}}Regular{{/if}}';
      expect(stampdown.render(template, { premium: true, active: true })).toBe('VIP');
      expect(stampdown.render(template, { premium: true, active: false })).toBe('Regular');
    });

    it('should support || operator', () => {
      const template = '{{#if premium || trial}}Access{{else}}No access{{/if}}';
      expect(stampdown.render(template, { premium: false, trial: true })).toBe('Access');
      expect(stampdown.render(template, { premium: false, trial: false })).toBe('No access');
    });

    it('should support ! operator', () => {
      const template = '{{#if !disabled}}Enabled{{else}}Disabled{{/if}}';
      expect(stampdown.render(template, { disabled: false })).toBe('Enabled');
      expect(stampdown.render(template, { disabled: true })).toBe('Disabled');
    });

    it('should handle comparison with quoted strings', () => {
      const template = '{{#if tier === "gold"}}Gold{{else}}Other{{/if}}';
      expect(stampdown.render(template, { tier: 'gold' })).toBe('Gold');
      expect(stampdown.render(template, { tier: 'silver' })).toBe('Other');
    });

    it('should handle comparison with numbers', () => {
      const template = '{{#if count > 5}}Many{{else}}Few{{/if}}';
      expect(stampdown.render(template, { count: 10 })).toBe('Many');
      expect(stampdown.render(template, { count: 3 })).toBe('Few');
    });
  });

  describe('Else If Chaining', () => {
    let stampdown: Stampdown;

    beforeEach(() => {
      stampdown = new Stampdown();
    });

    it('should support else if with simple condition', () => {
      const template = `
{{#if tier === "gold"}}
Gold member
{{else if tier === "silver"}}
Silver member
{{else}}
Bronze member
{{/if}}
      `.trim();

      expect(stampdown.render(template, { tier: 'gold' }).trim()).toBe('Gold member');
      expect(stampdown.render(template, { tier: 'silver' }).trim()).toBe('Silver member');
      expect(stampdown.render(template, { tier: 'bronze' }).trim()).toBe('Bronze member');
    });

    it('should support multiple else if conditions', () => {
      const template = `
{{#if score >= 90}}
A
{{else if score >= 80}}
B
{{else if score >= 70}}
C
{{else if score >= 60}}
D
{{else}}
F
{{/if}}
      `.trim();

      expect(stampdown.render(template, { score: 95 }).trim()).toBe('A');
      expect(stampdown.render(template, { score: 85 }).trim()).toBe('B');
      expect(stampdown.render(template, { score: 75 }).trim()).toBe('C');
      expect(stampdown.render(template, { score: 65 }).trim()).toBe('D');
      expect(stampdown.render(template, { score: 50 }).trim()).toBe('F');
    });

    it('should support else if with boolean conditions', () => {
      const template = `
{{#if premium}}
Premium
{{else if trial}}
Trial
{{else}}
Free
{{/if}}
      `.trim();

      expect(stampdown.render(template, { premium: true, trial: false }).trim()).toBe('Premium');
      expect(stampdown.render(template, { premium: false, trial: true }).trim()).toBe('Trial');
      expect(stampdown.render(template, { premium: false, trial: false }).trim()).toBe('Free');
    });

    it('should support else if with complex expressions', () => {
      const template = `
{{#if age < 13}}
Child
{{else if age >= 13 && age < 18}}
Teen
{{else if age >= 18 && age < 65}}
Adult
{{else}}
Senior
{{/if}}
      `.trim();

      expect(stampdown.render(template, { age: 10 }).trim()).toBe('Child');
      expect(stampdown.render(template, { age: 15 }).trim()).toBe('Teen');
      expect(stampdown.render(template, { age: 30 }).trim()).toBe('Adult');
      expect(stampdown.render(template, { age: 70 }).trim()).toBe('Senior');
    });
  });

  describe('Subexpressions', () => {
    let stampdown: Stampdown;

    beforeEach(() => {
      stampdown = new Stampdown();

      // Register helper functions for testing
      stampdown.registerHelper('gt', (_ctx, _opts, a, b) => {
        return String(Number(a) > Number(b));
      });

      stampdown.registerHelper('lt', (_ctx, _opts, a, b) => {
        return String(Number(a) < Number(b));
      });

      stampdown.registerHelper('add', (_ctx, _opts, a, b) => {
        return String(Number(a) + Number(b));
      });

      stampdown.registerHelper('multiply', (_ctx, _opts, a, b) => {
        return String(Number(a) * Number(b));
      });

      stampdown.registerHelper('length', (_ctx, _opts, val) => {
        if (Array.isArray(val)) return String(val.length);
        if (typeof val === 'string') return String(val.length);
        if (val && typeof val === 'object') return String(Object.keys(val).length);
        return '0';
      });

      stampdown.registerHelper('uppercase', (_ctx, _opts, str) => {
        return String(str).toUpperCase();
      });

      stampdown.registerHelper('concat', (_ctx, _opts, ...args) => {
        return args.join('');
      });
    });

    it('should support simple subexpressions', () => {
      const template = '{{#if (gt count 5)}}Many{{else}}Few{{/if}}';
      expect(stampdown.render(template, { count: 10 })).toBe('Many');
      expect(stampdown.render(template, { count: 3 })).toBe('Few');
    });

    it('should support nested subexpressions', () => {
      const template = '{{#if (gt (length items) 2)}}Many{{else}}Few{{/if}}';
      expect(stampdown.render(template, { items: [1, 2, 3, 4] })).toBe('Many');
      expect(stampdown.render(template, { items: [1] })).toBe('Few');
    });

    it('should support subexpressions with multiple nesting levels', () => {
      const template = '{{#if (gt (add (length items) 2) 5)}}Yes{{else}}No{{/if}}';
      expect(stampdown.render(template, { items: [1, 2, 3, 4] })).toBe('Yes'); // length=4, add 2 = 6, gt 5 = true
      expect(stampdown.render(template, { items: [1, 2] })).toBe('No'); // length=2, add 2 = 4, gt 5 = false
    });

    it('should support subexpressions in regular expressions', () => {
      const template = 'Result: {{uppercase (concat "hello" " " "world")}}';
      expect(stampdown.render(template, {})).toBe('Result: HELLO WORLD');
    });

    it('should support subexpressions with literal values', () => {
      const template = '{{#if (gt 10 5)}}Yes{{else}}No{{/if}}';
      expect(stampdown.render(template, {})).toBe('Yes');
    });

    it('should support subexpressions with quoted strings', () => {
      const template = '{{concat (uppercase "hello") " world"}}';
      expect(stampdown.render(template, {})).toBe('HELLO world');
    });

    it('should support multiple subexpressions in one helper', () => {
      const template = '{{#if (gt (add 2 3) (multiply 1 2))}}Yes{{else}}No{{/if}}';
      expect(stampdown.render(template, {})).toBe('Yes'); // 5 > 2 = true
    });

    it('should support subexpressions with context variables', () => {
      const template = '{{uppercase (concat firstName " " lastName)}}';
      expect(stampdown.render(template, { firstName: 'John', lastName: 'Doe' })).toBe('JOHN DOE');
    });
  });

  describe('Combined Advanced Features', () => {
    let stampdown: Stampdown;

    beforeEach(() => {
      stampdown = new Stampdown();

      stampdown.registerHelper('length', (_ctx, _opts, val) => {
        if (Array.isArray(val)) return String(val.length);
        if (typeof val === 'string') return String(val.length);
        return '0';
      });

      stampdown.registerHelper('gt', (_ctx, _opts, a, b) => String(Number(a) > Number(b)));
    });

    it('should support subexpressions with else if', () => {
      const template = `
{{#if (gt (length items) 10)}}
Many items
{{else if (gt (length items) 5)}}
Some items
{{else}}
Few items
{{/if}}
      `.trim();

      expect(stampdown.render(template, { items: new Array(12) }).trim()).toBe('Many items');
      expect(stampdown.render(template, { items: new Array(7) }).trim()).toBe('Some items');
      expect(stampdown.render(template, { items: new Array(3) }).trim()).toBe('Few items');
    });

    it('should support comparison operators with else if', () => {
      const template = `
{{#if tier === "gold" && active}}
Active Gold
{{else if tier === "gold"}}
Inactive Gold
{{else if tier === "silver" && active}}
Active Silver
{{else}}
Other
{{/if}}
      `.trim();

      expect(stampdown.render(template, { tier: 'gold', active: true }).trim()).toBe('Active Gold');
      expect(stampdown.render(template, { tier: 'gold', active: false }).trim()).toBe(
        'Inactive Gold'
      );
      expect(stampdown.render(template, { tier: 'silver', active: true }).trim()).toBe(
        'Active Silver'
      );
      expect(stampdown.render(template, { tier: 'bronze', active: false }).trim()).toBe('Other');
    });
  });
});
