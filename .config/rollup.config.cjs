module.exports = {
	input: 'core/main.mjs',
	output: {
		sourcemap: true,
		format: 'esm',
		file: 'assets/core.mjs'
	},
	plugins: [
		require("@rollup/plugin-node-resolve").nodeResolve(),
		require("rollup-plugin-terser").terser()
	]
}
