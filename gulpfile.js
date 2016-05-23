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
    karma = require('karma'),
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
    distStandalone: './dist/standalone',
    distNpm: './dist-modules',
    distNpmCore: './dist-modules/connect-js',
    distNpmViz: './dist-modules/connect-js-viz',
};

var sources = {
    readme: './README.md',
    npmConfig: './package.json',
    lib: './lib/**/*.ts',
    compiledLibCore: dest.lib + '/core/**/*.js',
    compiledLibViz: dest.lib + '/viz/**/*.js',
    compiledLibStandalone: dest.lib + '/standalone.js',
    compiledTdCore: dest.lib + '/core/**/*.d.ts',
    compiledTdViz: dest.lib + '/viz/**/*.d.ts',
    compiledStyle: dest.style + '/connect-viz.css',
    style: './style/**/connect-viz.less',
    less: './style/**/*.less',
    test: './test/**/*.ts',
    compiledCoreTest: dest.test + '/**/*-spec.js',
    compiledUITest: dest.test + '/**/*-spec-ui.js',
    ionIconsCss: './bower_components/ionicons/css/ionicons.css',
    ionIconsFonts: './bower_components/ionicons/fonts/*',
    c3Css: './node_modules/connect-js-c3/c3.css'
};

var typings = {
    library: './typings/**/*.d.ts',
    lib: './build/lib/**/*.d.ts'
};

var tsProject = ts.createProject({
    typescript: require('typescript'),
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

gulp.task('test:karma', ['compile:tests'], function (done) {
    new karma.Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('test:mocha', ['compile:tests'], function () {
    var reporter = process.env.TEAMCITY_VERSION 
        ? 'mocha-teamcity-reporter' 
        : 'list';

    return gulp.src(sources.compiledCoreTest)
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
        .ignore('connect-js')
        .external('d3')
        .external('connect-js-c3');        

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

gulp.task('fonts', function() {
    return gulp.src(sources.ionIconsFonts)
        .pipe(gulp.dest(dest.dist + '/fonts'));
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
        .pipe(jeditor(function (packageJson){
            delete packageJson.dependencies['connect-js-c3'];
            delete packageJson.dependencies['d3'];
            return packageJson;
        }))
        .pipe(gulp.dest(dest.distNpmCore))
        .on('error', handleError);

    var vizPackage = gulp.src(sources.npmConfig)
        .pipe(jeditor({
            'name': 'connect-js-viz'
        }))
        .pipe(jeditor(function (packageJson){
            packageJson.dependencies['connect-js'] = packageJson.version;
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

gulp.task('reload-dist', ['dist'], browserSync.reload);

gulp.task('watch', ['dist'], function() {
    errorsFatal = false;

    gulp.watch([sources.lib, sources.style], ['dist']);
});

gulp.task('serve', ['dist'], function() {
    browserSync({
        server: {
            baseDir: dest.dist,
            https: false
        }
    });

    gulp.watch([sources.lib, sources.style], ['reload-dist']);
});

gulp.task('standalone:js', ['build'], function() {
    var browserifiedStandalone = transform(function(filename) {
        var b = browserify(filename, {
            basedir: dest.lib
        })
        .ignore('connect-js');
        
        return b.bundle();
    });

    return gulp.src(sources.compiledLibStandalone)
        .pipe(browserifiedStandalone)
        .pipe(rename('connect-all.js'))
        .pipe(gulp.dest(dest.distStandalone))
        .pipe(uglify())
        .pipe(rename('connect-all.min.js'))
        .pipe(gulp.dest(dest.distStandalone))
        .on('error', handleError);
});

gulp.task('standalone:css', ['minifyCss'], function() {
    var styles = [
        sources.ionIconsCss,
        sources.c3Css,
        dest.distViz + '/connect-viz.css'
    ];

    return gulp.src(styles)
        .pipe(concat('connect-all.css'))
        .pipe(gulp.dest(dest.distStandalone))
        .pipe(cssmin())
        .pipe(rename('connect-all.min.css'))
        .pipe(gulp.dest(dest.distStandalone))
});

gulp.task('build', ['compile:lib', 'compile:style']);
gulp.task('test', ['compile:tests', 'test:karma', 'test:mocha']);
gulp.task('dist:bower', ['build', 'fonts', 'minifyCss', 'browserify', 'uglify', 'copy-less']);
gulp.task('dist:npm', ['npm:src', 'npm:config', 'npm:style', 'npm:readme']);
gulp.task('dist:standalone', ['standalone:js', 'standalone:css']);
gulp.task('dist', ['dist:bower', 'dist:npm', 'dist:standalone']);
gulp.task('default', ['build']);