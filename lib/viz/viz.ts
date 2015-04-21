import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Config = require('./config');
import DataVisualization = require('./data-visualization');
import Chart = require('./chart/chart');
import Gauge = require('./chart/gauge');
import Text = require('./text/text');
import Table = require('./table/table');

module Viz {
    export class Visualizations{
        public chart(data: Queries.ConnectQuery|Api.QueryResultsFactory, targetElement: string|HTMLElement, chartOptions: Config.VisualizationOptions){
            var chart = new Chart(targetElement, chartOptions);
            return new DataVisualization(data, chart);
        }
    
        public text(data: Queries.ConnectQuery|Api.QueryResultsFactory, targetElement: string|HTMLElement, textOptions: Config.VisualizationOptions){
            var text = new Text(targetElement, textOptions);
            return new DataVisualization(data, text);
        }

        public table(data: Queries.ConnectQuery|Api.QueryResultsFactory, targetElement: string|HTMLElement, tableOptions: Config.VisualizationOptions){
            var table = new Table(targetElement, tableOptions);
            return new DataVisualization(data, table);
        }

        public gauge(data: Queries.ConnectQuery|Api.QueryResultsFactory, targetElement: string|HTMLElement, gaugeOptions: Config.VisualizationOptions){
            var gauge = new Gauge(targetElement, gaugeOptions);
            return new DataVisualization(data, gauge);
        }
    }
}

export = Viz;