/**
 * LLM Plugin Tests
 * Tests for LLM-focused helpers and message templating
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Stampdown } from '@stampdwn/core';
import { llmPlugin } from '../index';

describe('llm plugin', () => {
  let stampdown: Stampdown;

  beforeEach(() => {
    stampdown = new Stampdown({ plugins: [llmPlugin] });
  });

  describe('withChat + eachMessage', () => {
    it('renders role-aware conversation', () => {
      const tpl = `{{#withChat raw=chat}}{{#eachMessage}}{{role}}: {{#firstText this/}}\n{{/eachMessage}}{{/withChat}}`;
      const out = stampdown.render(tpl, {
        chat: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [
            { role: 'user', content: [{ type: 'text', text: 'Hi' }] },
            { role: 'assistant', content: [{ type: 'text', text: 'Hello' }] },
          ],
        },
      });
      expect(out.trim()).toBe('user: Hi\nassistant: Hello');
    });

    it('handles empty messages array', () => {
      const tpl = `{{#withChat raw=chat}}{{#eachMessage}}{{role}}{{/eachMessage}}{{/withChat}}`;
      const out = stampdown.render(tpl, {
        chat: {
          provider: 'openai',
          messages: [],
        },
      });
      expect(out.trim()).toBe('');
    });
  });

  describe('role gates', () => {
    const template = `{{#ifUser this}}USER{{else}}NOT_USER{{/ifUser}}`;

    it('ifUser returns true for user messages', () => {
      const out = stampdown.render(template, {
        role: 'user',
        content: [],
      });
      expect(out).toBe('USER');
    });

    it('ifUser returns false for non-user messages', () => {
      const out = stampdown.render(template, {
        role: 'assistant',
        content: [],
      });
      expect(out).toBe('NOT_USER');
    });

    it('ifAssistant works correctly', () => {
      const tpl = `{{#ifAssistant this}}YES{{else}}NO{{/ifAssistant}}`;
      const out = stampdown.render(tpl, {
        role: 'assistant',
        content: [],
      });
      expect(out).toBe('YES');
    });

    it('ifSystem works correctly', () => {
      const tpl = `{{#ifSystem this}}YES{{else}}NO{{/ifSystem}}`;
      const out = stampdown.render(tpl, {
        role: 'system',
        content: [],
      });
      expect(out).toBe('YES');
    });

    it('ifTool works correctly', () => {
      const tpl = `{{#ifTool this}}YES{{else}}NO{{/ifTool}}`;
      const out = stampdown.render(tpl, {
        role: 'tool',
        content: [],
      });
      expect(out).toBe('YES');
    });
  });

  describe('eachByRole', () => {
    it('filters messages by role', () => {
      const tpl = `{{#withChat raw=chat}}{{#eachByRole role="user"}}{{#firstText this/}}\n{{/eachByRole}}{{/withChat}}`;
      const out = stampdown.render(tpl, {
        chat: {
          provider: 'openai',
          messages: [
            { role: 'system', content: [{ type: 'text', text: 'System' }] },
            { role: 'user', content: [{ type: 'text', text: 'User1' }] },
            {
              role: 'assistant',
              content: [{ type: 'text', text: 'Assistant' }],
            },
            { role: 'user', content: [{ type: 'text', text: 'User2' }] },
          ],
        },
      });
      expect(out.trim()).toBe('User1\nUser2');
    });
  });

  describe('content helpers', () => {
    it('eachContent iterates over content', () => {
      const tpl = `{{#eachContent}}{{type}} {{/eachContent}}`;
      const out = stampdown.render(tpl, {
        content: [
          { type: 'text', text: 'Hello' },
          { type: 'image', url: 'http://example.com/img.png' },
        ],
      });
      expect(out.trim()).toBe('text image');
    });

    it('eachText iterates over text content only', () => {
      const tpl = `{{#eachText}}[{{this}}]{{/eachText}}`;
      const out = stampdown.render(tpl, {
        content: [
          { type: 'text', text: 'Hello' },
          { type: 'image', url: 'http://example.com/img.png' },
          { type: 'text', text: 'World' },
        ],
      });
      expect(out).toBe('[Hello][World]');
    });

    it('joinText combines text content', () => {
      const tpl = `{{#joinText this sep=" | "/}}`;
      const out = stampdown.render(tpl, {
        content: [
          { type: 'text', text: 'Hello' },
          { type: 'image', url: 'http://example.com/img.png' },
          { type: 'text', text: 'World' },
        ],
      });
      expect(out).toBe('Hello | World');
    });

    it('firstText gets first text content', () => {
      const tpl = `{{#firstText this/}}`;
      const out = stampdown.render(tpl, {
        content: [
          { type: 'text', text: 'First' },
          { type: 'text', text: 'Second' },
        ],
      });
      expect(out).toBe('First');
    });

    it('lastText gets last text content', () => {
      const tpl = `{{#lastText this/}}`;
      const out = stampdown.render(tpl, {
        content: [
          { type: 'text', text: 'First' },
          { type: 'text', text: 'Last' },
        ],
      });
      expect(out).toBe('Last');
    });
  });

  describe('windowing', () => {
    it('window from end with default size', () => {
      const tpl = `{{#withChat raw=chat}}{{#window size=2 from="end"}}{{#firstText this/}}\n{{/window}}{{/withChat}}`;
      const out = stampdown.render(tpl, {
        chat: {
          provider: 'openai',
          messages: [
            { role: 'user', content: [{ type: 'text', text: 'Msg1' }] },
            { role: 'user', content: [{ type: 'text', text: 'Msg2' }] },
            { role: 'user', content: [{ type: 'text', text: 'Msg3' }] },
            { role: 'user', content: [{ type: 'text', text: 'Msg4' }] },
          ],
        },
      });
      expect(out.trim()).toBe('Msg3\nMsg4');
    });

    it('window from start', () => {
      const tpl = `{{#withChat raw=chat}}{{#window size=2 from="start"}}{{#firstText this/}}\n{{/window}}{{/withChat}}`;
      const out = stampdown.render(tpl, {
        chat: {
          provider: 'openai',
          messages: [
            { role: 'user', content: [{ type: 'text', text: 'Msg1' }] },
            { role: 'user', content: [{ type: 'text', text: 'Msg2' }] },
            { role: 'user', content: [{ type: 'text', text: 'Msg3' }] },
          ],
        },
      });
      expect(out.trim()).toBe('Msg1\nMsg2');
    });

    it('window with role filter', () => {
      const tpl = `{{#withChat raw=chat}}{{#window size=1 from="end" role="user"}}{{#firstText this/}}{{/window}}{{/withChat}}`;
      const out = stampdown.render(tpl, {
        chat: {
          provider: 'openai',
          messages: [
            { role: 'user', content: [{ type: 'text', text: 'User1' }] },
            {
              role: 'assistant',
              content: [{ type: 'text', text: 'Assistant' }],
            },
            { role: 'user', content: [{ type: 'text', text: 'User2' }] },
          ],
        },
      });
      expect(out).toBe('User2');
    });
  });

  describe('token operations', () => {
    it('tokenCount returns token count', () => {
      const tpl = `{{#tokenCount "Hello world"/}}`;
      const out = stampdown.render(tpl, {});
      const count = parseInt(out, 10);
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(10);
    });

    it('truncateTokens truncates text mode', () => {
      const longText = 'word '.repeat(1000);
      const tpl = `{{#truncateTokens text max=10 on="text"/}}`;
      const out = stampdown.render(tpl, { text: longText });
      const tokenCount = out.split(' ').length;
      expect(tokenCount).toBeLessThan(100); // Should be much shorter
    });

    it('truncateTokens truncates block mode', () => {
      const tpl = `{{#truncateTokens max=10 on="block"}}${'word '.repeat(1000)}{{/truncateTokens}}`;
      const out = stampdown.render(tpl, {});
      expect(out.length).toBeLessThan(500); // Should be truncated
    });
  });

  describe('formatting helpers', () => {
    it('mdSection creates markdown section', () => {
      const tpl = `{{#mdSection title="Test" level=2}}Content{{/mdSection}}`;
      const out = stampdown.render(tpl, {});
      expect(out).toContain('## Test');
      expect(out).toContain('Content');
    });

    it('codeFence creates code block', () => {
      const tpl = `{{#codeFence lang="typescript"}}const x = 1;{{/codeFence}}`;
      const out = stampdown.render(tpl, {});
      expect(out).toContain('```typescript');
      expect(out).toContain('const x = 1;');
      expect(out).toContain('```');
    });

    it('json stringifies object', () => {
      const tpl = `{{#json obj/}}`;
      const out = stampdown.render(tpl, { obj: { name: 'test', value: 42 } });
      const parsed = JSON.parse(out);
      expect(parsed).toEqual({ name: 'test', value: 42 });
    });

    it('yaml stringifies object', () => {
      const tpl = `{{#yaml obj/}}`;
      const out = stampdown.render(tpl, { obj: { name: 'test', items: [1, 2, 3] } });
      expect(out).toContain('name: test');
      expect(out).toContain('items:');
    });
  });

  describe('renderChat', () => {
    it('renders normalized format by default', () => {
      const tpl = '{{#renderChat chat format="json" shape="norm"/}}';
      const out = stampdown.render(tpl, {
        chat: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [{ role: 'user', content: [{ type: 'text', text: 'Hi' }] }],
        },
      });
      const parsed = JSON.parse(out);
      expect(parsed.provider).toBe('openai');
      expect(parsed.model).toBe('gpt-4');
      expect(parsed.messages[0].role).toBe('user');
    });

    it('renders OpenAI format', () => {
      const tpl = '{{#renderChat chat format="json" shape="openai"/}}';
      const out = stampdown.render(tpl, {
        chat: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [{ role: 'user', content: [{ type: 'text', text: 'Hi' }] }],
        },
      });
      const parsed = JSON.parse(out);
      expect(parsed.model).toBe('gpt-4');
      expect(parsed.messages[0].content[0].type).toBe('text');
    });

    it('renders Anthropic format', () => {
      const tpl = '{{#renderChat chat format="json" shape="anthropic"/}}';
      const out = stampdown.render(tpl, {
        chat: {
          provider: 'anthropic',
          model: 'claude-3',
          messages: [
            {
              role: 'user',
              content: [{ type: 'image', url: 'http://example.com/img.png' }],
            },
          ],
        },
      });
      const parsed = JSON.parse(out);
      expect(parsed.model).toBe('claude-3');
      expect(parsed.messages[0].content[0].type).toBe('image');
      expect(parsed.messages[0].content[0].source).toBeDefined();
    });

    it('renders YAML format', () => {
      const tpl = '{{#renderChat chat format="yaml" shape="norm"/}}';
      const out = stampdown.render(tpl, {
        chat: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [{ role: 'user', content: [{ type: 'text', text: 'Hi' }] }],
        },
      });
      expect(out).toContain('provider: openai');
      expect(out).toContain('model: gpt-4');
    });
  });

  describe('normalization via @ai-sdk', () => {
    it('normalizes provider names correctly', () => {
      const tpl = `{{#withChat raw=chat}}{{provider}}{{/withChat}}`;

      expect(
        stampdown.render(tpl, {
          chat: { provider: 'openai', messages: [] },
        })
      ).toBe('openai');

      expect(
        stampdown.render(tpl, {
          chat: { provider: 'anthropic', messages: [] },
        })
      ).toBe('anthropic');

      expect(
        stampdown.render(tpl, {
          chat: { provider: 'vertex-ai', messages: [] },
        })
      ).toBe('vertex');

      expect(
        stampdown.render(tpl, {
          chat: { provider: 'azure', messages: [] },
        })
      ).toBe('azure');

      expect(
        stampdown.render(tpl, {
          chat: { provider: 'custom-provider', messages: [] },
        })
      ).toBe('other');
    });

    it('maps message roles correctly', () => {
      const tpl = `{{#withChat raw=chat}}{{#eachMessage}}{{role}},{{/eachMessage}}{{/withChat}}`;
      const out = stampdown.render(tpl, {
        chat: {
          messages: [
            { role: 'system', content: [] },
            { role: 'user', content: [] },
            { role: 'assistant', content: [] },
            { role: 'tool', content: [] },
            { role: 'function', content: [] },
          ],
        },
      });
      expect(out).toBe('system,user,assistant,tool,function,');
    });

    it('maps content types correctly', () => {
      const tpl = `{{#withChat raw=chat}}{{#eachMessage}}{{#eachContent}}{{type}},{{/eachContent}}{{/eachMessage}}{{/withChat}}`;
      const out = stampdown.render(tpl, {
        chat: {
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Hello' },
                { type: 'image', url: 'http://example.com/img.png' },
                { type: 'tool-result', result: { success: true } },
              ],
            },
          ],
        },
      });
      expect(out).toBe('text,image,tool_result,');
    });
  });

  describe('integration: complex template', () => {
    it('renders a complete conversation with formatting', () => {
      const template = `
{{#withChat raw=chat}}
{{#mdSection title="Conversation" level=2}}
{{#eachMessage}}
{{#ifUser}}**User**: {{#joinText this sep=" "/}}{{/ifUser}}
{{#ifAssistant}}**Assistant**: {{#joinText this sep=" "/}}{{/ifAssistant}}
{{#ifSystem}}*System*: {{#joinText this sep=" "/}}{{/ifSystem}}
{{/eachMessage}}
{{/mdSection}}
{{/withChat}}
`;

      const out = stampdown.render(template, {
        chat: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [
            { role: 'system', content: [{ type: 'text', text: 'Be helpful' }] },
            { role: 'user', content: [{ type: 'text', text: 'Hello!' }] },
            { role: 'assistant', content: [{ type: 'text', text: 'Hi there!' }] },
          ],
        },
      });

      expect(out).toContain('## Conversation');
      expect(out).toContain('*System*: Be helpful');
      expect(out).toContain('**User**: Hello!');
      expect(out).toContain('**Assistant**: Hi there!');
    });
  });
});
