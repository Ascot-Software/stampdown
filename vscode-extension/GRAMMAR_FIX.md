# Grammar Pattern Matching Fix

**Date:** October 4, 2025

## Problem

Block helpers like `{{#if premium}}` were being incorrectly matched as `meta.function.block.self-closing.handlebars` instead of `meta.function.block.start.handlebars`, which caused:
- Incorrect syntax highlighting
- `{{else}}` being matched incorrectly
- `{{/if}}` being matched incorrectly

## Root Cause

The `self_closing_helper` pattern used `begin/end` matching:

```json
{
  "begin": "(\\{\\{)(~?\\#)([a-zA-Z_][a-zA-Z0-9_-]*)\\s+",
  "end": "(/)(~?\\}\\})"
}
```

This pattern would:
1. Match the beginning: `{{#if premium` (has space after `if`)
2. Look for the end: `/}}`
3. When not found immediately, it would keep the begin match active
4. This caused `{{#if premium}}` to be tagged as self-closing

## Solution

Changed `self_closing_helper` to use a **single `match` pattern** instead of `begin/end`:

```json
{
  "match": "(\\{\\{)(~?\\#)([a-zA-Z_][a-zA-Z0-9_-]*)\\s+([^}]*?)\\s*(/)(~?\\}\\})"
}
```

This pattern now requires:
1. `{{` - Opening delimiter
2. `~?#` - Optional whitespace control + hash
3. `[a-zA-Z_][a-zA-Z0-9_-]*` - Helper name
4. `\\s+` - At least one space (required)
5. `[^}]*?` - Arguments (non-greedy, stops at `}`)
6. `/` - **Required** self-closing slash
7. `~?}}` - Optional whitespace control + closing delimiter

The key difference: The `/` is now **required** in the same pattern, so:
- ✅ `{{#uppercase name/}}` matches (has `/`)
- ❌ `{{#if premium}}` does NOT match (no `/`)

## Pattern Order

Also fixed the pattern order to check more specific patterns first:

```json
"patterns": [
  "#block_comments",        // 1. Comments
  "#comments",
  "#inline_partial",        // 2. Inline partials ({{#*inline}})
  "#partial_block",         // 3. Partial blocks ({{#> layout}})
  "#end_block",             // 4. End blocks ({{/helper}}) ⭐
  "#else_token",            // 5. Else tokens ({{else}}) ⭐
  "#self_closing_helper",   // 6. Self-closing ({{#helper args/}}) ⭐
  "#block_helper",          // 7. Block helpers ({{#helper args}}) ⭐
  "#partial",               // 8. Partials
  "#unescaped_expression",  // 9. Unescaped expressions
  "#expression",            // 10. Regular expressions
  "#markdown"               // 11. Markdown
]
```

## Expected Results

### Block Helper Opening: `{{#if premium}}`
- ✅ **Scope:** `meta.function.block.start.handlebars`
- ✅ **`{{`:** `support.constant.handlebars`
- ✅ **`#`:** `keyword.control.handlebars`
- ✅ **`if`:** `entity.name.function.handlebars`
- ✅ **`premium`:** `variable.parameter.handlebars`
- ✅ **`}}`:** `support.constant.handlebars`

### Else Token: `{{else}}`
- ✅ **Scope:** `meta.function.inline.else.handlebars`
- ✅ **`{{`:** `support.constant.handlebars`
- ✅ **`else`:** `keyword.control.handlebars`
- ✅ **`}}`:** `support.constant.handlebars`

### End Block: `{{/if}}`
- ✅ **Scope:** `meta.function.block.end.handlebars`
- ✅ **`{{`:** `support.constant.handlebars`
- ✅ **`/`:** `keyword.control.handlebars`
- ✅ **`if`:** `entity.name.function.handlebars`
- ✅ **`}}`:** `support.constant.handlebars`

### Self-Closing Helper: `{{#uppercase name/}}`
- ✅ **Scope:** `meta.function.block.self-closing.handlebars`
- ✅ **`{{`:** `support.constant.handlebars`
- ✅ **`#`:** `keyword.control.handlebars`
- ✅ **`uppercase`:** `entity.name.function.handlebars`
- ✅ **`name`:** `variable.parameter.handlebars`
- ✅ **`/`:** `keyword.operator.self-closing.handlebars`
- ✅ **`}}`:** `support.constant.handlebars`

## Testing

Use these test files to verify the fix:
1. `test-block-helpers.sdt` - Basic block helper tests
2. `test-pattern-matching.sdt` - Comprehensive pattern tests

### How to Test

1. Install the extension:
   ```bash
   cd vscode-extension
   code --install-extension stampdown-0.1.0.vsix --force
   ```

2. Reload VS Code

3. Open test files and use "Developer: Inspect Editor Tokens and Scopes" to verify scopes

### What to Check

For each pattern type, verify:
- Correct scope name (`meta.function.block.start` vs `meta.function.block.self-closing`)
- Correct token types (delimiter, keyword, function name, parameter)
- Proper syntax highlighting colors

## Benefits

1. **Correct highlighting** - Each pattern type has its own distinct scope
2. **Theme compatibility** - Standard Handlebars scopes work across themes
3. **No false matches** - Self-closing pattern only matches when `/` is present
4. **Proper structure** - Block helpers, else, and end blocks are distinct
5. **Maintainable** - Single `match` pattern is easier to understand and debug

## Additional Fix: Markdown Greedy Matching

### Problem

Nested Stampdown expressions inside block helpers were being matched as `meta.paragraph.markdown` instead of their proper Stampdown scopes. For example:

```handlebars
{{#each users}}
  {{#if premium}}
    **Premium User:** {{name}}
  {{/if}}
{{/each}}
```

The `{{#if premium}}` inside the `{{#each}}` block was incorrectly scoped as markdown paragraph.

### Cause

The markdown pattern was using `"include": "text.html.markdown"` which includes the full markdown grammar. Markdown's paragraph pattern is extremely greedy and matches everything that isn't explicitly excluded.

Even though block helpers use `"include": "$self"` to recursively include all Stampdown patterns, the markdown grammar was matching first because it operates at the character level.

### Solution

Created a custom markdown pattern that:
1. **Stops before Stampdown delimiters** - Uses negative lookahead `^(?!\\s*\\{\\{)` to not match lines starting with `{{`
2. **Ends at Stampdown patterns** - Uses `end: "(?=\\{\\{)|$"` to stop matching when `{{` is encountered
3. **Includes specific markdown features** - Explicitly includes only: fenced code blocks, headings, blockquotes, lists, horizontal rules, and inline formatting

**New Pattern:**
```json
"markdown": {
  "patterns": [
    {
      "name": "meta.embedded.block.markdown",
      "begin": "^(?!\\s*\\{\\{)",
      "end": "(?=\\{\\{)|$",
      "patterns": [
        {"include": "text.html.markdown#fenced_code_block"},
        {"include": "text.html.markdown#heading"},
        {"include": "text.html.markdown#blockquote"},
        {"include": "text.html.markdown#lists"},
        {"include": "text.html.markdown#horizontal_rule"},
        {"include": "text.html.markdown#inline"}
      ]
    }
  ]
}
```

This ensures:
- ✅ Markdown formatting still works (bold, italic, etc.)
- ✅ Stampdown expressions are matched before markdown
- ✅ Nested Stampdown in block helpers is properly highlighted
- ✅ No greedy paragraph matching that overrides Stampdown scopes

## Lessons Learned

1. **Use `match` for complete patterns** - When the entire pattern must be present, use `match` instead of `begin/end`
2. **Pattern order matters** - More specific patterns must come before general ones
3. **Test edge cases** - Block helpers with and without args, with/without whitespace control
4. **Verify with scope inspector** - Don't assume highlighting is correct, verify token scopes
5. **Beware of greedy grammars** - When including external grammars (like markdown), they can override your patterns with greedy matching
6. **Use negative lookahead** - Prevent patterns from matching where you know other patterns should take precedence
7. **Include specific features** - Instead of including entire grammars, include only the specific features you need
