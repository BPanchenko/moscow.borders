export default {
	applyCSSLive: true,
	domain: 'local.russia.protosite.rocks',
	exts: [ 'html', 'css', 'js', 'mjs', 'cjs', 'ico', 'svg', 'ttf', 'json' ],
	ports: {
		client: 8080,
		livereload: 35729
	},
	watch: ['', 'assets', 'core', 'design'],
}
