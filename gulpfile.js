const 	gulp = require('gulp'),
		pug  = require('gulp-pug'),
		gulpHtmlBemValidator = require('gulp-html-bem-validator'),
		sass = require('gulp-sass'),
		rename = require('gulp-rename'),
		shorthand = require('gulp-shorthand'),
		autoprefixer = require('gulp-autoprefixer'),
		babel = require('gulp-babel'),
		del = require('del'),
		concat = require('gulp-concat'),
		csso = require('gulp-csso'),
		imagemin = require('gulp-imagemin'),
		uglify = require('gulp-uglify-es').default,
		imageminMozjpeg = require('imagemin-mozjpeg'),
		plumber = require('gulp-plumber'),
		server = require('browser-sync').create();	
	
const clean = module.exports = function clean() {
	return del('dist');
};

const pug2html = module.exports = function pug2html() {
	return gulp.src('app/**/*.pug')
	.pipe(plumber())
	.pipe(pug({
		pretty: true
	}))
	.pipe(gulpHtmlBemValidator())
	.pipe(gulp.dest('./dist/'));
};
		
const styles = module.exports = function styles() {
	return gulp.src(['app/sass/**/*.sass', 'app/sass/**/*.scss'])
	.pipe(plumber())
	.pipe(sass().on('error', sass.logError))
	.pipe(rename({suffix: '.min', prefix: ''}))
	.pipe(autoprefixer({
		cascade: false
	}))
	.pipe(shorthand())
	.pipe(csso(''))
	.pipe(gulp.dest('dist/css'));
};

const scripts = module.exports = function scripts() {
	return gulp.src('app/js/*.js')
	.pipe(plumber())
	.pipe(babel({
		presets: ['@babel/env']
	}))
	.pipe(concat('common.min.js'))
	.pipe(uglify(''))
	.pipe(gulp.dest('dist/js'));
};

const scriptsConcat = module.exports = function scriptsConcat() {
	return gulp.src('app/libs/**/*.js')
	.pipe(babel({
		presets: ['@babel/env']
	}))
	.pipe(concat('plugin.min.js'))
	.pipe(uglify(''))
	.pipe(gulp.dest('dist/js'));
};

const compress = module.exports = function compress() {
	return gulp.src('app/img/*')
	.pipe(imagemin([
		imagemin.gifsicle({ interlaced: true }),
		imagemin.mozjpeg({
		  quality: 75,
		  progressive: true
		}),
		imagemin.optipng({ optimizationLevel: 5 }),
		imagemin.svgo({
		  plugins: [
			{ removeViewBox: true },
			{ cleanupIDs: false }
		  ]
		})
	  ]))
	.pipe(gulp.dest('dist/img/'))
};

const copyFonts = module.exports = async function copyFonts() {
	return gulp.src('app/fonts/*/**')   
	.pipe(gulp.dest('dist/fonts'));
};

const serverFunc = module.exports = function serverFunc() {
	server.init({
		server: "dist",
		notify: false,
		files: ['./dist/**/*.html','./dist/js/*.js','./dist/css/*.css']
	})
	
	gulp.watch('app/sass/*.sass', gulp.series(styles)).on('change', server.reload);
	gulp.watch('app/js/*.js', gulp.series(scripts)).on('change', server.reload);	
	gulp.watch('app/**/*.pug', gulp.series(pug2html)).on('change', server.reload);
	gulp.watch('build/*.html').on('change', server.reload);
};

const dev = gulp.parallel( pug2html, styles, scriptsConcat, scripts, compress, copyFonts)

const build = gulp.series(clean, dev)

module.exports.start = gulp.series(build, serverFunc)