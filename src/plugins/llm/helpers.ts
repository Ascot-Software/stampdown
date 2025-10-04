/**
 * LLM Plugin Helpers
 * Role-aware helpers for templating LLM conversations
 *
 * @module plugins/llm/helpers
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import YAML from 'yaml';
import type { Stampdown } from '../../stampdown';
import type { NormChat, NormMessage, NormContent } from './types';
import { NormChatSchema } from './types';
import { normalizeFromAiSdk } from './adapters/ai-sdk';
import { defaultTokenizer, type Tokenizer } from './tokenizer';
import type { Context } from '../../types';
import type { HelperOptions } from '../../helpers/registry';

/**
 * Options for LLM helper registration
 */
export interface LLMHelperOptions {
  tokenizer?: Tokenizer;
}

/**
 * Register all LLM helpers with a Stampdown instance
 * @param {Stampdown} stampdown - Stampdown instance
 * @param {LLMHelperOptions} opts - Configuration options
 */
export function registerLLMHelpers(stampdown: Stampdown, opts?: LLMHelperOptions): void {
  const tok = opts?.tokenizer ?? defaultTokenizer;

  // ### Context normalization
  /**
   * 'withChat' helper - Normalize raw chat payload via @ai-sdk adapter and set as context
   * Validates the normalized chat using Zod schema
   * Usage: {{#withChat raw=chat}} ... {{/withChat}}
   * @param {Context} context - Template context
   * @param {HelperOptions} options - Helper options with hash parameters
   * @returns {string} - Rendered content with normalized chat as context
   */
  stampdown.registerHelper('withChat', (context: Context, options: HelperOptions) => {
    const raw = options.hash?.raw ?? context;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const norm = normalizeFromAiSdk(raw as any);
    NormChatSchema.parse(norm);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return options.fn ? options.fn(norm as any) : '';
  });

  // ### Message iteration
  /**
   * 'eachMessage' helper - Iterate over all messages in a chat
   * Provides special variables: @index, @first, @last
   * Usage: {{#eachMessage}} ... {{/eachMessage}}
   * @param {Context} context - Template context
   * @param {HelperOptions} options - Helper options
   * @param {unknown} chat - Optional chat object (defaults to context)
   * @returns {string} - Rendered content for each message
   */
  stampdown.registerHelper(
    'eachMessage',
    (context: Context, options: HelperOptions, chat?: unknown) => {
      const target = (chat ?? context) as NormChat;
      const arr = target?.messages ?? [];
      return arr
        .map((m, i) => {
          const msgCtx: Context = {
            ...m,
            '@index': i,
            '@first': i === 0,
            '@last': i === arr.length - 1,
          } as any;
          return options.fn ? options.fn(msgCtx) : '';
        })
        .join('');
    }
  );

  /**
   * Create a role gate helper that only renders content for specific role
   * @param {string} role - Role to filter by
   * @returns {Function} - Helper function
   * @private
   */
  function roleGate(role: string) {
    return (context: Context, options: HelperOptions, m?: unknown) => {
      const message = (m ?? context) as NormMessage;
      if (message?.role === role) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return options.fn ? options.fn(message as any) : '';
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return options.inverse ? options.inverse(message as any) : '';
    };
  }

  /**
   * 'ifUser' helper - Conditional block for user messages
   * Renders main block if message role is 'user', else block otherwise
   * Usage: {{#ifUser}} ... {{/ifUser}}
   * @returns {string} - Rendered content based on role condition
   */
  stampdown.registerHelper('ifUser', roleGate('user'));

  /**
   * 'ifAssistant' helper - Conditional block for assistant messages
   * Renders main block if message role is 'assistant', else block otherwise
   * Usage: {{#ifAssistant}} ... {{/ifAssistant}}
   * @returns {string} - Rendered content based on role condition
   */
  stampdown.registerHelper('ifAssistant', roleGate('assistant'));

  /**
   * 'ifSystem' helper - Conditional block for system messages
   * Renders main block if message role is 'system', else block otherwise
   * Usage: {{#ifSystem}} ... {{/ifSystem}}
   * @returns {string} - Rendered content based on role condition
   */
  stampdown.registerHelper('ifSystem', roleGate('system'));

  /**
   * 'ifTool' helper - Conditional block for tool messages
   * Renders main block if message role is 'tool', else block otherwise
   * Usage: {{#ifTool}} ... {{/ifTool}}
   * @returns {string} - Rendered content based on role condition
   */
  stampdown.registerHelper('ifTool', roleGate('tool'));

  /**
   * 'eachByRole' helper - Iterate over messages filtered by role
   * Provides special variables: @index, @first, @last
   * Usage: {{#eachByRole role="user"}} ... {{/eachByRole}}
   * @param {Context} context - Template context
   * @param {HelperOptions} options - Helper options with hash.role for filtering
   * @param {unknown} chat - Optional chat object (defaults to context)
   * @returns {string} - Rendered content for each filtered message
   */
  stampdown.registerHelper(
    'eachByRole',
    (context: Context, options: HelperOptions, chat?: unknown) => {
      const target = (chat ?? context) as NormChat;
      const role = options.hash?.role as string | undefined;
      const arr = (target?.messages ?? []).filter((m) => !role || m.role === role);
      return arr
        .map((m, i) => {
          const msgCtx: Context = {
            ...m,
            '@index': i,
            '@first': i === 0,
            '@last': i === arr.length - 1,
          } as any;
          return options.fn ? options.fn(msgCtx) : '';
        })
        .join('');
    }
  );

  // ### Content helpers
  /**
   * 'eachContent' helper - Iterate over all content items in a message
   * Provides special variables: @index, @first, @last
   * Usage: {{#eachContent}} ... {{/eachContent}}
   * @param {Context} context - Template context
   * @param {HelperOptions} options - Helper options
   * @param {unknown} m - Optional message object (defaults to context)
   * @returns {string} - Rendered content for each content item
   */
  stampdown.registerHelper(
    'eachContent',
    (context: Context, options: HelperOptions, m?: unknown) => {
      const message = (m ?? context) as NormMessage;
      const arr = message?.content ?? [];
      return arr
        .map((c, i) => {
          const contentCtx: Context = {
            ...c,
            '@index': i,
            '@first': i === 0,
            '@last': i === arr.length - 1,
          } as any;
          return options.fn ? options.fn(contentCtx) : '';
        })
        .join('');
    }
  );

  /**
   * 'eachText' helper - Iterate over text content items only
   * Filters out non-text content (images, tool results, etc.)
   * Provides special variables: @index, @first, @last, and sets 'this' to text value
   * Usage: {{#eachText}} ... {{/eachText}}
   * @param {Context} context - Template context
   * @param {HelperOptions} options - Helper options
   * @param {unknown} m - Optional message object (defaults to context)
   * @returns {string} - Rendered content for each text item
   */
  stampdown.registerHelper('eachText', (context: Context, options: HelperOptions, m?: unknown) => {
    const message = (m ?? context) as NormMessage;
    const texts = (message?.content ?? []).filter(
      (c): c is Extract<NormContent, { type: 'text' }> => c.type === 'text'
    );
    return texts
      .map((t, i, arr) => {
        const textCtx: Context = {
          ...context,
          this: t.text,
          text: t.text,
          '@index': i,
          '@first': i === 0,
          '@last': i === arr.length - 1,
        } as any;
        return options.fn ? options.fn(textCtx) : '';
      })
      .join('');
  });

  /**
   * 'joinText' helper - Join all text content from message(s) with separator
   * Extracts text content from single message or array of messages and joins with separator
   * Usage: {{#joinText message sep=" "/}}
   * @param {Context} _context - Template context (unused)
   * @param {HelperOptions} options - Helper options with hash.sep for separator
   * @param {unknown} target - Message or array of messages (defaults to context)
   * @returns {string} - Joined text content
   */
  stampdown.registerHelper(
    'joinText',
    (_context: Context, options: HelperOptions, target?: unknown) => {
      const maybeMsg = target ?? _context;
      const sep = (options.hash?.sep as string) ?? ' ';
      const msgs: NormMessage[] = Array.isArray(maybeMsg) ? maybeMsg : [maybeMsg as NormMessage];
      const parts = msgs.flatMap((m) =>
        (m?.content ?? [])
          .filter((c): c is Extract<NormContent, { type: 'text' }> => c.type === 'text')
          .map((t) => t.text)
      );
      return parts.join(sep);
    }
  );

  /**
   * 'firstText' helper - Get first text content from a message
   * Returns the text of the first text-type content item, or empty string if none found
   * Usage: {{#firstText message/}}
   * @param {Context} _context - Template context
   * @param {HelperOptions} _options - Helper options (unused)
   * @param {unknown} m - Optional message object (defaults to context)
   * @returns {string} - First text content or empty string
   */
  stampdown.registerHelper(
    'firstText',
    (_context: Context, _options: HelperOptions, m?: unknown) => {
      const message = (m ?? _context) as NormMessage;
      const t = message?.content?.find(
        (c): c is Extract<NormContent, { type: 'text' }> => c.type === 'text'
      );
      return t?.text ?? '';
    }
  );

  /**
   * 'lastText' helper - Get last text content from a message
   * Returns the text of the last text-type content item, or empty string if none found
   * Usage: {{#lastText message/}}
   * @param {Context} _context - Template context
   * @param {HelperOptions} _options - Helper options (unused)
   * @param {unknown} m - Optional message object (defaults to context)
   * @returns {string} - Last text content or empty string
   */
  stampdown.registerHelper(
    'lastText',
    (_context: Context, _options: HelperOptions, m?: unknown) => {
      const message = (m ?? _context) as NormMessage;
      const texts = (message?.content ?? []).filter(
        (c): c is Extract<NormContent, { type: 'text' }> => c.type === 'text'
      );
      return texts.length ? texts[texts.length - 1].text : '';
    }
  );

  // ### Windowing & tokens
  /**
   * 'window' helper - Window over messages with size and direction control
   * Selects a subset of messages from start or end, optionally filtered by role
   * Provides special variables: @index, @first, @last
   * Usage: {{#window size=4 from="end" role="user"}} ... {{/window}}
   * @param {Context} context - Template context
   * @param {HelperOptions} options - Helper options with hash.size, hash.from, hash.role
   * @param {unknown} chat - Optional chat object (defaults to context)
   * @returns {string} - Rendered content for windowed messages
   */
  stampdown.registerHelper('window', (context: Context, options: HelperOptions, chat?: unknown) => {
    const target = (chat ?? context) as NormChat;
    const size = Number(options.hash?.size ?? 4);
    const from = (options.hash?.from ?? 'end') as 'start' | 'end';
    const role = options.hash?.role as string | undefined;
    let arr = target?.messages ?? [];
    if (role) arr = arr.filter((m) => m.role === role);
    const slice = from === 'start' ? arr.slice(0, size) : arr.slice(Math.max(0, arr.length - size));
    return slice
      .map((m, i, a) => {
        const msgCtx: Context = {
          ...m,
          '@index': i,
          '@first': i === 0,
          '@last': i === a.length - 1,
        } as any;
        return options.fn ? options.fn(msgCtx) : '';
      })
      .join('');
  });

  /**
   * 'tokenCount' helper - Count tokens in text
   * Uses configured tokenizer (default: gpt-tokenizer)
   * Usage: {{#tokenCount "Hello world"/}}
   * @param {Context} _context - Template context (unused)
   * @param {HelperOptions} _options - Helper options (unused)
   * @param {unknown} text - Text to count tokens for
   * @returns {string} - Token count as string
   */
  stampdown.registerHelper(
    'tokenCount',
    (_context: Context, _options: HelperOptions, text?: unknown) => {
      const str = String(text ?? '');
      return String(tok.count(str));
    }
  );

  /**
   * 'truncateTokens' helper - Truncate text/block/message by token count
   * Three modes: 'block' (truncate rendered content), 'text' (truncate text arg), 'message' (truncate message text content)
   * Usage: {{#truncateTokens max=2000 on="block"}} ... {{/truncateTokens}}
   * Usage: {{#truncateTokens text max=2000 on="text"/}}
   * Usage: {{#truncateTokens message max=2000 on="message"/}}
   * @param {Context} context - Template context
   * @param {HelperOptions} options - Helper options with hash.max and hash.on
   * @param {unknown} arg - Optional text or message object depending on mode
   * @returns {string} - Truncated content
   */
  stampdown.registerHelper(
    'truncateTokens',
    (context: Context, options: HelperOptions, arg?: unknown) => {
      const max = Number(options.hash?.max ?? 2000);
      const mode = (options.hash?.on ?? 'block') as 'block' | 'text' | 'message';

      if (mode === 'block') {
        const blockContent = options.fn ? options.fn(context) : '';
        return tok.truncateByTokens(blockContent, max);
      }
      if (mode === 'text') {
        return tok.truncateByTokens(String(arg ?? ''), max);
      }
      // mode === 'message'
      const m = arg as NormMessage;
      const joined = (m?.content ?? [])
        .filter((c): c is Extract<NormContent, { type: 'text' }> => c.type === 'text')
        .map((t) => t.text)
        .join(' ');
      return tok.truncateByTokens(joined, max);
    }
  );

  // ### Formatting
  /**
   * 'mdSection' helper - Wrap content in markdown section with heading
   * Creates a markdown heading (level 1-6) followed by content
   * Usage: {{#mdSection title="Title" level=2}} ... {{/mdSection}}
   * @param {Context} context - Template context
   * @param {HelperOptions} options - Helper options with hash.title and hash.level
   * @returns {string} - Markdown formatted section
   */
  stampdown.registerHelper('mdSection', (context: Context, options: HelperOptions) => {
    const title = (options.hash?.title as string) ?? '';
    const level = Math.max(1, Math.min(6, Number(options.hash?.level ?? 2)));
    const content = options.fn ? options.fn(context) : '';
    return `${'#'.repeat(level)} ${title}\n\n${content}`;
  });

  /**
   * 'codeFence' helper - Wrap content in code fence
   * Creates a markdown code block with optional language identifier
   * Usage: {{#codeFence lang="typescript"}} ... {{/codeFence}}
   * @param {Context} context - Template context
   * @param {HelperOptions} options - Helper options with hash.lang
   * @returns {string} - Markdown code fence with content
   */
  stampdown.registerHelper('codeFence', (context: Context, options: HelperOptions) => {
    const lang = (options.hash?.lang as string) ?? '';
    const content = options.fn ? options.fn(context) : '';
    return `\`\`\`${lang}\n${content}\n\`\`\``;
  });

  /**
   * 'json' helper - Stringify value as JSON
   * Pretty-prints the value with 2-space indentation
   * Usage: {{#json value/}}
   * @param {Context} context - Template context (used if no value provided)
   * @param {HelperOptions} _options - Helper options (unused)
   * @param {unknown} value - Optional value to stringify (defaults to context)
   * @returns {string} - JSON string representation
   */
  stampdown.registerHelper('json', (context: Context, _options: HelperOptions, value?: unknown) => {
    const target = value ?? context;
    return JSON.stringify(target, null, 2);
  });

  /**
   * 'yaml' helper - Stringify value as YAML
   * Converts value to YAML format using YAML library
   * Usage: {{#yaml value/}}
   * @param {Context} context - Template context (used if no value provided)
   * @param {HelperOptions} _options - Helper options (unused)
   * @param {unknown} value - Optional value to stringify (defaults to context)
   * @returns {string} - YAML string representation
   */
  stampdown.registerHelper('yaml', (context: Context, _options: HelperOptions, value?: unknown) => {
    const target = value ?? context;
    return YAML.stringify(target);
  });

  // ### Provider shape emission
  /**
   * 'renderChat' helper - Render chat in provider-specific format (for debugging/API interop)
   * Converts normalized chat to provider-specific shape (OpenAI, Anthropic, or normalized)
   * Usage: {{#renderChat chat format="json" shape="openai"/}}
   * @param {Context} context - Template context
   * @param {HelperOptions} options - Helper options with hash.format ('json'|'yaml') and hash.shape ('norm'|'openai'|'anthropic')
   * @param {unknown} chat - Optional chat object (defaults to context)
   * @returns {string} - Formatted chat in specified format and shape
   */
  stampdown.registerHelper(
    'renderChat',
    (context: Context, options: HelperOptions, chat?: unknown) => {
      const target = (chat ?? context) as NormChat;
      const format = (options.hash?.format ?? 'json') as 'json' | 'yaml';
      const shape = (options.hash?.shape ?? 'norm') as 'norm' | 'openai' | 'anthropic';
      const obj = shape === 'norm' ? target : toShape(target, shape);
      return format === 'yaml' ? YAML.stringify(obj) : JSON.stringify(obj, null, 2);
    }
  );

  /**
   * Convert normalized chat to provider-specific shape
   * @param {NormChat} norm - Normalized chat object
   * @param {'openai' | 'anthropic'} shape - Target provider shape
   * @returns {unknown} - Provider-specific object
   * @private
   */
  function toShape(norm: NormChat, shape: 'openai' | 'anthropic'): unknown {
    if (shape === 'openai') {
      return {
        model: norm.model,
        messages: norm.messages.map((m) => ({
          role: m.role,
          name: m.name,
          content: m.content
            .map((c) => {
              if (c.type === 'text') return { type: 'text', text: c.text };
              if (c.type === 'image')
                return {
                  type: 'image_url',
                  image_url: { url: c.url, alt: c.alt },
                };
              if (c.type === 'tool_result')
                return {
                  type: 'tool_result',
                  tool_name: c.toolName,
                  call_id: c.callId,
                  result: c.result,
                };
              return null;
            })
            .filter(Boolean),
        })),
      };
    }
    // anthropic-like
    return {
      model: norm.model,
      messages: norm.messages.map((m) => ({
        role: m.role,
        name: m.name,
        content: m.content
          .map((c) => {
            if (c.type === 'text') return { type: 'text', text: c.text };
            if (c.type === 'image') {
              return {
                type: 'image',
                source: c.data
                  ? { type: 'base64', media_type: c.mime, data: c.data }
                  : { type: 'url', media_type: c.mime, url: c.url },
                alt: c.alt,
              };
            }
            if (c.type === 'tool_result')
              return {
                type: 'tool_result',
                tool_name: c.toolName,
                call_id: c.callId,
                result: c.result,
              };
            return null;
          })
          .filter(Boolean),
      })),
    };
  }
}
