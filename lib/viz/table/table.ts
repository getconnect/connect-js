import _ = require('underscore');
import Common = require('../visualization');
import Config = require('../config');
import Dataset = require('./dataset');
import TableRenderer = require('./renderer');
import Queries = require('../../core/queries/queries');
import Api = require('../../core/api');
import Loader = require('../loader');
import ErrorHandling = require('../error-handling');
import Dom = require('../dom');
import ResultHandling = require('../result-handling');
import Classes = require('../css-classes');
import deepExtend = require('deep-extend');

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
                formats: Config.defaultTimeSeriesFormats
            }
        };
        return defaultTableOptions;
    }
    
    public cssClasses(options: Config.VisualizationOptions) {
        return [Classes.table];
    }
}

export = Table;