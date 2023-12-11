// Initialize modules
const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const browsersync = require('browser-sync');


// sass.compiler =require('dart-sass');

// Sass Task
function scssTask() {
	return src('app/scss/style.scss', { sourcemaps: true })
		.pipe(sass())
		.pipe(postcss([autoprefixer(), cssnano()]))
		.pipe(dest('dist', { sourcemaps: '.' }));
}

// JavaScript Task
function jsTask() {
	return src('app/js/script.js', { sourcemaps: true })
		.pipe(babel({ presets: ['@babel/preset-env'] }))
		.pipe(terser())
		.pipe(dest('dist', { sourcemaps: '.' }));
}

// Browsersync
function browserSyncServe(cb) {
	browsersync.create().init({
		server: {
			baseDir: '.',
		},
		notify: {
			styles: {
				top: 'auto',
				bottom: '0',
			},
		},
	});
	gulp.task('webserver', function() {
	    browserSync({
	        server: {
	            baseDir: "https://im8kritika.github.io/wordle-/"
	        }
	    });
	});
	cb();
}
function browserSyncReload(cb) {
	browsersync.reload();
	cb();
}

// Watch Task
function watchTask() {
	watch('*.html', browserSyncReload);
	watch(
		['app/scss/**/*.scss', 'app/**/*.js'],
		series(scssTask, jsTask, browserSyncReload)
	);
}

// Default Gulp Task
exports.default = series(scssTask, jsTask, browserSyncServe, watchTask);

exports.build = series(scssTask, jsTask);

const relative = require('./document-relative');
gulp.task('relative-urls', function() {
    return gulp.src('build/**/*.html')
        .pipe( relative({
            directory: 'build',
            url: 'https://im8kritika.github.io/wordle-/',
        }) )
        .pipe( gulp.dest('build') );
});
