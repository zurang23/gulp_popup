'use strict';

import pkg from './package.json';
import gulp from 'gulp';
import plugins from 'gulp-load-plugins';

const $ = plugins({
    pattern: ['*'],
    scope: ['devDependencies'],
});

console.log($);

const onError = (err) => console.log(err);

/**
 *  CHARACTER SET
 */
const encoding = 'UTF-8';

/**
 *  SET PATH
 */
const DIR = {
    SRC: 'src',
    BUILD: 'build',
    // DIST : 'dist'
};

const BASE = {
    SCRIPT: '/assets/js/',
    CSS: '/assets/css/',
    SCSS: '/assets/scss/',
    IMAGES: '/assets/images/',
    FONTS: '/assets/fonts/',
    FILES: '/assets/',
    HTML: '/html/'
};

const PATH = {
    SCRIPT: {
        SRC: DIR.SRC + BASE.SCRIPT,
        BUILD: DIR.BUILD + BASE.SCRIPT,
        // DIST : DIR.DIST + BASE.SCRIPT,
        TARGET: DIR.SRC + BASE.SCRIPT + '/**/*.js',
    },
    CSS: {
        SRC: DIR.SRC + BASE.CSS,
        BUILD: DIR.BUILD + BASE.CSS,
        // DIST : DIR.DIST + BASE.CSS ,
        TARGET: DIR.SRC + BASE.CSS + '/**/*.css'
    },
    SCSS: {
        SRC: DIR.SRC + BASE.SCSS,
        BUILD: DIR.BUILD + BASE.SCSS,
        // DIST : DIR.DIST + BASE.SCSS ,
        TARGET: DIR.SRC + BASE.SCSS + '/**/*.scss'
    },
    IMAGES: {
        SRC: DIR.SRC + BASE.IMAGES,
        BUILD: DIR.BUILD + BASE.IMAGES,
        // DIST : DIR.DIST + BASE.IMAGES,
        TARGET: DIR.SRC + BASE.IMAGES + '**/*.*',
    },
    FONTS: {
        SRC: DIR.SRC + BASE.FONTS,
        BUILD: DIR.BUILD + BASE.FONTS,
        // DIST : DIR.DIST + BASE.FONTS,
        TARGET: DIR.SRC + BASE.FONTS + '**/*.{eot, woff, woff2, ttf, svg, otf}',
    },
    FILES: {
        SRC: DIR.SRC + BASE.FILES,
        BUILD: DIR.BUILD + BASE.FILES,
        // DIST : DIR.DIST + BASE.FILES,
        TARGET: DIR.SRC + BASE.FILES + '**/*.*',
    },
    HTML: {
        SRC: DIR.SRC + BASE.HTML,
        BUILD: DIR.BUILD + BASE.HTML,
        // DIST : DIR.DIST + BASE.HTML,
        TARGET: DIR.SRC + BASE.HTML + '/**/*.{html, inc}'
    }
}

/**
 * TASK : HTML
 */
const htmlBeautifyOption = {
	indent_size: 4,
	indent_with_tabs: true,
	space_after_anon_function: false,
	keep_array_indentation: false,
	max_preserve_newlines: 1,
};
gulp.task('html', async () => {
    console.log('Task : html');
    return ( 
        gulp
        .src([PATH.HTML.SRC + '**/*.html', '!' + PATH.HTML.SRC + '/include/**/*.html'], {base: ''})
        .pipe($.plumber({errorHandler: onError}))
        // .pipe($.newer(PATH.HTML.BUILD))
        .pipe(
            $.fileInclude({
                prefix: '<!--',
                suffix: '-->',
                basepath: '@file',
            }),
        )
        .pipe($.htmlBeautify(htmlBeautifyOption))
        .pipe($.charset({to: encoding, quiet: false}))
        .pipe(gulp.dest(PATH.HTML.BUILD))
        .pipe($.connect.reload())
    );
});

/**
 * TASK : CSS (SCSS)
 */
gulp.task('css', async () => {
    console.log('Task : css');
    return $.mergeStream(
        gulp.src([PATH.SCSS.TARGET, '!/**/_*.scss'])
            .pipe($.plumber({errorHandler: onError}))
            .pipe($.newer(PATH.CSS.BUILD))
            .pipe($.sourcemaps.init())
            .pipe($.sass({outputStyle: 'compact', sourceMap: true}).on('error', $.sass.logError))
            .pipe($.autoprefixer({browsers: ['ie 10', 'last 2 versions'], cascade: false}))
            .pipe($.sourcemaps.write()),

        gulp.src(PATH.CSS.TARGET)
            .pipe($.newer(PATH.CSS.BUILD))
            .pipe($.cleanCss({compatibility: 'ie8'}))
    )
        .pipe($.charset({to: encoding}))
        .pipe(gulp.dest(PATH.CSS.BUILD))
        .pipe($.connect.reload());
});

/**
 * SASS
 */
// gulp.task('sass', () => {
//     return gulp.src([PATH.SCSS.TARGET, '!!/**/_*.scss'])
//                 .pipe($.plumber({errorHandler: onError}))
//                 .pipe($.newer(PATH.CSS.BUILD))
//                 .pipe($.sourcemaps.init())
//                 .pipe($.sass({outputStyle : 'compact', sourceMap : true}).on('error', $.sass.logError))
//                 .pipe($.autoprefixer({browsers : ['ie 10', 'last 2 versions'], cascade : false}))
//                 .pipe($.sourcemaps.write())
//                 .pipe(gulp.dist(PATH.CSS.BUILD))
//                 .pipe($.connect.reload());
// });

/**
 * TASK : JS
 */
gulp.task('script', async () => {
    console.log('Task : script');
    return $.mergeStream(
        gulp.src([PATH.SCRIPT.TARGET, '!' + PATH.SCRIPT.SRC + '/**/libs/*.js', '!' + PATH.SCRIPT.SRC + '/**/*.min.js'], {sourcemaps: true})
            .pipe($.plumber({errorHandler: onError}))
            .pipe($.newer(PATH.SCRIPT.BUILD))
            // .pipe(uglify())
            .pipe($.jsbeautifier()),

        gulp.src([PATH.SCRIPT.SRC + '/**/libs/*.js', PATH.SCRIPT.SRC + '/**/*.min.js'])
            .pipe($.plumber({errorHandler: onError}))
            .pipe($.newer(PATH.SCRIPT.BUILD))
    )
        .pipe($.charset({to: encoding}))
        .pipe(gulp.dest(PATH.SCRIPT.BUILD))
        .pipe($.connect.reload());
})

/**
 * TASK : IMAGE
 */
gulp.task('images', async () => {
    console.log('Task : images');
    return gulp
        .src([PATH.IMAGES.TARGET])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.newer(PATH.IMAGES.BUILD))
        .pipe($.imagemin())
        .pipe(gulp.dest(PATH.IMAGES.BUILD))
        .pipe($.connect.reload());
});

/**
 * TASK : Fonts
 */
gulp.task('fonts', async () => {
    console.log('Task : fonts');
    return gulp
        .src([PATH.FONTS.TARGET])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.newer(PATH.FONTS.BUILD))
        .pipe(gulp.dest(PATH.FONTS.BUILD))
        .pipe($.connect.reload());
});

/**
 * ETC - Files
 */
gulp.task('files', () => {
    console.log('Task : files');
    return gulp.src([PATH.FILES.TARGET])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.newer(PATH.FILES.BUILD))
        .pipe(gulp.dest(PATH.FILES.BUILD))
        .pipe($.connect.reload());
});

/**
 * Clean
 */
gulp.task('clean', async () => {
    console.log('Task : clean');
    return $.del.sync([DIR.BUILD]);
});

/**
 * Run Server
 * LiveReload
 */
gulp.task('connect', async () => {
    console.log('Task : connect');
    $.connect.server({
        root: DIR.BUILD,
        livereload: true,
        port: 9999
    });
});

/**
 * Watch
 */
gulp.task('watch', async () => {
    console.log('Task : watch');
    gulp.watch([PATH.HTML.TARGET], {cwd: './', events: 'all'}, gulp.series('html'));
    gulp.watch([PATH.CSS.TARGET, PATH.SCSS.TARGET], {cwd: './', events: 'all'}, gulp.series('css'));
    gulp.watch([PATH.SCRIPT.TARGET], {cwd: './', events: 'all'}, gulp.series('script'));

    gulp.watch([PATH.IMAGES.TARGET], {cwd: './', events: 'all'}, gulp.series('images'));
    gulp.watch([PATH.FONTS.TARGET], {cwd: './', events: 'all'}, gulp.series('fonts'));
    gulp.watch([PATH.FILES.TARGET], {cwd: './', events: 'all'}, gulp.series('files'));
});

/**
 * Default Local Build
 */

gulp.task('default', gulp.series('clean', gulp.parallel('connect', 'html', 'css', 'script', 'images', 'fonts', 'files', 'watch')), () => {
    console.log('Gulp is running');
});

/**
 * Jenkins Build
 */

gulp.task('build', gulp.series('clean', gulp.parallel('html', 'css', 'script', 'images', 'fonts', 'files')), () => {
    console.log('Gulp is Build Complete');
});
