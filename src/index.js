/**
 * @type {import('postcss').PluginCreator}
 */

const { readdir, stat, readFile } = require("fs/promises");
const path = require("path");

module.exports = (opts = {}) => {
  let mediaQueries = Object(opts).mediaQueries;

  mediaQueries = mediaQueries ?? {
    xs: "@media all and (max-width: 699px)",
    sm: "@media all and (min-width: 700px) and (max-width: 1249px)",
    md: "@media all and (min-width: 1250px) and (max-width: 1439px)",
    lg: "@media all and (min-width: 1440px)",
  };

  // const toplevelDir = path.resolve(process.cwd());

  return {
    postcssPlugin: "postcss-media-query-importer",

    AtRule: {
      importMQ: async (node, { AtRule }) => {
        if (!node.params) throw node.error("No parameter provided");
        if (typeof node.params !== "string" || node.params.length < 4)
          throw node.error("Invalid parameter provided");

        const nodeFile = node.source.input.file;

        if (nodeFile == null) throw node.error("Error parsing file location");

        const resolvedPath = path.resolve(
          nodeFile,
          node.params.slice(1, node.params.length - 1)
        );

        // const resolvedPath = nodeFile
        //   ? path.resolve(nodeFile, node.params.slice(1, node.params.length - 1))
        //   : path.resolve(toplevelDir, node.params.slice(1, node.params.length - 1));

        try {
          const stats = await stat(resolvedPath);
          if (!stats.isDirectory())
            throw node.error("Referenced location is not a directory");

          const files = await readdir(resolvedPath);

          const importedMediaQueries = new Map();

          for (const file of files) {
            const fileExtensionIndex = file.indexOf(".css" || ".postcss");
            if (fileExtensionIndex < 0) continue;

            const fileName = file.substring(0, fileExtensionIndex);
            if (mediaQueries[fileName] == null) continue;

            const filePath = path.join(resolvedPath, file);

            const mediaQuery = new AtRule({
              name: "media",
              params: mediaQueries[fileName].split("@media ")[1],
            });

            const fileContent = await readFile(filePath, { encoding: "utf8" });

            mediaQuery.append(fileContent);

            mediaQuery.nodes.forEach((node) => node.cleanRaws());

            mediaQuery.nodes[0].raws.before = "\n  ";

            importedMediaQueries.set(file.split(".css")[0], mediaQuery);
          }

          for (const mq in mediaQueries) {
            node.before(importedMediaQueries.get(mq));
          }
          node.remove();
        } catch (error) {
          throw node.error(error);
        }
      },
    },
  };
};

module.exports.postcss = true;
