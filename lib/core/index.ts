import Connect = require('./connect');

interface IHaveGlobalConnect {
	Connect: typeof Connect;
}

declare var define: any;
declare var module: any;
declare var window: IHaveGlobalConnect;
declare var global: IHaveGlobalConnect;
declare var self: IHaveGlobalConnect;

// RequireJS
if(typeof define === "function" && define.amd) {		
	define("connect", [], function () { return Connect; });
}

// CommonJS
if (typeof module !== "undefined" && module.exports) {
	module.exports = Connect;
} 

// Global
if (typeof self !== 'undefined') {
    self.Connect = Connect;
} else if (typeof window !== 'undefined') {
    window.Connect = Connect;
} else if (typeof global !== 'undefined') {
    global.Connect = Connect;
}