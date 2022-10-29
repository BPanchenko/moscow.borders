const path = require('path')
const selector = require("posthtml-match-helper")
const { PurgeCSS } = require("purgecss")

const isProd = process.env.NODE_ENV === 'production'
const root = '.'
const plugins = []

if (isProd) {
	plugins.push(inlineAssets)
}

plugins.push(
	cleanup,
	require("htmlnano")({ removeComments: 'all' }),
	require("posthtml-noopener").noopener(),
	require("posthtml-beautify")(require("./posthtml-beautify.config.cjs"))
)

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
}

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
}

module.exports = {
	root,
	input: '*.html',
	output: './assets',
	skip: [],
	options: {},
	plugins
}
