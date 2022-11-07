module.exports = {
    parser: false,
    plugins: [
        require("cssnano")({
			preset: ['default', {
                discardComments: {
                    remove: comment => !comment.includes('purgecss'),
                },
            }]
		}),
        require("postcss-import"),
        require("postcss-nested"),
        require("postcss-custom-media")
    ]
}
