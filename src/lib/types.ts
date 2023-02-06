export type PluginOptions = {
	mediaQueries?: Object;
	aliasConfigPath?: string;
	defaultImportSettings?: ImportSettings;
};

export type ImportSettings = {
	index: boolean;
	aliases: string | Array<{ [key: string]: string }>;
};
