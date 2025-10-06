/**
 * Stampdown - A Markdown templating language
 * Main entry point
 */

export { Stampdown, type PrecompiledTemplateFn } from './stampdown';
export { Parser } from './parser';
export { Renderer } from './renderer';
export { Helper, HelperOptions, HelperRegistry } from './helpers/registry';
export { ExpressionEvaluator } from './evaluator';
export { TemplateLoader, type CompiledTemplate } from './loader';
export { Precompiler, type PrecompileOptions, type PrecompiledTemplate } from './precompiler';
export type { StampdownOptions, Context, Partial, Hook } from './types';
export { definePlugin, createPlugin } from './plugin';
export type { StampdownPlugin, PluginOptions, PluginConfig, PluginAPI } from './plugin';

// Re-export plugins for convenience (can also import from '@stampdwn/core/plugins')
export {
  stringHelpersPlugin,
  mathHelpersPlugin,
  dateHelpersPlugin,
  arrayHelpersPlugin,
  debugPlugin,
} from './plugins';

// Note: llmPlugin is now in @stampdwn/llm package
