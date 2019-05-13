var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var minify = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svg = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var uglify = require('gulp-uglify');
var server = require('browser-sync').create();
var run = require('run-sequence');
var del = require('del');

gulp.task('style', function(){
	gulp.src('source/sass/style.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(postcss([
			autoprefixer()
		]))
		.pipe(gulp.dest('build/css'))
		.pipe(minify())
		.pipe(rename('style.min.css'))
		.pipe(gulp.dest('build/css'))
		.pipe(server.stream());
});

gulp.task('js', function(){
	gulp.src('source/js/**/*.js')		
		.pipe(gulp.dest('build/js'))
		.pipe(server.stream());
});

gulp.task('images', function(){
	return gulp.src('source/img/**/*.{png, jpg, svg}')
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.jpegtran({progressive: true}),
			imagemin.svgo()
			]))
		.pipe(gulp.dest('source/img'));
});

gulp.task('webp', function(){
	return gulp.src('source/img/**/*.{png, jpg}')
		.pipe(webp({quality: 90}))
		.pipe(gulp.dest('source/img'));
});

gulp.task('sprite', function(){
	return gulp.src('source/img/icon-*.svg')
		.pipe(svg({
			inlineSvg: true
		}))
		.pipe(rename('sprite.svg'))
		.pipe(gulp.dest('build/img'));
});

gulp.task('html', function(){
	return gulp.src('source/*.html')
		.pipe(posthtml([
			include()
			]))
		.pipe(gulp.dest('build'));
});

gulp.task('serve', function(){
	server.init({
		server: 'build/'
	});

	gulp.watch('source/sass/**/*.{scss, sass}', ['style']);
	gulp.watch('source/js/**/*.js', ['js']);
	gulp.watch('source/*.html', ['html'])
		.on('change', server.reload);
});

gulp.task('build', function(done){
	run('clean', 'copy', 'style', 'sprite', 'html', done);
});

gulp.task('copy', function(){
	return gulp.src([
			'source/fonts/**',
			'source/img/**',
			'source/js/**', 
			'source/css/normalize.css'
		], {
			base: 'source'
		})
		.pipe(gulp.dest('build'));
});

gulp.task('clean', function(){
	return del('build');
});