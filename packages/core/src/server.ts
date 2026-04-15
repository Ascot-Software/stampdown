/**
 * Stampdown server entry point
 * Exposes the full API surface, including filesystem-backed template loading.
 */

export * from './shared';
export { TemplateLoader, type CompiledTemplate } from './loader';
