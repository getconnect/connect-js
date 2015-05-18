declare var window: any;
declare var global: any;

var c3;

try {
    c3 = require('connect-js-c3');
} catch(err) {
    c3 = typeof window !== 'undefined' ? window.c3 : typeof global !== 'undefined' ? global.c3 : null;
}

if(typeof c3 === 'undefined') {
    throw 'c3 has not been loaded.';
}

export = c3;