import _ = require('underscore');
import Chart = require('./chart/chart');
import Gauge = require('./gauge/gauge');
import Text = require('./text/text');
import Table = require('./table/table');
import VizRenderer = require('./viz-renderer');
import Viz  = require('./visualization');
import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Config = require('./config');

export type VizFactory = () => Viz.Visualization;

interface BuildVizRenderer {
    (data: Queries.ConnectQuery|Api.QueryResultsFactory, 
        targetElement: string|HTMLElement, 
        options: Config.VisualizationOptions): VizRenderer
}

function findFirstMissingMethod(vizualization: Viz.Visualization|VizFactory): string {
    var viz = _.isFunction(vizualization) ? (<VizFactory>vizualization)() : <Viz.Visualization>vizualization;
    var requiredMethodNames = ['render'];
    return _(requiredMethodNames).find((methodName) => !viz[methodName]);
}

export function registerViz(name: string, vizualization: Viz.Visualization|VizFactory) {
    
    if (this[name]){
        console.warn(`Warning. There is already a visualization registered under ${name}, this registration will be ignored`);
        return;
    }
    
    var missingMethod = findFirstMissingMethod(vizualization);
    if (missingMethod) {
        console.warn(`Warning. The implentation provided for ${name} does not contain the required ${missingMethod} method, this registration will be ignored`);
        return;
    }

    var buildVizRenderer: BuildVizRenderer = (data, targetElement, options) => {
        var viz = _.isFunction(vizualization) ? (<VizFactory>vizualization)() : <Viz.Visualization>vizualization;
        return new VizRenderer(targetElement, data, options, viz);
    }

    this[name] = this.prototype[name] = buildVizRenderer;
};

export function extendConnectWithVizualizations(Connect: any) {
    Connect.registerViz = registerViz;
    Connect.registerViz('chart', () => new Chart());
    Connect.registerViz('gauge', () => new Gauge());
    Connect.registerViz('text', () => new Text());
    Connect.registerViz('table', () => new Table());
}