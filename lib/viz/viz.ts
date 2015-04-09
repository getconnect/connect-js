import Queries = require('../core/queries/queries');
import Config = require('./config');

module Viz {
    export var DataVisualization = require('./data-visualization');
    export var Chart = require('./chart/chart');
    export var Gauge = require('./chart/gauge');
    export var Text = require('./text');
    export var Table = require('./table/table');

    export class Visualizations{
        public chart(query: Queries.ConnectQuery, targetElement: string|HTMLElement, chartOptions: Config.ChartOptions){
            var chart = new Chart(targetElement, chartOptions);
            return new DataVisualization(query, chart);
        }
    
        public text(query: Queries.ConnectQuery, targetElement: string|HTMLElement, textOptions: Config.TextOptions){
            var text = new Text(targetElement, textOptions);
            return new DataVisualization(query, text);
        }

        public table(query: Queries.ConnectQuery, targetElement: string|HTMLElement, tableOptions: Config.TableOptions){
            var table = new Table(targetElement, tableOptions);
            return new DataVisualization(query, table);
        }

        public gauge(query: Queries.ConnectQuery, targetElement: string|HTMLElement, chartOptions: Config.ChartOptions){
            var chart = new Gauge(targetElement, chartOptions);
            return new DataVisualization(query, chart);
        }

    }
}

export = Viz;