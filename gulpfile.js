var gulp = require('gulp'),
    del = require('del'),
    browserify = require('browserify'),
    transform = require('vinyl-transform'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    ts = require('gulp-typescript'),
    less = require('gulp-less'),
    cssmin = require("gulp-minify-css"),
    es = require('event-stream'),
    concat = require('gulp-concat'),
    mocha = require('gulp-mocha'),
    karma = require('gulp-karma'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    jeditor = require('gulp-json-editor');
    git = require('gulp-git');

var errorsFatal = true;

var dest = {
    lib: './build/lib',
    style: './build/css',
    test: './build/test',
    dist: './dist'
};

var exampleDest = {
    lib: './examples/build/lib',
    style: './examples/build/css',
    dist: './examples/dist'
};

var sources = {
    lib: './lib/**/*.ts',
    style: './style/**/*.less',
    test: './test/**/*.ts'
};

var exampleSources = {
    connectJs: dest.dist + '/**/*.js',
    connectCss: dest.dist + '/**/*.css',
    lib: './examples/script/*.js',
    html: './examples/*.html',
    style: './examples/style/**/*.less'
};

var typings = {
    library: './typings/**/*.d.ts',
    lib: './build/lib/**/*.d.ts'
};

var tsProject = ts.createProject({
    noExternalResolve: false,
    sortOutput: true,
    declarationFiles: true,
    noEmitOnError: true,
    module: 'commonjs',
    target: 'ES5'
});

function handleError(error) {

    console.log(error.stack);

    if(errorsFatal)
        throw error;
}

gulp.task('compile:lib',  function() {
    var tsResult = gulp.src([sources.lib, typings.library])
       .pipe(ts(tsProject))
       .on('error', handleError);

    var js = tsResult.js
        .pipe(gulp.dest(dest.lib));

    var dts = tsResult.dts
        .pipe(gulp.dest(dest.lib));

    return es.merge(js, dts);
});

gulp.task('readme',  function() {
    var readmeSrc = gulp.src('./README.md')
        .on('error', handleError);

    var core = readmeSrc
        .pipe(gulp.dest(dest.lib + '/core'));

    var viz = readmeSrc
        .pipe(gulp.dest(dest.lib + '/viz'));

    return es.merge(core, viz);
});

gulp.task('compile:config',  function() {
    var corePackage = gulp.src('./package.json')
        .pipe(gulp.dest(dest.lib + '/core'))
        .on('error', handleError);

    var vizPackage = gulp.src('./package.json')
        .pipe(jeditor({
            'name': 'connect-js-viz',
            "main": "build/viz/index.js",
            "browser": "dist/viz/connect-viz.js"
        }))
        .pipe(jeditor(function (packageJson){
            packageJson.peerDependencies = {};
            packageJson.peerDependencies['connect-js'] = packageJson.version;
            return packageJson;
        }))
        .pipe(gulp.dest(dest.lib + '/viz'))
        .on('error', handleError);

    return es.merge(corePackage, vizPackage);
});

gulp.task('compile:style',  function() {
    return gulp.src(sources.style)
       .pipe(less())
       .pipe(gulp.dest(dest.style))
       .on('error', handleError);
});

gulp.task('compile:tests', ['clean:test', 'build'], function() {
    var tsResult = gulp.src([sources.test, typings.lib, typings.library])
       .pipe(ts(tsProject))
       .on('error', handleError);

    return tsResult.js
        .pipe(gulp.dest(dest.test));
});

gulp.task('test:karma', ['compile:tests'], function () {
    return gulp.src(dest.test + '/**/*.js')
        .pipe(karma({
            action: 'run',
            configFile: 'karma.conf.js'
        }))
        .on('error', handleError);
});

gulp.task('test:mocha', ['compile:tests'], function () {
    var reporter = process.env.TEAMCITY_VERSION 
        ? 'mocha-teamcity-reporter' 
        : 'list';

    return gulp.src(dest.test + '/**/*.js')
        .pipe(mocha({ 
            reporter: reporter
        }))
        .on('error', handleError);
});

gulp.task('browserify', ['build'], function() {
    var browserifiedCore = transform(function(filename) {
        var b = browserify(filename, {
            basedir: dest.lib
        });
        
        return b.bundle();
    });
    var browserifiedViz = transform(function(filename) {
        var b = browserify(filename, {
            basedir: dest.lib
        })
        .ignore('tipi-connect');
        
        return b.bundle();
    });

    var core = gulp.src(dest.lib + '/core/index.js')
        .pipe(browserifiedCore)
        .pipe(rename('connect.js'))
        .pipe(gulp.dest(dest.dist + '/core'))
        .on('error', handleError);

    var viz = gulp.src(dest.lib + '/viz/index.js')
        .pipe(browserifiedViz)
        .pipe(rename('connect-viz.js'))
        .pipe(gulp.dest(dest.dist + '/viz'))
        .on('error', handleError);

    return es.merge(core, viz);
});

gulp.task('combineCss', ['build'], function() {
    return gulp.src(dest.style + '/*.css')
        .pipe(autoprefixer())
        .pipe(concat('connect-viz.css'))
        .pipe(gulp.dest(dest.dist + '/viz'))
        .pipe(cssmin())
        .pipe(rename('connect-viz.min.css'))
        .pipe(gulp.dest(dest.dist + '/viz'))
        .on('error', handleError);
});

gulp.task('uglify', ['browserify'], function() {
    var core = gulp.src(dest.dist + 'core/connect.js')
        .pipe(uglify())
        .pipe(rename('connect.min.js'))
        .pipe(gulp.dest(dest.dist + '/core'))
        .on('error', handleError);

    var viz = gulp.src(dest.dist + 'viz/connect-viz.js')
        .pipe(uglify())
        .pipe(rename('connect-viz.min.js'))
        .pipe(gulp.dest(dest.dist + '/viz'))
        .on('error', handleError);

    return es.merge(core, viz);
});

gulp.task('clean:lib', function() {
    return del(dest.lib);
});

gulp.task('clean:style', function() {
    return del(dest.style);
});

gulp.task('examples:clean:style', function() {
    return del(exampleDest.style);
});

gulp.task('clean:test', function() {
    return del(dest.test);
});

gulp.task('clean:dist', function() {
    return del(dest.dist);
});

gulp.task('serve', function() {
    browserSync({
        server: {
            baseDir: dest.dist
        }
    });
});

gulp.task('examples:compile:lib',  function() {
    return gulp.src([exampleSources.lib])
       .pipe(gulp.dest(exampleDest.lib))
       .on('error', handleError);
});

gulp.task('examples:compile:style',  function() {
    var css = gulp.src(exampleSources.style)
       .pipe(less())
       .pipe(gulp.dest(exampleDest.style))
       .on('error', handleError);

    var copyConnect = gulp.src([exampleSources.connectCss])
       .pipe(gulp.dest(exampleDest.dist))
       .on('error', handleError);

   return es.merge(css, copyConnect);
});

gulp.task('examples:browserify', ['examples:build'], function() {
    var browserified = transform(function(filename) {
        var b = browserify(filename, {
            basedir: exampleDest.lib
        });
        
        return b.bundle();
    });

    var browserfy = gulp.src(exampleDest.lib + '/visualizations.js')
        .pipe(browserified)
        .pipe(rename('examples.js'))
        .pipe(gulp.dest(exampleDest.dist))
        .on('error', handleError);

    var copyConnect = gulp.src([exampleSources.connectJs])
       .pipe(gulp.dest(exampleDest.dist))
       .on('error', handleError);

    return es.merge(browserfy, copyConnect);
});

gulp.task('examples:combineCss', ['examples:build'], function() {
    return gulp.src(exampleDest.style + '/*.css')
        .pipe(autoprefixer())
        .pipe(concat('examples.css'))
        .pipe(gulp.dest(exampleDest.dist))
        .on('error', handleError);
});

gulp.task('examples:copyHtml', ['examples:build'], function() {
    return gulp.src(exampleSources.html)
        .pipe(gulp.dest(exampleDest.dist))
        .on('error', handleError);
});

gulp.task('examples:clean:dist', function() {
    return del(exampleDest.dist);
});

gulp.task('examples:clean:lib', function() {
    return del(exampleDest.lib);
});

gulp.task('examples:serve', ['examples'], function() {
    browserSync({
        server: {
            baseDir: exampleDest.dist
        }
    });
});


gulp.task('watch', ['dist'], function() {
    errorsFatal = false;

    gulp.watch([sources.lib, sources.style], ['dist']);
});

gulp.task('build', ['compile:lib', 'compile:style', 'compile:config', 'readme']);
gulp.task('examples:build', ['examples:compile:lib', 'examples:compile:style']);
gulp.task('test', ['compile:tests', 'test:karma', 'test:mocha']);
gulp.task('dist', ['build', 'combineCss', 'browserify', 'uglify']);
gulp.task('examples', ['examples:combineCss', 'examples:browserify', 'examples:copyHtml']);
gulp.task('default', ['build']);