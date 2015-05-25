declare var window: any;
declare var global: any;

var d3;

try {
    d3 = require('d3');
} catch(err) {
    d3 = typeof window !== 'undefined' ? window.d3 : typeof global !== 'undefined' ? global.d3 : null;
}

if (typeof d3 === 'undefined') {
    throw 'd3 has not been loaded.';
}

export = d3;