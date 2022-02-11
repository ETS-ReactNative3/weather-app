module.exports = function (api) {
	if (api) api.cache(true);
	return {
		presets: ["babel-preset-expo"],
		plugins: [
			[
				"module-resolver",
				{
					cwd: "babelrc",
					extensions: [".ts", ".tsx", ".js", "jsx", "svg", ".ios.js", ".android.js"],
					alias: {
						"@weather": "./",
					},
				},
			],
		],
	};
};
