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

class Table implements Common.Visualization {
    public targetElement: HTMLElement;
    public loader: Loader;
    private _options: Config.VisualizationOptions;
    private _rendered: boolean;
    private _titleElement: HTMLElement;
    private _tableWrapper: HTMLElement;
    private _resultHandler: ResultHandling.ResultHandler;

    constructor(targetElement: string|HTMLElement, suppliedOptions: Config.VisualizationOptions) {
        var defaultTableOptions: Config.VisualizationOptions = { 
                fields: {},
                intervals: {}
            },
            defaultIntervalOptions = {
                formats: Config.defaultTimeSeriesFormats
            };
        this.targetElement = Dom.getElement(targetElement);
        this._options = _.extend(defaultTableOptions, suppliedOptions);
        this._options.intervals = _.extend(this._options.intervals, defaultIntervalOptions);
        this.loader = new Loader(this.targetElement);
        this._resultHandler = new ResultHandling.ResultHandler();
    }

    public displayData(resultsPromise: Q.IPromise<Api.QueryResults>, reRender: boolean = true) {
        this._renderTable();
        this._resultHandler.handleResult(resultsPromise, this, this._loadData, reRender);
    }

    private _loadData(results: Api.QueryResults, reRender: boolean) {
        var dataset = new Dataset.TableDataset(results, this._options);
        this._tableWrapper.innerHTML = TableRenderer.renderDataset(dataset);
    }

    public clear() {        
        this._rendered = false;
        Dom.removeAllChildren(this.targetElement)
    }

    private _renderTable() {
        if(this._rendered)
            return;
            
        var options = this._options,
            tableContainer = Dom.createElement('div', Classes.viz, Classes.table),
            tableWrapper = Dom.createElement('div', Classes.tableWrapper),
            results = Dom.createElement('div', Classes.result),
            rootElement = this.targetElement,
            titleElement = Dom.createTitle(options.title);

        this.clear();
        tableContainer.appendChild(titleElement);
        tableContainer.appendChild(results);
        results.appendChild(tableWrapper);
        rootElement.appendChild(tableContainer);

        this._rendered = true;

        this._tableWrapper = tableWrapper;
        this._titleElement = titleElement;
    }
}

export = Table;