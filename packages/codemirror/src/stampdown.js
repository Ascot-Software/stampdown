/**
 * Stampdown Language Support for CodeMirror
 *
 * Extends @codemirror/lang-markdown with custom syntax highlighting for Stampdown templates.
 * Stampdown is a Markdown templating language with Handlebars-like syntax.
 *
 * Syntax Patterns:
 * - Variables: {{variable}}, {{object.property}}
 * - Block helpers: {{#if condition}}...{{/if}}
 * - Self-closing helpers: {{#helper arg/}}
 * - Partials: {{> partialName}}
 * - Comments: {{! comment }}
 */

import { markdown } from '@codemirror/lang-markdown'
import { ViewPlugin, Decoration, MatchDecorator } from '@codemirror/view'
import { LanguageSupport } from '@codemirror/language'

/**
 * Regex patterns for Stampdown syntax elements
 */
const STAMPDOWN_PATTERNS = {
  // Comments: {{! comment }}
  comment: /\{\{!\s*[^}]*\}\}/g,

  // Block opening tags: {{#if}}, {{#each}}, {{#with}}, etc.
  blockOpen: /\{\{#(\w+)(?:\s+[^}]*)?\}\}/g,

  // Block closing tags: {{/if}}, {{/each}}, {{/with}}, etc.
  blockClose: /\{\{\/(\w+)\}\}/g,

  // Self-closing helpers: {{#helper arg/}}
  selfClosing: /\{\{#(\w+)(?:\s+[^}]*)?\/\}\}/g,

  // Partials: {{> partialName}}
  partial: /\{\{>\s*(\w+)\}\}/g,

  // Variables: {{variable}}, {{object.property}}, but not block helpers, partials, or comments
  variable: /\{\{(?![#/>!])[^}]+\}\}/g,
}

/**
 * Creates a MatchDecorator for highlighting Stampdown syntax
 */
class StampdownMatcher {
  constructor() {
    // Create decorations for each syntax type
    this.commentDeco = Decoration.mark({ class: 'stampdown-comment' })
    this.blockOpenDeco = Decoration.mark({ class: 'stampdown-block-open' })
    this.blockCloseDeco = Decoration.mark({ class: 'stampdown-block-close' })
    this.selfClosingDeco = Decoration.mark({ class: 'stampdown-self-closing' })
    this.partialDeco = Decoration.mark({ class: 'stampdown-partial' })
    this.variableDeco = Decoration.mark({ class: 'stampdown-variable' })

    // Create matchers for each pattern
    this.matchers = [
      // Order matters: match comments first, then other patterns
      new MatchDecorator({
        regexp: STAMPDOWN_PATTERNS.comment,
        decoration: this.commentDeco,
      }),
      new MatchDecorator({
        regexp: STAMPDOWN_PATTERNS.blockOpen,
        decoration: this.blockOpenDeco,
      }),
      new MatchDecorator({
        regexp: STAMPDOWN_PATTERNS.blockClose,
        decoration: this.blockCloseDeco,
      }),
      new MatchDecorator({
        regexp: STAMPDOWN_PATTERNS.selfClosing,
        decoration: this.selfClosingDeco,
      }),
      new MatchDecorator({
        regexp: STAMPDOWN_PATTERNS.partial,
        decoration: this.partialDeco,
      }),
      new MatchDecorator({
        regexp: STAMPDOWN_PATTERNS.variable,
        decoration: this.variableDeco,
      }),
    ]
  }

  /**
   * Create decorations for the entire view
   */
  createDeco(view) {
    let decorations = []
    for (const matcher of this.matchers) {
      decorations.push(matcher.createDeco(view))
    }
    return this.mergeDeco(decorations)
  }

  /**
   * Update decorations when the document changes
   */
  updateDeco(update, decorations) {
    if (update.docChanged || update.viewportChanged) {
      return this.createDeco(update.view)
    }
    return decorations
  }

  /**
   * Merge multiple decoration sets into one
   */
  mergeDeco(decos) {
    if (decos.length === 0) return Decoration.none
    if (decos.length === 1) return decos[0]

    // Merge all decorations into a single set
    let ranges = []
    for (const deco of decos) {
      deco.between(0, Number.MAX_SAFE_INTEGER, (from, to, value) => {
        ranges.push({ from, to, value })
      })
    }

    // Sort by position
    ranges.sort((a, b) => a.from - b.from || a.to - b.to)

    // Build final decoration set
    return Decoration.set(
      ranges.map((r) => r.value.range(r.from, r.to)),
      true
    )
  }
}

/**
 * ViewPlugin for Stampdown syntax highlighting
 */
const stampdownHighlight = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.matcher = new StampdownMatcher()
      this.decorations = this.matcher.createDeco(view)
    }

    update(update) {
      this.decorations = this.matcher.updateDeco(update, this.decorations)
    }
  },
  {
    decorations: (v) => v.decorations,
  }
)

/**
 * Create a Stampdown language support extension
 *
 * This extends the markdown language with Stampdown-specific syntax highlighting.
 *
 * @param {Object} config - Configuration options (passed to markdown())
 * @returns {LanguageSupport} CodeMirror language support
 *
 * @example
 * import { stampdown } from './stampdownLanguage'
 * import { EditorState } from '@codemirror/state'
 *
 * const state = EditorState.create({
 *   doc: '# Hello {{name}}\n\n{{#if active}}Active{{/if}}',
 *   extensions: [stampdown()]
 * })
 */
export function stampdown(config = {}) {
  // Ensure config is an object (handle null/undefined)
  const safeConfig = config || {}

  // Get the base markdown language support
  const markdownSupport = markdown(safeConfig)

  // Return a new LanguageSupport that combines markdown with Stampdown highlighting
  return new LanguageSupport(markdownSupport.language, [
    ...markdownSupport.support,
    stampdownHighlight,
  ])
}
