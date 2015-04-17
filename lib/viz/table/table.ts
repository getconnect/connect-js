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

    public displayData(resultsPromise: Q.IPromise<Api.QueryResults>, fullReload: boolean = true) {
        this._renderTable();
        this._resultHandler.handleResult(resultsPromise, this, this._loadData, fullReload);
    }

    private _loadData(results: Api.QueryResults, fullReload: boolean) {
        var dataset = new Dataset.TableDataset(results, this._options);
        this._tableWrapper.innerHTML = TableRenderer.renderDataset(dataset);
        this._showTitle();
    }

    public clear() {        
        this._rendered = false;
        Dom.removeAllChildren(this.targetElement)
    }

    private _showTitle(){
        var options = this._options,
            titleText = options.title ? options.title.toString() : '',
            showTitle = titleText.length > 0;

        this._titleElement.textContent = titleText;
        this._titleElement.style.display = !showTitle ? 'none' : '';      
    }

    private _renderTable() {
        if(this._rendered)
            return;
            
        var options = this._options,
            tableContainer: HTMLElement = document.createElement('div'),
            tableWrapper = document.createElement('div'),
            results = document.createElement('div'),
            rootElement = this.targetElement,
            titleElement = document.createElement('span')

        this.clear();

        tableContainer.className = 'connect-viz connect-table';
        titleElement.className = 'connect-viz-title';
        results.className = 'connect-viz-result';
        tableWrapper.className = 'connect-table-wrapper';

        tableContainer.appendChild(titleElement);
        tableContainer.appendChild(results);
        results.appendChild(tableWrapper);

        rootElement.appendChild(tableContainer);

        this._rendered = true;

        this._tableWrapper = tableWrapper;
        this._titleElement = titleElement;
        this._showTitle();        
    }
}

export = Table;