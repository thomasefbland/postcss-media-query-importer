# Import Settings

Import Settings can be defined on a per import basis, or with [defaultImportSettings](/docs/PluginOptions.md#defaultImportSettings).
Inline settings must be in valid json format.

---

## <a name="#index"></a> `index`
**Default**: `false`

When set to true, `import-mq` will first import css from an index.css or <folderName\>.css, before importing media query files. Unlike media query files, an index file is not optional when enabled.

```css
@import-mq ('~styles/foo', {aliases: {"index": true}});
```

<br/>

## <a name="#aliases"></a> `aliases`
**Default**: `null`

When defined, `import-mq` will first parse provided urls for aliases before attempting to import css.

```css
@import-mq ('~styles/foo', {aliases: {"~styles": "./src/styles"}});
```