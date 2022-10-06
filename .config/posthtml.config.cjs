module.exports = {
	root: '.',
	input: '*.html',
	output: './assets',
	skip: [],
	options: {},
	plugins: {
		htmlnano: {
			removeComments: 'all'
		}
	}
}
