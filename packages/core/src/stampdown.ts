/**
 * Main Stampdown class
 * The primary interface for rendering Markdown templates with expressions,
 * partials, block helpers, and hooks.
 */

import { Parser } from './parser';
import { Renderer } from './renderer';
import { HelperRegistry, type HelperOptions } from './helpers/registry';
import { registerBuiltInHelpers } from './helpers/builtin';
import { ExpressionEvaluator } from './evaluator';
import type { StampdownOptions, Context, Hook } from './types';
import type { PluginConfig, StampdownPlugin, PluginOptions } from './plugin';

/**
 * Stampdown templating engine
 */
/**
 * Precompiled template function type
 */
export type PrecompiledTemplateFn = (context: Context, stampdown: Stampdown) => string;

export class Stampdown {
  private parser: Parser;
  private renderer: Renderer;
  private helperRegistry: HelperRegistry;
  private partials: Map<string, string>;
  private inlinePartials: Map<string, string>; // Block-scoped inline partials
  private preProcessHooks: Hook[];
  private postProcessHooks: Hook[];
  private readonly precompiledTemplates: ReadonlyMap<string, PrecompiledTemplateFn>;

  /**
   * Creates a new Stampdown instance
   * @param {StampdownOptions} options - Configuration options
   */
  constructor(options: StampdownOptions = {}) {
    this.parser = new Parser();
    this.helperRegistry = new HelperRegistry();
    this.renderer = new Renderer(this.helperRegistry);
    this.partials = new Map();
    this.inlinePartials = new Map(); // Initialize inline partials
    this.preProcessHooks = [];
    this.postProcessHooks = [];
    this.precompiledTemplates = new Map();

    // Register built-in helpers
    registerBuiltInHelpers(this.helperRegistry);

    // Register custom helpers
    if (options.helpers) {
      Object.entries(options.helpers).forEach(([name, helper]) => {
        this.helperRegistry.register(name, helper);
      });
    }

    // Register partials
    if (options.partials) {
      Object.entries(options.partials).forEach(([name, content]) => {
        this.registerPartial(name, content);
      });
    }

    // Register hooks
    if (options.hooks?.preProcess) {
      this.preProcessHooks.push(...options.hooks.preProcess);
    }
    if (options.hooks?.postProcess) {
      this.postProcessHooks.push(...options.hooks.postProcess);
    }

    // Load plugins
    if (options.plugins) {
      this.loadPlugins(options.plugins);
    }
  }

  /**
   * Load and initialize plugins
   * @param {PluginConfig[]} plugins - Array of plugin configurations
   * @returns {void}
   * @private
   */
  private loadPlugins(plugins: PluginConfig[]): void {
    for (const config of plugins) {
      // Handle both StampdownPlugin directly and { plugin, options } format
      // Check if config has 'name' property - StampdownPlugin has name, config object has plugin
      const isDirectPlugin = 'name' in config && typeof config.name === 'string';
      const plugin: StampdownPlugin = isDirectPlugin
        ? config
        : (config as { plugin: StampdownPlugin }).plugin;
      const pluginOptions = isDirectPlugin
        ? undefined
        : (config as { options?: PluginOptions }).options;

      try {
        const result = plugin.plugin(this, pluginOptions);
        // If plugin returns a promise, we ignore it (fire and forget)
        // Plugins should be synchronous during initialization
        if (result instanceof Promise) {
          void result;
        }
      } catch (error) {
        throw new Error(
          `Failed to load plugin "${plugin.name}": ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * Register a partial template
   * @param {string} name - The name of the partial
   * @param {string} content - The template content
   * @returns {void}
   */
  registerPartial(name: string, content: string): void {
    this.partials.set(name, content);
  }

  /**
   * Get a registered partial (checks inline partials first, then regular partials)
   * @param {string} name - The name of the partial to retrieve
   * @returns {string | undefined} - The partial content or undefined if not found
   */
  getPartial(name: string): string | undefined {
    // Check inline partials first (they have precedence)
    const inlinePartial = this.inlinePartials.get(name);
    if (inlinePartial !== undefined) {
      return inlinePartial;
    }
    // Fall back to regular partials
    return this.partials.get(name);
  }

  /**
   * Register an inline partial (block-scoped)
   * @param {string} name - The name of the inline partial
   * @param {string} content - The partial content (pre-rendered)
   * @returns {void}
   */
  registerInlinePartial(name: string, content: string): void {
    this.inlinePartials.set(name, content);
  }

  /**
   * Unregister an inline partial
   * @param {string} name - The name of the inline partial to remove
   * @returns {void}
   */
  unregisterInlinePartial(name: string): void {
    this.inlinePartials.delete(name);
  }

  /**
   * Clear all inline partials (typically called between renders)
   * @returns {void}
   */
  clearInlinePartials(): void {
    this.inlinePartials.clear();
  }

  /**
   * Register a custom helper function
   * @param {string} name - The name of the helper
   * @param {Function} helper - The helper function
   * @returns {void}
   */
  registerHelper(
    name: string,
    helper: (context: Context, options: HelperOptions, ...args: unknown[]) => string
  ): void {
    this.helperRegistry.register(name, helper);
  }

  /**
   * Add a preprocessing hook
   * @param {Hook} hook - Hook function to transform template before parsing
   * @returns {void}
   */
  addPreProcessHook(hook: Hook): void {
    this.preProcessHooks.push(hook);
  }

  /**
   * Add a postprocessing hook
   * @param {Hook} hook - Hook function to transform output after rendering
   * @returns {void}
   */
  addPostProcessHook(hook: Hook): void {
    this.postProcessHooks.push(hook);
  }

  /**
   * Render a template with the given context
   * @param {string} template - The template string to render
   * @param {Context} context - Variables and data accessible in the template
   * @returns {string} - The rendered output
   */
  render(template: string, context: Context = {}): string {
    // Apply preprocessing hooks
    let processedTemplate = template;
    for (const hook of this.preProcessHooks) {
      processedTemplate = hook(processedTemplate, context);
    }

    // Parse the template
    const ast = this.parser.parse(processedTemplate);

    // Render the AST
    let result = this.renderer.render(ast, context, this);

    // Apply postprocessing hooks
    for (const hook of this.postProcessHooks) {
      result = hook(result, context);
    }

    return result;
  }

  /**
   * Render a precompiled template by its identifier
   * @param {string} templateId - The identifier of the precompiled template
   * @param {Context} context - Variables and data accessible in the template
   * @returns {string} - The rendered output
   * @throws {Error} - If the template is not found
   */
  renderPrecompiled(templateId: string, context: Context = {}): string {
    const templateFn = this.precompiledTemplates.get(templateId);
    if (!templateFn) {
      throw new Error(`Precompiled template "${templateId}" not found`);
    }
    return templateFn(context, this);
  }

  /**
   * Register a precompiled template
   * @param {string} templateId - Identifier for the template
   * @param {PrecompiledTemplateFn} templateFn - The compiled template function
   * @returns {void}
   */
  registerPrecompiledTemplate(templateId: string, templateFn: PrecompiledTemplateFn): void {
    // Cast to mutable Map for registration
    (this.precompiledTemplates as Map<string, PrecompiledTemplateFn>).set(templateId, templateFn);
  }

  /**
   * Check if a precompiled template exists
   * @param {string} templateId - The template identifier to check
   * @returns {boolean} - True if the template exists
   */
  hasPrecompiledTemplate(templateId: string): boolean {
    return this.precompiledTemplates.has(templateId);
  }

  /**
   * Get all registered precompiled template IDs
   * @returns {string[]} - Array of template identifiers
   */
  getPrecompiledTemplateIds(): string[] {
    return Array.from(this.precompiledTemplates.keys());
  }

  /**
   * Get the renderer instance (for precompiled templates)
   * @returns {Renderer} - The renderer instance
   */
  getRenderer(): Renderer {
    return this.renderer;
  }

  /**
   * Get the helper registry (for precompiled templates)
   * @returns {HelperRegistry} - The helper registry
   */
  getHelperRegistry(): HelperRegistry {
    return this.helperRegistry;
  }

  /**
   * Get the evaluator instance (for precompiled templates)
   * @returns {ExpressionEvaluator} - The evaluator instance
   */
  getEvaluator(): ExpressionEvaluator {
    return this.renderer['evaluator'];
  }
}
