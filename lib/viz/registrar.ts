import Chart = require('./chart/chart');
import Gauge = require('./chart/gauge');
import Text = require('./text/text');
import Table = require('./table/table');
import VizRenderer = require('./viz-renderer');
import Viz  = require('./visualization');
import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Config = require('./config');

type VizFactory = (options: Config.VisualizationOptions) => Viz.Visualization;

interface BuildVizRenderer {
    (data: Queries.ConnectQuery|Api.QueryResultsFactory, 
        targetElement: string|HTMLElement, 
        options: Config.VisualizationOptions): VizRenderer
}

function registerViz(name: string, vizFactory: VizFactory) {
    if (this[name]){
        console.warn(`There is already a visualization registered under ${name}, this registration will be ignored`);
        return;
    }

    var buildVizRenderer: BuildVizRenderer = (data, targetElement, options) => {
            return new VizRenderer(targetElement, data, options, vizFactory(options));
    }

    this[name] = this.prototype[name] = buildVizRenderer;
};

export function extendConnectWithVizualizations(Connect: any) {
    Connect.registerViz = registerViz;
    Connect.registerViz('chart', (options: Config.VisualizationOptions) => new Chart(options));
    Connect.registerViz('gauge', (options: Config.VisualizationOptions) => new Gauge(options));
    Connect.registerViz('text', (options: Config.VisualizationOptions) => new Text(options));
    Connect.registerViz('table', (options: Config.VisualizationOptions) => new Table(options));
}