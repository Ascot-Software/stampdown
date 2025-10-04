/**
 * Example: Loading and rendering .sdt template files
 */

import { TemplateLoader } from '../loader';
import { join } from 'path';

async function main(): Promise<void> {
  // Create a template loader
  const loader = new TemplateLoader({
    partials: {
      header: '# {{title}}\n*By {{author}}*',
      footer: '---\n© {{year}} {{company}}',
    },
  });

  console.log('=== Example 1: Loading and rendering a simple template ===\n');

  try {
    // Load a template file
    const template = await loader.load(join(__dirname, '../../examples/header.sdt'));

    // Render with context
    const result = template.render({
      title: 'My Awesome Blog',
      subtitle: 'Thoughts on technology',
      date: new Date().toLocaleDateString(),
    });

    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n=== Example 2: Complex template with nested data ===\n');

  try {
    // Load the blog post template
    const blogTemplate = await loader.load(join(__dirname, '../../examples/blog-post.sdt'));

    // Render with complex context
    const blogResult = blogTemplate.render({
      title: 'Getting Started with Stampdown',
      author: {
        name: 'Jane Doe',
        bio: 'Software engineer and technical writer',
        website: 'https://janedoe.com',
        email: 'jane@example.com',
      },
      date: 'October 1, 2025',
      introduction: 'Learn how to use Stampdown for powerful template rendering.',
      hasSections: true,
      sections: [
        {
          title: 'Installation',
          content: 'Install Stampdown with npm: `npm install stampdown`',
        },
        {
          title: 'Basic Usage',
          content: 'Create a new Stampdown instance and render templates.',
          subsections: [
            {
              title: 'Simple Variables',
              content: 'Use {{variable}} syntax for interpolation.',
            },
            {
              title: 'Helpers',
              content: 'Use block helpers like {{#if}} and {{#each}}.',
            },
          ],
        },
      ],
      tags: ['markdown', 'templates', 'javascript', 'typescript'],
    });

    console.log(blogResult);
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n=== Example 3: Compiling template from string ===\n');

  const inlineTemplate = loader.compile('Hello {{name}}! You have {{count}} messages.');

  console.log(
    inlineTemplate.render({
      name: 'Alice',
      count: 5,
    })
  );

  console.log('\n=== Example 4: Cache management ===\n');

  // Templates are cached by default
  const template1 = await loader.load(join(__dirname, '../../examples/header.sdt'));
  const template2 = await loader.load(join(__dirname, '../../examples/header.sdt'));

  console.log('Same template instance?', template1 === template2); // true

  // Clear cache
  loader.clearCache();

  const template3 = await loader.load(join(__dirname, '../../examples/header.sdt'));
  console.log('After cache clear?', template1 === template3); // false
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };
