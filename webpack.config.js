/**
 * Webpack configs.
 */

/**
 * Requirements
 */

const webpack = require('webpack'),
	WebpackBabiliPlugin = require('babili-webpack-plugin'),

	update = require('immutability-helper'),
	path = require('path'),

	pkg = require('./package.json'),

	defaultEntry = process.env.WEBPACK_ENTRY || './src/app/main.js',
	defaultDest  = process.env.WEBPACK_OUTPUT_PATH || './dist/app',

	config = configure(defaultEntry, defaultDest);

/**
 * Exports
 */

Reflect.defineProperty(config, 'dev', { value: configureDev });
Reflect.defineProperty(config, 'build', { value: configureBuild });

module.exports = config;

/**
 * Configurators
 */

function configure(entry, dest) {

	const entries = Array.isArray(entry)
		? entry
		: [entry];

	return {
		entry:  entries.map(_ => path.resolve(_)),
		output: {
			path:     path.join(__dirname, dest),
			filename: '[name].js'
		},
		module: {
			rules: [{
				test:    /\.js$/,
				exclude: /node_modules/,
				loader:  'babel-loader',
				query:   update(pkg.babel, {
					babelrc: { $set: false },
					presets: {
						0: { 1: { modules: { $set: false } } }
					}
				})
			}]
		}
	};
}

function configureDev(entry, dest) {
	return update(configure(entry, dest), {
		devtool: { $set: 'cheap-module-eval-source-map' },
		plugins: { $set: [
			new webpack.DefinePlugin({
				'process.env': {
					'NODE_ENV': `'development'`
				}
			}),
			new webpack.NoEmitOnErrorsPlugin()
		] }
	});
}

function configureBuild(entry, dest) {
	return update(configure(entry, dest), {
		plugins: { $set: [
			new webpack.DefinePlugin({
				'process.env': {
					'NODE_ENV': `'production'`
				}
			}),
			new webpack.optimize.OccurrenceOrderPlugin(),
			new WebpackBabiliPlugin()
		] }
	});
}
