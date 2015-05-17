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
    dist: './dist',
    distCore: './dist/core',
    distViz: './dist/viz',
    distNpm: './dist-modules',
    distNpmCore: './dist-modules/connect-js',
    distNpmViz: './dist-modules/connect-js-viz',
};

var exampleDest = {
    lib: './examples/build/lib',
    style: './examples/build/css',
    dist: './examples/dist'
};

var sources = {
    readme: './README.md',
    npmConfig: './package.json',
    lib: './lib/**/*.ts',
    compiledLibCore: dest.lib + '/core/**/*.js',
    compiledLibViz: dest.lib + '/viz/**/*.js',
    compiledTdCore: dest.lib + '/core/**/*.d.ts',
    compiledTdViz: dest.lib + '/viz/**/*.d.ts',
    compiledStyle: dest.style + '/connect-viz.css',
    style: './style/**/connect-viz.less',
    less: './style/**/*.less',
    test: './test/**/*.ts',
    compiledTest: dest.test + '/**/*.ts'
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

gulp.task('compile:style',  function() {
    return gulp.src(sources.style)
       .pipe(less())
       .pipe(autoprefixer())
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
    return gulp.src(sources.compiledTest)
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

    return gulp.src(sources.compiledTest)
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
        .ignore('tipi-connect')
        .external('d3')
        .external('c3');
        
        return b.bundle();
    });

    var core = gulp.src(dest.lib + '/core/index.js')
        .pipe(browserifiedCore)
        .pipe(rename('connect.js'))
        .pipe(gulp.dest(dest.distCore))
        .on('error', handleError);

    var viz = gulp.src(dest.lib + '/viz/index.js')
        .pipe(browserifiedViz)
        .pipe(rename('connect-viz.js'))
        .pipe(gulp.dest(dest.distViz))
        .on('error', handleError);

    return es.merge(core, viz);
});

gulp.task('minifyCss', ['build'], function() {
    return gulp.src(sources.compiledStyle)
        .pipe(autoprefixer())
        .pipe(gulp.dest(dest.distViz))
        .pipe(cssmin())
        .pipe(rename('connect-viz.min.css'))
        .pipe(gulp.dest(dest.distViz))
        .on('error', handleError);
});

gulp.task('uglify', ['browserify'], function() {
     var core = gulp.src(dest.distCore + '/connect.js')
        .pipe(uglify())
        .pipe(rename('connect.min.js'))
        .pipe(gulp.dest(dest.distCore))
        .on('error', handleError);

    var viz = gulp.src(dest.distViz + '/connect-viz.js')
        .pipe(uglify())
        .pipe(rename('connect-viz.min.js'))
        .pipe(gulp.dest(dest.distViz))
        .on('error', handleError);

    return es.merge(core, viz);
});

gulp.task('copy-less', function() {
    return gulp.src(sources.less)
        .pipe(gulp.dest(dest.distViz + '/less'))
        .on('error', handleError);
});

gulp.task('npm:readme',  function() {
    var readmeSrc = gulp.src(sources.readme)
        .on('error', handleError);

    var core = readmeSrc
        .pipe(gulp.dest(dest.distNpmCore));

    var viz = readmeSrc
        .pipe(gulp.dest(dest.distNpmViz));

    return es.merge(core, viz);
});

gulp.task('npm:src',  ['compile:lib'], function() {
    var coreJs = gulp.src(sources.compiledLibCore)
        .pipe(gulp.dest(dest.distNpmCore + '/js'))
        .on('error', handleError);

    var vizJs = gulp.src(sources.compiledLibViz)
        .pipe(gulp.dest(dest.distNpmViz + '/js'))
        .on('error', handleError);

    var coreTd = gulp.src(sources.compiledTdCore)
        .pipe(gulp.dest(dest.distNpmCore + '/ts'))
        .on('error', handleError);

    var vizTd = gulp.src(sources.compiledTdViz)
        .pipe(gulp.dest(dest.distNpmViz + '/ts'))
        .on('error', handleError);

    return es.merge(coreJs, vizJs, coreTd, vizTd);
});

gulp.task('npm:style', ['compile:style'],  function() {
    var less = gulp.src(sources.less)
        .pipe(gulp.dest(dest.distNpmViz + '/less'))
        .on('error', handleError);

    var combinedCss = gulp.src(sources.compiledStyle)
        .pipe(gulp.dest(dest.distNpmViz + '/css'))
        .on('error', handleError);

    return es.merge(less, combinedCss);
});

gulp.task('npm:config',  function() {
    var corePackage = gulp.src(sources.npmConfig)
        .pipe(gulp.dest(dest.distNpmCore))
        .on('error', handleError);

    var vizPackage = gulp.src(sources.npmConfig)
        .pipe(jeditor({
            'name': 'connect-js-viz'
        }))
        .pipe(jeditor(function (packageJson){
            packageJson.peerDependencies = {};
            packageJson.peerDependencies['connect-js'] = packageJson.version;
            return packageJson;
        }))
        .pipe(gulp.dest(dest.distNpmViz))
        .on('error', handleError);

    return es.merge(corePackage, vizPackage);
});

gulp.task('clean:lib', function() {
    return del(dest.lib);
});

gulp.task('clean:style', function() {
    return del(dest.style);
});

gulp.task('clean:test', function() {
    return del(dest.test);
});

gulp.task('clean:dist', function() {
    return es.merge(del(dest.dist), del(dest.npm));
});

gulp.task('serve', function() {
    browserSync({
        server: {
            baseDir: dest.dist,
            https: true
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

gulp.task('examples:clean:style', function() {
    return del(exampleDest.style);
});

gulp.task('examples:serve', ['examples'], function() {
    browserSync({
        server: {
            baseDir: exampleDest.dist,
            https: true
        }
    });
});


gulp.task('watch', ['dist'], function() {
    errorsFatal = false;

    gulp.watch([sources.lib, sources.style], ['dist']);
});

gulp.task('build', ['compile:lib', 'compile:style']);
gulp.task('examples:build', ['examples:compile:lib', 'examples:compile:style']);
gulp.task('test', ['compile:tests', 'test:karma', 'test:mocha']);
gulp.task('dist:bower', ['build', 'minifyCss', 'browserify', 'uglify', 'copy-less']);
gulp.task('dist:npm', ['npm:src', 'npm:config', 'npm:style', 'npm:readme']);
gulp.task('dist', ['dist:bower', 'dist:npm']);
gulp.task('examples', ['examples:combineCss', 'examples:browserify', 'examples:copyHtml']);
gulp.task('default', ['build']);