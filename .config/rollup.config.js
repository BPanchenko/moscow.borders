import { nodeResolve } from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

const IS_PROD = !process.env.ROLLUP_WATCH

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
		IS_PROD && terser({
			module: true
		})
	]
}
