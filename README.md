# postcss-media-query-importer

A [PostCSS] plugin to easily manage media queries in your project. Define media queries and corresponding filenames in the plugin options. Then use `@importMQ '[path-to-folder]'` anywhere in your css

[postcss]: https://github.com/postcss/postcss

### Example

#### Input

```css
/* styles/foo.postcss */
.foo {
  font-family: "Comic Sans";
  color: yellow;
}

@importMQ '../foo-responsive'


/* styles/foo-responsive/xs.postcss */
.foo {
  font-size: 12px;
}


/* styles/foo-responsive/lg.postcss */
.foo {
  font-size: 18px;
}
```

#### Output

```css
/* styles/foo.postcss */
.foo {
  font-family: "Comic Sans";
  color: yellow;
}

@media all and (max-width: 699px) {
  .foo {
    font-size: 12px;
  }
}

@media all and (min-width: 1440px) {
  .foo {
    font-size: 18px;
  }
}
```

## Usage

**Step 1:** Install the plugin:

```sh
npm install --save-dev postcss postcss-media-query-importer
```

**Step 2:** Add the plugin to plugins list and define your project media queries:

```diff
+ const postcssMediaQueryImporter = require('postcss-media-query-importer')

module.exports = {
  plugins: [
    require('autoprefixer'),
+    postcssMediaQueryImporter(
+       ...options  
+    ),
  ]
}
```

## Options

#### <a name="#mediaQueries"></a> `mediaQueries`

If no option is specified, media queries will be set to the option below

```js
mediaQueries: {
  xs: "@media all and (max-width: 699px)",
  sm: "@media all and (min-width: 700px) and (max-width: 1249px)",
  md: "@media all and (min-width: 1250px) and (max-width: 1439px)",
  lg: "@media all and (min-width: 1440px)"
}
```

Media queries can be associated with whatever filenames you want. xs, sm, md, & lg are just examples.

Each imported folder does not need to have a corresponding file for every defined media query. From the example above, an imported folder could have an `sm.css` & `md.css` file, but no `xs.css` or `lg.css` file.

Media queries will be imported in the order they are defined in the config options. In the example above, each `@importMQ` will first import css from an `xs.css` file, then an `sm.css` file, and so on. Again, each folder does not need to have a file for each media query.

Each media query rule will be written exactly as typed in the config options. There is no parsing occurring.

Media query files must be .postcss or .css files.