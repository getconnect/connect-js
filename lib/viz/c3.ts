var c3 = require('connect-js-c3');

declare var window: any;
declare var global: any;

if(typeof c3 === 'undefined') {
    c3 = typeof window !== 'undefined' ? window.c3 : typeof global !== 'undefined' ? global.c3 : null;
}

export = c3;