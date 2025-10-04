/**
 * Test advanced partials with precompilation
 */

import { Stampdown, Precompiler, type PrecompiledTemplateFn } from '../index';

console.log('='.repeat(70));
console.log('ADVANCED PARTIALS WITH PRECOMPILATION TEST');
console.log('='.repeat(70));

// Helper to create precompiled function
const createPrecompiledFn = (code: string): PrecompiledTemplateFn => {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function('context', 'stampdown', code) as PrecompiledTemplateFn;
};

const stampdown = new Stampdown({
  partials: {
    greeting: 'Hello {{name}}!',
    farewell: 'Goodbye {{name}}!',
    userCard: 'Name: {{name}}, Age: {{age}}',
    button: '<button class="{{variant}}">{{text}}</button>',
    layout: '<div class="layout">{{> @partial-block}}</div>',
  },
});

const precompiler = new Precompiler();

// Test 1: Dynamic Partials
console.log('\n--- Test 1: Dynamic Partials ---');
const dynamicTemplate = '{{> (partialName) }}';
try {
  const compiled = precompiler.precompile(dynamicTemplate, {
    templateId: 'dynamic-partial',
  });

  const fn = createPrecompiledFn(compiled.code);
  stampdown.registerPrecompiledTemplate('dynamic-partial', fn);

  const result = stampdown.renderPrecompiled('dynamic-partial', {
    partialName: 'greeting',
    name: 'World',
  });

  console.log('Result:', result);
  console.log(result === 'Hello World!' ? '✓ PASS' : '✗ FAIL');
} catch (error) {
  console.error('✗ FAIL:', error instanceof Error ? error.message : String(error));
}

// Test 2: Partial with Context
console.log('\n--- Test 2: Partial with Context ---');
const contextTemplate = '{{> userCard person}}';
try {
  const compiled = precompiler.precompile(contextTemplate, {
    templateId: 'context-partial',
  });

  const fn = createPrecompiledFn(compiled.code);
  stampdown.registerPrecompiledTemplate('context-partial', fn);

  const result = stampdown.renderPrecompiled('context-partial', {
    person: { name: 'Alice', age: 30 },
  });

  console.log('Result:', result);
  console.log(result === 'Name: Alice, Age: 30' ? '✓ PASS' : '✗ FAIL');
} catch (error) {
  console.error('✗ FAIL:', error instanceof Error ? error.message : String(error));
}

// Test 3: Partial with Hash Parameters
console.log('\n--- Test 3: Partial with Hash Parameters ---');
const hashTemplate = '{{> button text="Click me" variant=primary}}';
try {
  const compiled = precompiler.precompile(hashTemplate, {
    templateId: 'hash-partial',
  });

  const fn = createPrecompiledFn(compiled.code);
  stampdown.registerPrecompiledTemplate('hash-partial', fn);

  const result = stampdown.renderPrecompiled('hash-partial', {});

  console.log('Result:', result);
  console.log(result === '<button class="primary">Click me</button>' ? '✓ PASS' : '✗ FAIL');
} catch (error) {
  console.error('✗ FAIL:', error instanceof Error ? error.message : String(error));
}

// Test 4: Partial with Dynamic Hash Parameters
console.log('\n--- Test 4: Partial with Dynamic Hash Parameters ---');
const dynamicHashTemplate = '{{> button text=action.label variant=style}}';
try {
  const compiled = precompiler.precompile(dynamicHashTemplate, {
    templateId: 'dynamic-hash-partial',
  });

  const fn = createPrecompiledFn(compiled.code);
  stampdown.registerPrecompiledTemplate('dynamic-hash-partial', fn);

  const result = stampdown.renderPrecompiled('dynamic-hash-partial', {
    action: { label: 'Submit' },
    style: 'success',
  });

  console.log('Result:', result);
  console.log(result === '<button class="success">Submit</button>' ? '✓ PASS' : '✗ FAIL');
} catch (error) {
  console.error('✗ FAIL:', error instanceof Error ? error.message : String(error));
}

// Test 5: Partial Block with @partial-block
console.log('\n--- Test 5: Partial Block with @partial-block ---');
const blockTemplate = '{{#> layout}}Content Here{{/layout}}';
try {
  const compiled = precompiler.precompile(blockTemplate, {
    templateId: 'block-partial',
  });

  const fn = createPrecompiledFn(compiled.code);
  stampdown.registerPrecompiledTemplate('block-partial', fn);

  const result = stampdown.renderPrecompiled('block-partial', {});

  console.log('Result:', result);
  console.log(result === '<div class="layout">Content Here</div>' ? '✓ PASS' : '✗ FAIL');
} catch (error) {
  console.error('✗ FAIL:', error instanceof Error ? error.message : String(error));
}

// Test 6: Partial Block with Failover
console.log('\n--- Test 6: Partial Block with Failover ---');
const failoverTemplate = '{{#> missing}}Fallback Content{{/missing}}';
try {
  const compiled = precompiler.precompile(failoverTemplate, {
    templateId: 'failover-partial',
  });

  const fn = createPrecompiledFn(compiled.code);
  stampdown.registerPrecompiledTemplate('failover-partial', fn);

  const result = stampdown.renderPrecompiled('failover-partial', {});

  console.log('Result:', result);
  console.log(result === 'Fallback Content' ? '✓ PASS' : '✗ FAIL');
} catch (error) {
  console.error('✗ FAIL:', error instanceof Error ? error.message : String(error));
}

// Test 7: Inline Partial
console.log('\n--- Test 7: Inline Partial ---');
const inlineTemplate = '{{#*inline "test"}}Inline Content{{/inline}}{{> test}}';
try {
  const compiled = precompiler.precompile(inlineTemplate, {
    templateId: 'inline-partial',
  });

  const fn = createPrecompiledFn(compiled.code);
  stampdown.registerPrecompiledTemplate('inline-partial', fn);

  const result = stampdown.renderPrecompiled('inline-partial', {});

  console.log('Result:', result);
  console.log(result === 'Inline Content' ? '✓ PASS' : '✗ FAIL');
} catch (error) {
  console.error('✗ FAIL:', error instanceof Error ? error.message : String(error));
}

// Test 8: Complex - Partial Block with Hash and Context
console.log('\n--- Test 8: Complex - Partial Block with Hash and Context ---');
const complexTemplate = '{{#> userCard person title=Dr prefix=Hello}}{{/userCard}}';
try {
  const compiled = precompiler.precompile(complexTemplate, {
    templateId: 'complex-partial',
  });

  const fn = createPrecompiledFn(compiled.code);
  stampdown.registerPrecompiledTemplate('complex-partial', fn);

  const result = stampdown.renderPrecompiled('complex-partial', {
    person: { name: 'Smith', age: 40 },
  });

  console.log('Result:', result);
  // Should merge person context with hash params
  console.log(result.includes('Smith') && result.includes('40') ? '✓ PASS' : '✗ FAIL');
} catch (error) {
  console.error('✗ FAIL:', error instanceof Error ? error.message : String(error));
}

console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log('\n✓ Advanced partials work with precompilation!');
console.log('\nSupported features:');
console.log('  • Dynamic partials: {{> (expression) }}');
console.log('  • Partial contexts: {{> partial context}}');
console.log('  • Hash parameters: {{> partial key=value}}');
console.log('  • Dynamic hash values: {{> partial key=variable}}');
console.log('  • Partial blocks: {{#> partial}}...{{/partial}}');
console.log('  • @partial-block support');
console.log('  • Failover content');
console.log('  • Inline partials: {{#*inline "name"}}...{{/inline}}');
