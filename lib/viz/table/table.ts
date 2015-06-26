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
    private _options: Config.VisualizationOptions;
    private _tableWrapper: HTMLElement;

    constructor(tableOptions: Config.VisualizationOptions) {
        var defaultTableOptions: Config.VisualizationOptions = { 
                fields: {},
                intervals: {
                    formats: Config.defaultTimeSeriesFormats
                }
            };
        this._options = deepExtend({}, defaultTableOptions, tableOptions);
    }

    public displayResults(results: Api.QueryResults, reRender: boolean): void {
        var dataset = new Dataset.TableDataset(results, this._options);
        this._tableWrapper.innerHTML = TableRenderer.renderDataset(dataset);
    }

    public renderDom(vizElement: HTMLElement, resultsElement: HTMLElement) {
        var options = this._options,
            tableWrapper = Dom.createElement('div', Classes.tableWrapper);

        vizElement.classList.add(Classes.table);
        resultsElement.appendChild(tableWrapper);
        
        this._tableWrapper = tableWrapper;
    }
}

export = Table;