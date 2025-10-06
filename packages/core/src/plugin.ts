/**
 * Plugin system for Stampdown
 * Allows extending Stampdown with custom helpers, partials, hooks, and processing logic
 */

import type { Stampdown } from './stampdown';
import type { Helper, Hook } from './types';

/**
 * Plugin interface that all Stampdown plugins must implement
 */
export interface StampdownPlugin {
  /** Unique name for the plugin */
  name: string;
  /** Optional version string */
  version?: string;
  /** Optional description of what the plugin does */
  description?: string;
  /** The main plugin function that receives the Stampdown instance */
  plugin: (stampdown: Stampdown, options?: PluginOptions) => void | Promise<void>;
}

/**
 * Options that can be passed to plugins
 */
export type PluginOptions = Record<string, unknown>;

/**
 * Plugin configuration when registering
 * Can be either a StampdownPlugin directly or an object with plugin and options
 */
export type PluginConfig =
  | StampdownPlugin
  | {
      /** The plugin to register */
      plugin: StampdownPlugin;
      /** Optional configuration for the plugin */
      options?: PluginOptions;
    };

/**
 * Plugin API provided to plugins for extending Stampdown
 */
export interface PluginAPI {
  /** Register a helper function */
  registerHelper: (name: string, helper: Helper) => void;
  /** Register a partial template */
  registerPartial: (name: string, content: string) => void;
  /** Add a pre-processing hook */
  addPreProcessHook: (hook: Hook) => void;
  /** Add a post-processing hook */
  addPostProcessHook: (hook: Hook) => void;
  /** Get the Stampdown version */
  getVersion: () => string;
}

/**
 * Helper function to create a plugin
 * @param {string} name - Plugin name
 * @param {(stampdown: Stampdown, options?: PluginOptions) => void | Promise<void>} plugin - Plugin function
 * @returns {StampdownPlugin} - The plugin object
 */
export function definePlugin(
  name: string,
  plugin: (stampdown: Stampdown, options?: PluginOptions) => void | Promise<void>
): StampdownPlugin {
  return {
    name,
    plugin,
  };
}

/**
 * Helper function to create a plugin with metadata
 * @param {object} config - Plugin configuration
 * @param {string} config.name - Plugin name
 * @param {string} [config.version] - Plugin version
 * @param {string} [config.description] - Plugin description
 * @param {(stampdown: Stampdown, options?: PluginOptions) => void | Promise<void>} config.plugin - Plugin function
 * @returns {StampdownPlugin} - The plugin object
 */
export function createPlugin(config: {
  name: string;
  version?: string;
  description?: string;
  plugin: (stampdown: Stampdown, options?: PluginOptions) => void | Promise<void>;
}): StampdownPlugin {
  return config;
}
