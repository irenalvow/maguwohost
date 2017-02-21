/**
 * Helpers for gulpfile.js
 */

/**
 * Requirements
 */

const notify_ = require('gulp-notify');

/**
 * Notify proxy
 */

exports.notify = notify;
function notify(message, now) {

	if (now) {

		const notification = notify(message);

		notification._transform(true, null, () => 1);
		notification._flush(() => 1);

		return null;
	}

	return notify_({
		message,
		sound:  'Glass',
		onLast: true
	});
}

notify.onError = notify_.onError('Error: <%= error.message %>');

/**
 * Error reporter helper
 */

exports.reportError =
function reportError(error) {

	notify.onError(error);

	let errorString = error.toString(),
		errorStack  = error.stack;

	if (!/\n$/.test(errorString)) {
		errorString += '\n';
	}

	process.stderr.write(errorString);

	if (errorStack) {

		if (!/\n$/.test(errorStack)) {
			errorStack += '\n';
		}

		process.stderr.write(errorStack);
	}

	process.exitCode = 1;
	this.emit('end');
};

/**
 * Extend gulp-connect
 */

exports.extendGulpConnect =
function extendGulpConnect(gulpConnect) {

	const origServerMethod = gulpConnect.server,
		apps = [];

	gulpConnect.server = (options) => {

		const app = origServerMethod(options);

		return apps.push(app);
	};

	gulpConnect.changed = (files) => {
		apps.forEach((app) => {
			app.lr.changed({
				body: { files }
			});
		});
	};
};
