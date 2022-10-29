import { nodeResolve } from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

const isProd = process.env.NODE_ENV === 'production'

export default {
	input: 'core/main.mjs',
	output: {
		sourcemap: true,
		format: 'esm',
		file: 'assets/core.mjs'
	},
	plugins: [
		nodeResolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		isProd && terser({
			module: true
		})
	]
}
