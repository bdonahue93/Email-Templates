# Your Custom Email Campaign Name Here
Optionated development tools for Sass-y email building and automated CSS inlining.

More specifically, the workflow included in this repo:
- Compiles Sass
- Inlines CSS
- Condenses HTML, removes comments and enforces [maximum line lengths](https://tools.ietf.org/html/rfc821#page-43)* (see note under gulp-config.js options)
- Removes unused CSS classes from HTML
- Intelligently encodes special characters to HTML entities in text nodes


## Requirements
- node
- gulp-cli


## Setup
1. Clone this repo to your local development environment
2. `cp gulp-config.template.json gulp-config.json`; edit new config file as necessary
3. `npm install` from root directory of the repo
4. Update `src/scss/_variables.scss` to add URLs for the "UCF-Sans-Serif-Alt" font family (see `$font-sans-serif`), if they haven't already been added
5. Run an initial build of included files: `gulp default`

### gulp-config.json Options:

Option | Type | Description
------ | ---- | -----------
sync | boolean | Whether or not BrowserSync should be used.
syncIndex | string | The index file to point BrowserSync to; this should be an html file in `dist/`, or the `dist/` directory itself. If you're developing within MAMP or another local environment, include the URL of your localhost--e.g. `http://localhost/my-project/dist/...`
juice | object | Options to pass to [Juice](https://github.com/Automattic/juice#options).
htmlmin | object | Options to pass to [HTMLMinifier](https://github.com/kangax/html-minifier#options-quick-reference).
declassify | object | Options to pass to [Declassify](https://github.com/jrit/declassify#options)

* NOTE: the htmlmin.maxLineLength option will NOT break a single line of text if it is too long--you are still responsible for ensuring text contents don't exceed 1000 characters.


## Development
1. `gulp watch` to automatically run scss compilation and html inlining as you work.
2. Edit files in `src/`.  Don't add inline css or attributes to your email markup; by default, table and image elements are automatically assigned relevant email-friendly attributes such as "align" and "valign" depending on assigned styles ([see Juice defaults](https://github.com/Automattic/juice/blob/8e16f5b1027964e9cc117520c42bfd3fbd9d78f8/client.js#L18-L27)).  `gulp-watch` will do its thing when you save an .html or .scss file.  Inlined, Litmus-ready files will be saved to `dist/`.
3. Test your email in Litmus.  Rinse and repeat Step 2 until your email looks acceptable in all desired clients.

### Using The Inliner Tools
By default, styles in `<link>` and `<style>` tags are inlined into the html template when `gulp default` or `gulp html-inline` are run, and the original `<link>` or `<style>` tags are removed (unless they contain media queries; in which case, only the media queries will remain.)

You can use the following data attributes to modify how styles are parsed by the inliner tools:

#### `data-embed`
Add to a `<link>` tag to download the stylesheet's contents, but embed them in the document head in `<style>` tags and do not inline.  Useful for including things like client-specific overrides without muddying up your html template.

#### `data-inline-ignore`
Add to a `<link>` tag to prevent inlining entirely (the output html file will still contain the `<link>` tag).

### Using The Character Encoding Tools
By default, all text nodes in the html template have special characters converted to html entities, making it easy to copy and paste content from Word docs/rich text editors.

You can use the following data attributes to modify how html entities are processed:

#### `data-skip-encoding`
Add to any element (like `<td>`) to prevent html entity encoding on the element's immediate child text node(s).  Useful for adding things like [preview text hacks](https://www.litmus.com/blog/the-little-known-preview-text-hack-you-may-want-to-use-in-every-email/).
