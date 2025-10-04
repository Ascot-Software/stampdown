/**
 * Self-Closing Blocks Demo
 *
 * Demonstrates the self-closing block syntax for helpers
 */

import { Stampdown } from '../index';
import { stringHelpersPlugin, mathHelpersPlugin } from '../plugins';

const stampdown = new Stampdown({
  plugins: [stringHelpersPlugin, mathHelpersPlugin],
});

console.log('=== Self-Closing Blocks Demo ===\n');

// Example 1: String helpers with self-closing syntax
console.log('1. String Helpers');
console.log('-----------------');

console.log('Regular syntax:   {{#uppercase name}}{{/uppercase}}');
console.log('Self-closing:     {{#uppercase name/}}');
console.log('');

const name = 'alice';
const regularResult = stampdown.render('{{#uppercase name}}{{/uppercase}}', { name });
const selfClosingResult = stampdown.render('{{#uppercase name/}}', { name });

console.log(`Input: name = "${name}"`);
console.log(`Regular result:      "${regularResult}"`);
console.log(`Self-closing result: "${selfClosingResult}"`);
console.log(`Both produce the same output: ${regularResult === selfClosingResult ? '✓' : '✗'}`);
console.log('');

// Example 2: Multiple transformations
console.log('2. Multiple Transformations');
console.log('---------------------------');

const template = 'Hello {{#capitalize firstName/}} {{#uppercase lastName/}}!';
const result = stampdown.render(template, {
  firstName: 'john',
  lastName: 'doe',
});

console.log('Template:', template);
console.log('Result:  ', result);
console.log('');

// Example 3: Math helpers
console.log('3. Math Helpers');
console.log('---------------');

const mathTemplate = 'Total: ${{#add price tax/}}';
const mathResult = stampdown.render(mathTemplate, { price: 100, tax: 15 });

console.log('Template:', mathTemplate);
console.log('Result:  ', mathResult);
console.log('');

// Example 4: Nested in text
console.log('4. Inline Usage');
console.log('---------------');

const inlineTemplate = [
  'Product: {{#capitalize product/}}',
  'Price: ${{price}}',
  'Tax: ${{tax}}',
  'Total: ${{#add price tax/}}',
].join('\n');

const inlineResult = stampdown.render(inlineTemplate, {
  product: 'laptop',
  price: 999,
  tax: 99.9,
});

console.log(inlineResult);
console.log('');

// Example 5: Complex example
console.log('5. Complex Example');
console.log('------------------');

const complexTemplate = `
# User Profile

**Name:** {{#capitalize user.firstName/}} {{#uppercase user.lastName/}}
**Email:** {{#lowercase user.email/}}
**Score:** {{#multiply user.points 10/}} points
**Status:** {{#if user.isPremium}}Premium Member{{else}}Free Account{{/if}}
`.trim();

const complexResult = stampdown.render(complexTemplate, {
  user: {
    firstName: 'jane',
    lastName: 'smith',
    email: 'JANE@EXAMPLE.COM',
    points: 42,
    isPremium: true,
  },
});

console.log(complexResult);
console.log('');

// Example 6: Comparison - verbose vs concise
console.log('6. Syntax Comparison');
console.log('--------------------');

const verboseTemplate = `
The {{#uppercase color/}} {{#lowercase animal/}} jumped over the {{#capitalize object/}}.
`;

const verboseEquivalent = `
The {{#uppercase color}}{{/uppercase}} {{#lowercase animal}}{{/lowercase}} jumped over the {{#capitalize object}}{{/capitalize}}.
`;

console.log('Self-closing (concise):');
console.log(verboseTemplate.trim());
console.log('');
console.log('Regular syntax (verbose):');
console.log(verboseEquivalent.trim());
console.log('');

const testData = { color: 'brown', animal: 'FOX', object: 'fence' };
const result1 = stampdown.render(verboseTemplate, testData);
const result2 = stampdown.render(verboseEquivalent, testData);

console.log('Both produce:', result1.trim());
console.log(`Identical output: ${result1 === result2 ? '✓' : '✗'}`);
console.log('');

// Example 7: Character savings
console.log('7. Character Savings');
console.log('--------------------');

const examples = [
  {
    name: 'uppercase',
    regular: '{{#uppercase text}}{{/uppercase}}',
    selfClosing: '{{#uppercase text/}}',
  },
  {
    name: 'capitalize',
    regular: '{{#capitalize name}}{{/capitalize}}',
    selfClosing: '{{#capitalize name/}}',
  },
  {
    name: 'add',
    regular: '{{#add a b}}{{/add}}',
    selfClosing: '{{#add a b/}}',
  },
];

console.log('Helper       | Regular | Self-Closing | Saved');
console.log('-------------|---------|--------------|-------');
examples.forEach((ex) => {
  const saved = ex.regular.length - ex.selfClosing.length;
  const savedPct = Math.round((saved / ex.regular.length) * 100);
  console.log(
    `${ex.name.padEnd(12)} | ${String(ex.regular.length).padStart(7)} | ` +
      `${String(ex.selfClosing.length).padStart(12)} | ${saved} (${savedPct}%)`
  );
});
console.log('');

// Example 8: When to use self-closing vs regular
console.log('8. When to Use Self-Closing');
console.log('----------------------------');

console.log('✓ Use self-closing for:');
console.log('  - Single argument transformations: {{#uppercase name/}}');
console.log('  - Math operations: {{#add x y/}}');
console.log('  - String formatting: {{#capitalize title/}}');
console.log('  - Simple helpers with no nested content');
console.log('');

console.log('✗ Use regular syntax for:');
console.log('  - Helpers with nested blocks: {{#if condition}}...{{/if}}');
console.log('  - Loops: {{#each items}}...{{/each}}');
console.log('  - Complex conditional logic with else branches');
console.log('  - When you need access to special variables like {{@index}}');
console.log('');

// Example 9: Edge cases
console.log('9. Edge Cases');
console.log('-------------');

// Multiple arguments
const multiArgTemplate = '{{#add x y/}} + {{#subtract a b/}} = {{#add sum diff/}}';
console.log('Multiple args:', multiArgTemplate);

// Can't use self-closing with loops (conceptually makes no sense)
console.log('Note: {{#each items/}} would not make sense - use regular syntax');
console.log('Note: {{#if condition/}} would not make sense - use regular syntax');
console.log('');

console.log('=== Summary ===');
console.log('');
console.log('Self-closing blocks provide a concise syntax for simple helpers:');
console.log('  • 30-40% fewer characters');
console.log('  • Cleaner, more readable templates');
console.log('  • Perfect for inline transformations');
console.log('  • Works with any helper that takes arguments');
console.log('');
console.log('Syntax: {{#helperName arg1 arg2.../}}');
