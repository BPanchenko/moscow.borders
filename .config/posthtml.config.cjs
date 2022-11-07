const path = require('path')
const selector = require("posthtml-match-helper")
const { PurgeCSS } = require("purgecss")

const isProd = process.env.NODE_ENV === 'production'
const root = '.'
const plugins = []

if (isProd) {
	plugins.push(
		inlineCSS,
		removeDevTags
	)
}

plugins.push(
	require("posthtml-inline-svg")({
		cwd: path.resolve('.'),
		tag: 'img',
		attr: 'src'
	}),
	updatePaths,
	require("htmlnano")({ removeComments: 'all' }),
	require("posthtml-noopener").noopener(),
	require("posthtml-beautify")(require("./posthtml-beautify.config.cjs"))
)

function inlineCSS(tree) {
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

function removeDevTags(tree) {
	tree.match([{
		attrs: { 'data-env': 'dev' }
	}], () => ({ tag: false }))
}

function updatePaths(tree) {
	tree.match(
		[
			selector("[data-url^='./assets/']"),
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
			if (typeof node.attrs['data-url'] === 'string') {
				node.attrs['data-url'] = node.attrs['data-url'].replace('/assets/', '/')
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
