/**
 * Stampdown shared exports
 * APIs available in both server and client runtimes.
 */

export { Stampdown, type PrecompiledTemplateFn } from './stampdown';
export { Parser } from './parser';
export { Renderer } from './renderer';
export { HelperRegistry } from './helpers/registry';
export type { Helper, HelperOptions } from './helpers/registry';
export { ExpressionEvaluator } from './evaluator';
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
