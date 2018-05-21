// Get modules
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var es = require('event-stream');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var psi = require('psi');
var minifyHTML = require('gulp-minify-html');
//var critical = require('critical').stream;

var base_path = 'assets/';
var build_path = 'public/';

// configure for PageSpeed Insights
//var site = 'http://meteor.dev:8000/utwo/utwo%20v2/public/';

// Configure the proxy server for livereload
var proxyServer = "http://meteor.dev:8000/utwo/utwo%20v2/public/",
    port = 3000;

//error log function:
function errorLog(error) {
    console.error(error.message);
}

// browser-sync task for starting the server.
gulp.task('browser-sync', function () {
    browserSync({
        proxy: proxyServer,
        port: port,
        files: "public/",
        ghostMode: {
            clicks: true,
            location: true,
            forms: true,
            scroll: true
        },
        notify: true,
        logFileChanges: false,
        open: false
    });
});

//Task html
gulp.task('html', function() {
    return gulp.src('*.html')
        .pipe(minifyHTML({ empty: true }))
        .pipe(gulp.dest(build_path));
});

// Task css
gulp.task('css', function () {
    var mainCss = gulp.src(base_path + 'css/style.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .on('error', errorLog)
        .pipe(concat('base.min.css'))
        .pipe(autoprefixer('last 3 version'))
        .pipe(minifycss())
        .pipe(gulp.dest(build_path + 'css/'))
});

// Task js app
gulp.task('js', function () {
    return gulp.src([base_path + '/js/plugins/*.js', base_path + '/js/*.js'])
        .pipe(concat('main.min.js'))
        .on('error', errorLog)
        .pipe(uglify())
        .pipe(gulp.dest(build_path + 'js/'))
});

//Task images
gulp.task('images', function () {
    return gulp.src(base_path + 'img/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(build_path + 'img/'))
});

// Task fonts
gulp.task('fonts', function () {
    return gulp.src(base_path + 'font/*')
        .pipe(gulp.dest(build_path + 'font/'));
});

// Generate & Inline Critical-path CSS
gulp.task('critical', function () {
    return gulp.src('dist/*.php')
        .pipe(critical({base: 'dist/', inline: true, minify: true, extract: true, ignore: ['font-face'], css: 'css/base.min.css'}))
        .pipe(gulp.dest(build_path + 'css/'));
});

gulp.task('mobile', function () {
    return psi(site, {
        // key: key
        nokey: 'true',
        strategy: 'mobile',
    }).then(function (data) {
        console.log('Speed score: ' + data.ruleGroups.SPEED.score);
        console.log('Usability score: ' + data.ruleGroups.USABILITY.score);
    });
});

gulp.task('desktop', function () {
    return psi(site, {
        nokey: 'true',
        // key: key,
        strategy: 'desktop',
    }).then(function (data) {
        console.log('Speed score: ' + data.ruleGroups.SPEED.score);
    });
});

gulp.task('watch', function () {
    gulp.watch(base_path + 'css/**', ['css']);
    gulp.watch(base_path + 'js/**', ['js']);
    gulp.watch(base_path + 'img/**', ['images']);
    gulp.watch(base_path + 'font/**', ['fonts']);
    gulp.watch('*.html', ['html']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['browser-sync', 'css', 'js', 'fonts', 'html', 'watch']);

// Task when ready for production
gulp.task('production', ['css', 'js', 'fonts', 'html', 'images']);