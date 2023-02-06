import { PluginOptions, ImportSettings } from "./types";
import ErrorHandler from "./ErrorHandler";

const URL_ONLY_REGEX = /^('|")[A-Za-z0-9\s\_\.\-/$~]{5,}('|");?$/;
const PARENS_PARAMS_REGEX = /^\(('|")[A-Za-z0-9\s\_\.\-/$~]{5,}('|")(,\s*{.+})?\)$/;

export function parse(
	params: string,
	options: PluginOptions,
	errorHandler: ErrorHandler
): {
	url: string;
	settings: ImportSettings;
} {
	if (URL_ONLY_REGEX.test(params)) {
		let url = params.endsWith(";") ? params.substring(0, params.length - 1) : params;
		const settings: ImportSettings = options.defaultImportSettings;

		if (settings.aliases) url = replaceAliases(url, settings);

		url = url.replace(/['"]+/g, "");

		return {
			url,
			settings,
		};
	} else if (PARENS_PARAMS_REGEX.test(params)) {
		const _params = params.substring(1, params.lastIndexOf(")")).split(",");
		let url = _params[0];
		const settings: ImportSettings = { ...options.defaultImportSettings, ...JSON.parse(_params[1]) };

		if (settings.aliases) url = replaceAliases(url, settings);

		url = url.replace(/['"]+/g, "");

		return {
			url,
			settings,
		};
	} else throw errorHandler.error("Invalid import parameters");
}

function replaceAliases(url: string, settings: ImportSettings) {
	for (const alias of Object.getOwnPropertyNames(settings.aliases)) {
		url = url.replaceAll(alias, settings.aliases[alias]);
	}
	return url;
}
