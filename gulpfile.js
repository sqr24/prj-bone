var gulp 		= require('gulp'),
	sass 		= require('gulp-sass'),
	browserSync = require('browser-sync'),
	concat 		= require('gulp-concat'),
	uglify 		= require('gulp-uglifyjs'),
	cssnano		= require('gulp-cssnano'),
	rename		= require('gulp-rename'),
	del 		= require('del'),
	imagemin	= require('gulp-imagemin'),
	pngquant	= require('imagemin-pngquant'),
	cache 		= require('gulp-cache'),
	autoprefix	= require('gulp-autoprefixer');

// Сборка css из sass. Подключение автопрефиксера
gulp.task('sass', function(){ 
	return gulp.src('app/sass/**/*.sass') 
		.pipe(sass())
		.pipe(autoprefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true})) 
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true}));
});

// Минификация либ, описанных в sass/libs.sass, и сборка всех css из sass
gulp.task('css-libs', ['sass'], function() {
	return gulp.src('app/css/libs.css')
	.pipe(cssnano())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('app/css/'));
});

// минификация отдельных js либ
gulp.task('scripts', function(){
	return gulp.src(['app/libs/jquery/dist/jquery.min.js',
					 'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js'])
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

// Запуск Browser sync
gulp.task('browser-sync', function(){
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
});

// Отслеживание изменений
gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

// ---- Деплой ----

// Отчистка папки dest
gulp.task('clean', function(){
	return del.sync('dist');
});

// Сжатие картинок
gulp.task('img', function(){
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img'));
});


// Сборка продакшена
gulp.task('build', ['clean', 'img', 'css-libs', 'scripts'], function() {
	
	// Перенос css
	var buildCss = gulp.src('app/css/*.css')
	.pipe(gulp.dest('dist/css'));

	// Шрифтов
	var buildFonts = gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'));

	// Скриптов
	var buldJs = gulp.src('app/js/**/*')
	.pipe(gulp.dest('dist/js'));

	// html
	var buldHtml = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));

});


// очистка кэша
gulp.task('clearcache', function(){
	return cache.clearAll();
});

// дефолт-таск при запуске галп без параметров
gulp.task('default', ['watch']);