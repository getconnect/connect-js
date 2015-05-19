import d3 = require('d3');

require('./core');
require('./viz');

declare var window: any;
declare var global: any;

if (typeof window !== 'undefined') {
    window.d3 = d3;
} else if (typeof global !== 'undefined') {
    global.d3 = d3;
}