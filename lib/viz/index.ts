import Formatters = require('./formatters');
import Registrar = require('./registrar');

function extendConnect(Connect: any){
    Connect['Viz'] = {
        format: Formatters.format
    };

    Registrar.extendConnectWithVizualizations(Connect);

    return Connect;
}

declare var define: any;
declare var module: any;
declare var window: any;
declare var global: any;
declare var self: any;

// RequireJS
if(typeof define === "function" && define.amd) {
	define(["connect"], function (Connect) { 
        return extendConnect(Connect); 
    });
}

// CommonJS
if (typeof module !== "undefined" && module.exports) {
    var Connect = require('connect-js');
    if (Connect.prototype)
	   extendConnect(Connect);
    
    module.exports = Connect;
} 

// Global
if (typeof self !== 'undefined') {
    extendConnect(self.Connect);
} else if (typeof window !== 'undefined') {
    extendConnect(window.Connect);
} else if (typeof global !== 'undefined') {
    extendConnect(global.Connect);
}