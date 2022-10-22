const path = require('path')
const selector = require("posthtml-match-helper")
const { PurgeCSS } = require("purgecss")

const root = '.'

module.exports = {
	root,
	input: '*.html',
	output: './assets',
	skip: [],
	options: {},
	plugins: [
		function inlineAssets(tree) {
			return new Promise(resolve => {
				tree.match({
					tag: 'link',
					attrs: { rel: 'stylesheet' }
				}, node => {
					const source = path.join(process.cwd(), root, node.attrs.href)
					
					new PurgeCSS().purge({
						content: [tree.options.from],
						css: [source],
						rejected: true,
						rejectedCss: true,
						// safelist: [/^u-/],
						variables: true
					}).then(([ result ]) => {
						console.log({
							[`Rejected CSS rules from '${node.attrs.href}'`]: result.rejected
						})

						Object.assign(node, {
							tag: 'style',
							attrs: { type: 'text/css' },
							content: result.css
						})

						resolve(tree)
					})

					return node
				})
			})
		},
		function cleanup(tree) {
			tree
				.match([{
					attrs: { 'data-env': 'dev' }
				}], node => ({ tag: false }))
				.match([
						selector("[href^='./assets/']"),
						selector("[src^='./assets/']")
					],
					node => {
						if (typeof node.attrs.src === 'string') {
							node.attrs.src = node.attrs.src.replace('/assets/', '/')
						}
						if (typeof node.attrs.href === 'string') {
							node.attrs.href = node.attrs.href.replace('/assets/', '/')
						}
						return node
					}
				)
		},
		require("htmlnano")({ removeComments: 'all' }),
		require("posthtml-noopener").noopener(),
		require("posthtml-beautify")({
			jsBeautifyOptions: {
				indent_size: 0,
				indent_char: '',
				max_preserve_newlines: -1,
				preserve_newlines: false,
				keep_array_indentation: false,
				break_chained_methods: false,
				indent_scripts: 'normal',
				brace_style: "none,preserve-inline",
				space_before_conditional: false,
				unescape_strings: false,
				jslint_happy: false,
				end_with_newline: false,
				wrap_line_length: 80,
				indent_inner_html: false,
				comma_first: false,
				e4x: false,
				indent_empty_lines: false
			},
			rules: {
				blankLines: false,
				indent: 0,
				sortAttr: true
			}
		})
	]
}


