# Options

All options are optional.

## <a name="#mediaQueries"></a> `mediaQueries`

If no option is specified, media queries will be set to the option below

```js
const config = {
  plugins: [
    postcssMediaQueryImporter({
      mediaQueries: {
        small: "@media (max-width: 699px)",
        medium: "@media (min-width: 700px) and (max-width: 1249px)",
        large: "@media (min-width: 1250px)",
      },
    }),
  ],
};

module.exports = config;
```

Media queries can be associated with whatever filenames you want. small, medium, & large are just examples.

Each imported folder does not need to have a corresponding file for every defined media query. From the example above, an imported folder could have a `small` and a `large` file, but no `medium` file.

Media queries will be imported in the order they are defined in the config options. In the example above, each `@import-mq` will first import css from a `small` file, then a `medium` file, and so on. Again, each folder does not need to have a file for each media query.

Each media query rule will be written exactly as typed in the config options. There is no parsing occurring.

Media query files must be either `.postcss` or `.css` files. You can mix file types.

## <a name="#aliasConfigPath"></a> `aliasConfigPath`

Imports can optionally parse the provided path for aliases (See [Import Settings](/docs/ImportSettings.md#aliases)). If you want to avoid passing these arguments manually, this option will parse them from a config on **initial** preprocessing. The file must be at the root of your project and the aliases must be defined in an `alias` Object somewhere in the file's tree.

```js
const config = {
  plugins: [
    postcssMediaQueryImporter({
      aliasConfigPath: 'svelte.config.js',
    }),
  ],
};

module.exports = config;
```

**Examples**

![Svelte Example](/docs/assets/svelte-config.png)
![Vite Example](/docs/assets/vite-config.png)

## <a name="#defaultImportSettings"></a> `defaultImportSettings`

If you want to change the default [Import Settings](/docs/ImportSettings.md), do it here. For example, if [aliasConfigPath](#aliasConfigPath) cannot parse your config file, you can provide aliases with this option rather than to each individual `@import-mq`. Another excellent use case is to enable [indexing](/docs/ImportSettings.md#index) by default

```js
const config = {
  plugins: [
    postcssMediaQueryImporter({
      defaultImportSettings: {
        aliases: {
            $styles: "./src/styles"
        },
        index: true,
      },
    }),
  ],
};

module.exports = config;
```