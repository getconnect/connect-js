module.exports = function(config) {
    var reporters;
    
    if(process.env.TEAMCITY_VERSION) {
        reporters = ['junit'];
    } else {
        reporters = ['progress'];
    }

    config.set({
        basePath: './build',
        frameworks: ['browserify', 'mocha'],
        files: [
            './test/**/*.js'
        ],
        browsers: ['Chrome', 'Firefox', 'IE'],
        reporters: reporters,
        browserify: {
            debug: true
        },
        preprocessors: {
            './test/**/*.js': ['browserify']
        },
        browserify: {
            plugin: ['proxyquire-universal']
        },
        junitReporter: {
            outputFile: './test/test-results-karma.xml',
            suite: ''
        },
    });
};