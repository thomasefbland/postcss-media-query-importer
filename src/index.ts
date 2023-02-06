import type { AtRule, Node, PluginCreator } from "postcss";

import { readdir, stat, readFile } from "fs/promises";
import path from "path";
import fsExists from "fs.promises.exists";

import { PluginOptions } from "./lib/types";
import ErrorHandler from "./lib/ErrorHandler";
import { parse } from "./lib/paramParser";

const defaultOptions: PluginOptions = {
	mediaQueries: {
		small: "@media (max-width: 699px)",
		medium: "@media (min-width: 700px) and (max-width: 1249px)",
		large: "@media (min-width: 1250px)",
	},
	aliasConfigPath: null,
	defaultImportSettings: {
		index: false,
		aliases: null,
	},
};

function parseAliasConfig(object: Object) {
	if (!object || typeof object != "object") return;

	if (object["alias"]) return object["alias"];

	let result;
	Object.keys(object).forEach((key) => {
		result = parseAliasConfig(object[key]);
		if (result) return;
	});

	return result;
}

const pluginCreator: PluginCreator<PluginOptions> = (options?: PluginOptions) => {
	options = { ...defaultOptions, ...options };

	const __baseDir = process.cwd();

	if (options.aliasConfigPath) {
		try {
			import(path.resolve(__baseDir, options.aliasConfigPath)).then((module) => {
				const aliases = parseAliasConfig(module.default);
				if (aliases == undefined) throw new Error("[PostCSS-Media-Query-Importer]: Alias field is undefined or null at " + options.aliasConfigPath);

				options.defaultImportSettings.aliases = aliases;
			});
		} catch (error) {
			throw new Error("[PostCSS-Media-Query-Importer]: " + error);
		}
	}

	return {
		postcssPlugin: "postcss-media-query-importer",

		AtRule: {
			"import-mq": async (node, { AtRule }) => {
				const errorHandler = new ErrorHandler(node);

				if (!node.params) throw errorHandler.error("No parameter provided");
				if (node.params.length < 4) throw errorHandler.error("Invalid parameter provided");

				const { url, settings } = parse(node.params, options, errorHandler);

				if (!url) throw errorHandler.error("Issue parsing parameters");

				const nodeFile = node.source.input.file;

				if (nodeFile == null) throw node.error("Error parsing file location");

				let resolvedPath = path.resolve(nodeFile, url);

				const relativePathExists = await fsExists(resolvedPath);

				if (!relativePathExists) resolvedPath = path.resolve(__baseDir, url);

				const stats = await stat(resolvedPath);
				if (!stats.isDirectory()) throw errorHandler.error("Referenced location is not a directory");

				try {
					const files = await readdir(resolvedPath);

					if (files.length > 0) {
						const importedMediaQueries = new Map<string, AtRule>();

						if (settings.index) {
							// Search for index file
							const matchRegex = new RegExp(`(${path.basename(resolvedPath)}|index)\.(css|postcss)`);
							const index = files.findIndex((file) => matchRegex.test(file));
							if (index < 0) throw errorHandler.error("Index file not found at " + resolvedPath);

							// Add index file content to import
							const indexFilePath = path.join(resolvedPath, files[index]);
							const indexFileContent = await readFile(indexFilePath, { encoding: "utf8" });
							node.before(indexFileContent);

							files.splice(index, 1);
						}

						const cssMatchRegex = /.+\.css/g;
						const postcssMatchRegex = /.+\.postcss/g;

						for (const file of files) {
							if (!file.match(cssMatchRegex) && !file.match(postcssMatchRegex)) continue;

							const fileExtensionIndex = file.match(cssMatchRegex) ? file.lastIndexOf(".css") : file.lastIndexOf(".postcss");
							const fileName = file.substring(0, fileExtensionIndex);

							if (options.mediaQueries[fileName] == null) continue;

							const filePath = path.join(resolvedPath, file);
							const fileContent = await readFile(filePath, { encoding: "utf8" });

							const mediaQuery = new AtRule({
								name: "media",
								params: options.mediaQueries[fileName].split("@media ")[1],
							});

							mediaQuery.append(fileContent);

							// formatting
							mediaQuery.nodes.forEach((node) => node.cleanRaws());
							mediaQuery.nodes[0].raws.before = "\n	";

							importedMediaQueries.set(fileName, mediaQuery);
						}

						for (const mq in options.mediaQueries) {
							const newNode = importedMediaQueries.get(mq);
							if (newNode == undefined) continue;

							node.before(newNode);
						}
					} else {
						errorHandler.error("Referenced directory is empty");
					}
					node.remove();
				} catch (error) {
					throw node.error(error);
				}
			},
		},
	};
};

pluginCreator.postcss = true;

export default pluginCreator;
