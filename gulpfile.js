/**
 * Requirements
 */

const gulp  = require('gulp'),
	gutil   = require('gulp-util'),
	replace = require('gulp-replace'),
    sm      = require('gulp-sourcemaps'),
    connect = require('gulp-connect')
	notify_ = require('gulp-notify'),

	procss   = require('gulp-progressive-css'),
	htmlmin  = require('gulp-htmlmin'),
	htmlLint = require('gulp-html-linter'),

	srcset = require('gulp-srcset'),

    importer  = require('sass-import-modules'),
    csso      = require('gulp-cssnano'),
    auto      = require('gulp-autoprefixer'),
    sass      = require('gulp-sass'),
    styleLint = require('gulp-stylelint');

/**
 * Notify proxy
 */

function notify(message, now) {

	if (now) {

		const notification = notify(message);

		notification._transform(true, null, () => 1);
		notification._flush(() => 1);

		return;
	}

    return notify_({
        message: message,
        sound:   'Glass',
        onLast:  true
    });
}

notify.onError = notify_.onError('Error: <%= error.message %>');

/**
 * Error reporter helper
 */

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
}

/**
 * Configs
 */

const browsers = '> 1%, last 2 versions, iOS > 7, Android > 4.4, not OperaMini all';

const paths = {
	html:   'src/**.html',
	images: 'src/**/*.{jpg,webp,png,svg,gif}',
	styles: 'src/**/*.scss'
};

/**
 * HTML tasks
 */

gulp.task('html:watch', (done) => {
	gulp.watch(paths.html, gulp.series('html:dev'));
	done();
});

gulp.task('html:lint', () =>
	gulp.src(paths.html)
		.pipe(htmlLint())
		.pipe(htmlLint.format())
		.pipe(htmlLint.failOnError())
		.on('error', reportError)
);

gulp.task('html:dev', gulp.parallel('html:lint', () =>
	gulp.src(paths.html)
		.pipe(gulp.dest('dist'))
		.pipe(connect.reload())
		.pipe(notify('HTML files are updated.'))
));

gulp.task('html:build', gulp.series('html:lint', () =>
	gulp.src(paths.html)
		.pipe(replace('ASSETS_VERSION', new Date().getTime()))
		.pipe(procss({ base: 'dist', useXHR: true }))
		.pipe(htmlmin({ collapseWhitespace: true }))
		.on('error', reportError)
		.pipe(gulp.dest('dist'))
		.pipe(notify('HTML files are compiled.'))
));

/**
 * Images tasks
 */

gulp.task('images:watch', (done) => {
	gulp.watch(paths.images, gulp.series('images:dev'));
	done();
});

gulp.task('images:dev', () =>
	gulp.src(paths.images)
		.pipe(srcset([{
			match:  '**/*.jpg',
			format: ['jpg', 'webp']
		}, {
			match:  '**/*.png'
		}]))
		.pipe(gulp.dest('dist'))
		.pipe(connect.reload())
		.pipe(notify('Images are updated.'))
);

gulp.task('images:build', () =>
	gulp.src(paths.images)
		.pipe(srcset([{
			match:  '**/*.jpg',
			format: ['jpg', 'webp']
		}, {
			match:  '**/*.png'
		}]))
		.pipe(gulp.dest('dist'))
		.pipe(notify('Images are generated.'))
);

/**
 * Style tasks
 */

gulp.task('style:watch', (done) => {
	gulp.watch(paths.styles, gulp.series('style:dev'));
	done();
});

gulp.task('style:lint', () =>
	gulp.src(paths.styles)
		.pipe(styleLint({
			reporters: [{ formatter: 'string', console: true }],
			failAfterError: true
		}))
		.on('error', reportError)
);

gulp.task('style:dev', gulp.parallel('style:lint', () =>
	gulp.src(paths.styles)
		.pipe(sm.init())
			.pipe(sass({ importer }))
			.on('error', reportError)
			.pipe(auto({ browsers }))
		.pipe(sm.write())
		.pipe(gulp.dest('dist'))
		.pipe(connect.reload())
		.pipe(notify('Styles are updated.'))
));

gulp.task('style:build', gulp.series('style:lint', () =>
	gulp.src(paths.styles)
		.pipe(sass({ importer }))
		.on('error', reportError)
		.pipe(auto({ browsers }))
		.pipe(csso({
			reduceIdents: false,
			zindex:       false
		}))
		.pipe(gulp.dest('dist'))
		.pipe(notify('Styles are compiled.'))
));

/**
 * Main tasks
 */

gulp.task('watch', gulp.parallel(
	'html:watch',
	'images:watch',
	'style:watch'
));

gulp.task('server', (done) => {
	connect.server({
		root:       'dist',
		livereload: true
	});
	done();
});

gulp.task('dev', gulp.series(
	gulp.parallel(
		'html:dev',
		'images:dev',
		'style:dev'
	),
	'server',
	'watch'
));

gulp.task('build', gulp.parallel(
	gulp.series(
		'style:build',
		'html:build'
	),
	'images:build'
));

gulp.task('default', gulp.series('dev'));
