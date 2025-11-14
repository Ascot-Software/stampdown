## Classes

<dl>
<dt><a href="#StampdownMatcher">StampdownMatcher</a></dt>
<dd><p>Creates a MatchDecorator for highlighting Stampdown syntax</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#STAMPDOWN_PATTERNS">STAMPDOWN_PATTERNS</a></dt>
<dd><p>Regex patterns for Stampdown syntax elements</p>
</dd>
<dt><a href="#stampdownHighlight">stampdownHighlight</a></dt>
<dd><p>ViewPlugin for Stampdown syntax highlighting</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#stampdown">stampdown(config)</a> ⇒ <code>LanguageSupport</code></dt>
<dd><p>Create a Stampdown language support extension</p>
<p>This extends the markdown language with Stampdown-specific syntax highlighting.</p>
</dd>
</dl>

<a name="StampdownMatcher"></a>

## StampdownMatcher
Creates a MatchDecorator for highlighting Stampdown syntax

**Kind**: global class  

* [StampdownMatcher](#StampdownMatcher)
    * [.createDeco(view)](#StampdownMatcher+createDeco) ⇒ <code>object</code>
    * [.updateDeco(update, decorations)](#StampdownMatcher+updateDeco) ⇒ <code>object</code>
    * [.mergeDeco(decos)](#StampdownMatcher+mergeDeco) ⇒ <code>object</code>

<a name="StampdownMatcher+createDeco"></a>

### stampdownMatcher.createDeco(view) ⇒ <code>object</code>
Create decorations for the entire view

**Kind**: instance method of [<code>StampdownMatcher</code>](#StampdownMatcher)  
**Returns**: <code>object</code> - - The set of decorations  

| Param | Type | Description |
| --- | --- | --- |
| view | <code>object</code> | The editor view |

<a name="StampdownMatcher+updateDeco"></a>

### stampdownMatcher.updateDeco(update, decorations) ⇒ <code>object</code>
Update decorations when the document changes

**Kind**: instance method of [<code>StampdownMatcher</code>](#StampdownMatcher)  
**Returns**: <code>object</code> - - The updated decorations  

| Param | Type | Description |
| --- | --- | --- |
| update | <code>object</code> | The view update |
| decorations | <code>object</code> | The current decorations |

<a name="StampdownMatcher+mergeDeco"></a>

### stampdownMatcher.mergeDeco(decos) ⇒ <code>object</code>
Merge multiple decoration sets into one

**Kind**: instance method of [<code>StampdownMatcher</code>](#StampdownMatcher)  
**Returns**: <code>object</code> - - Merged decoration set  

| Param | Type | Description |
| --- | --- | --- |
| decos | <code>Array.&lt;object&gt;</code> | Array of decoration sets |

<a name="STAMPDOWN_PATTERNS"></a>

## STAMPDOWN\_PATTERNS
Regex patterns for Stampdown syntax elements

**Kind**: global constant  
<a name="stampdownHighlight"></a>

## stampdownHighlight
ViewPlugin for Stampdown syntax highlighting

**Kind**: global constant  
<a name="stampdown"></a>

## stampdown(config) ⇒ <code>LanguageSupport</code>
Create a Stampdown language support extension

This extends the markdown language with Stampdown-specific syntax highlighting.

**Kind**: global function  
**Returns**: <code>LanguageSupport</code> - CodeMirror language support  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | Configuration options (passed to markdown()) |

**Example**  
```js
import { stampdown } from './stampdownLanguage'
import { EditorState } from '@codemirror/state'

const state = EditorState.create({
  doc: '# Hello {{name}}\n\n{{#if active}}Active{{/if}}',
  extensions: [stampdown()]
})
```
