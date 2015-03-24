import Queries = require('../core/queries/queries');
import Config = require('./config');

module Viz {
    export var DataVisualization = require('./data-visualization');
    export var Chart = require('./chart/chart');
    export var Text = require('./text');
    export var Table = require('./table/table');

    export class Visualizations{
        public chart(query: Queries.ConnectQuery, targetElementId: string, chartOptions: Config.ChartOptions){
            var chart = new Chart(targetElementId, chartOptions);
            return new DataVisualization(query, chart);
        }
    
        public text(query: Queries.ConnectQuery, targetElementId: string, textOptions: Config.TextOptions){
            var text = new Text(targetElementId, textOptions);
            return new DataVisualization(query, text);
        }

        public table(query: Queries.ConnectQuery, targetElementId: string, tableOptions: Config.TableOptions){
            var table = new Table(targetElementId, tableOptions);
            return new DataVisualization(query, table);
        }
    }
}

export = Viz;