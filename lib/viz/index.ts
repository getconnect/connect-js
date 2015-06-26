import Formatters = require('./formatters');
import Config = require('./config');
import VizShell = require('./viz-shell');
import Chart = require('./chart/chart');
import Gauge = require('./chart/gauge');
import Text = require('./text/text');
import Table = require('./table/table');
import Visualization = require('./table/table');
import Queries = require('../core/queries/queries');
import Api = require('../core/api');

type VizFactory = (options: Config.VisualizationOptions) => Visualization;

function extendConnect(existingConnect: any){
    existingConnect['Viz'] = {
        format: Formatters.format
    };

    existingConnect.registerViz = function(name: string, vizFactory: VizFactory): void{
        var buildVizShell = (data: Queries.ConnectQuery|Api.QueryResultsFactory, targetElement: string|HTMLElement, options: Config.VisualizationOptions) => {
            return new VizShell(targetElement, data, options, vizFactory(options));
        }

        existingConnect[name] = existingConnect.prototype[name] = buildVizShell;
    };

    existingConnect.registerViz('chart', (options: Config.VisualizationOptions) => new Chart(options));
    existingConnect.registerViz('gauge', (options: Config.VisualizationOptions) => new Gauge(options));
    existingConnect.registerViz('text', (options: Config.VisualizationOptions) => new Text(options));
    existingConnect.registerViz('table', (options: Config.VisualizationOptions) => new Table(options));

    return existingConnect;
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