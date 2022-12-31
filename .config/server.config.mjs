export default {
	applyCSSLive: true,
	domain: 'local.borders.moscow',
	exts: [ 'html', 'css', 'js', 'mjs', 'ico', 'svg', 'ttf', 'woff', 'woff2', 'json' ],
	root: '.',
	ports: {
		client: 8080,
		livereload: 35729
	},
	watch: ['index.html', 'assets']
}
