import typescript from "@rollup/plugin-typescript";

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
	input: "src/index.ts",
	output: [
		{ file: "dist/index.cjs", format: "cjs", dynamicImportInCjs: true },
		{ file: "dist/index.mjs", format: "esm" },
	],
	plugins: [typescript({ tsconfig: "tsconfig.json" })],
	external: ["fs/promises", "path"],
};
