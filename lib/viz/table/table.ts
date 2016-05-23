import Common = require('../visualization');
import Config = require('../config');
import Dataset = require('./dataset');
import TableRenderer = require('./renderer');
import Api = require('../../core/api');
import Dom = require('../dom');
import Classes = require('../css-classes');

class Table implements Common.Visualization {
    private _tableWrapper: HTMLElement;
    
    public init(container: HTMLElement, options: Config.VisualizationOptions) {
        var tableWrapper = Dom.createElement('div', Classes.tableWrapper);
        container.appendChild(tableWrapper);
        this._tableWrapper = tableWrapper;
    }

    public render(container: HTMLElement, results: Api.QueryResults, options: Config.VisualizationOptions) {
        var dataset = new Dataset.TableDataset(results, options);
        this._tableWrapper.innerHTML = TableRenderer.renderDataset(dataset);
    }

    public defaultOptions() {
        var defaultTableOptions: Config.VisualizationOptions = { 
            fields: {},
            intervals: {
                format: Config.defaultTimeSeriesFormats
            }
        };
        return defaultTableOptions;
    }
    
    public cssClasses(options: Config.VisualizationOptions) {
        return [Classes.table];
    }
}

export = Table;