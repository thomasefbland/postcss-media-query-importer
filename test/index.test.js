const postcss = require("postcss");

const plugin = require("../src");

const { readdirSync, readFileSync, existsSync } = require("fs");

const examples = readdirSync("./test", { withFileTypes: true }).filter((res) => res.isDirectory());
for (const example of examples) {
	try {
		var input = readFileSync("./test/" + example.name + "/" + example.name + ".postcss", "utf8");
		var output = readFileSync("./test/" + example.name + "/" + example.name + ".expect.postcss", "utf8");
		const optionFilePath = "./test/" + example.name + "/" + example.name + ".options.json";
		var options = existsSync(optionFilePath) ? readFileSync(optionFilePath) : null;
	} catch (error) {
		throw error;
	}

	test(`Testing Example: ${example.name}`, async () => {
		const result = await run(input, options, example.name);
		expect(result.css).toEqual(output);
		expect(result.warnings()).toHaveLength(0);
	});
}

async function run(input, options, exampleName) {
	try {
		options = JSON.parse(options);
	} catch (error) {
		throw error;
	}
	return await postcss([plugin(options)]).process(input, {
		from: `test/${exampleName}/example.postcss`,
	});
}
