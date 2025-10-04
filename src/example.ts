/**
 * Stampdown Example
 * This file demonstrates the basic usage of Stampdown
 */

import { Stampdown, type Context, type HelperOptions } from './index';

// Create a new Stampdown instance
const stampdown = new Stampdown();

// Example 1: Simple expressions
console.log('=== Example 1: Simple Expressions ===');
const template1 = `# Hello {{name}}!

Welcome to **Stampdown**, a powerful markdown templating engine.`;

const result1 = stampdown.render(template1, { name: 'World' });
console.log(result1);

// Example 2: Conditionals
console.log('\n=== Example 2: Conditionals ===');
const template2 = `# User Profile

{{#if isPremium}}
You are a **Premium** member! 🌟
{{else}}
You are using the free tier.
{{/if}}`;

const result2 = stampdown.render(template2, { isPremium: true });
console.log(result2);

// Example 3: Loops
console.log('\n=== Example 3: Loops ===');
const template3 = `# Shopping List

{{#each items}}
- {{this}}
{{/each}}`;

const result3 = stampdown.render(template3, {
  items: ['Apples', 'Bananas', 'Oranges', 'Milk'],
});
console.log(result3);

// Example 4: Partials
console.log('\n=== Example 4: Partials ===');
stampdown.registerPartial('header', '# {{title}}\n\n*By {{author}}*');

const template4 = `{{>header}}

This is the main content of the article.`;

const result4 = stampdown.render(template4, {
  title: 'Getting Started with Stampdown',
  author: 'John Doe',
});
console.log(result4);

// Example 5: Custom Helper
console.log('\n=== Example 5: Custom Helper ===');
stampdown.registerHelper(
  'bold',
  (_context: Context, _options: HelperOptions, text: unknown): string => {
    return `**${String(text)}**`;
  }
);

const template5 = `The result is: {{#bold message}}{{/bold}}`;

const result5 = stampdown.render(template5, {
  message: 'This text is bold',
});
console.log(result5);

// Example 6: Nested data
console.log('\n=== Example 6: Nested Data ===');
const template6 = `# {{user.name}}'s Profile

- Email: {{user.email}}
- Location: {{user.location}}
- Member since: {{user.joinDate}}`;

const result6 = stampdown.render(template6, {
  user: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    location: 'San Francisco, CA',
    joinDate: '2024',
  },
});
console.log(result6);
