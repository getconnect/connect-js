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
	private _options: Config.TableOptions;
	private _rendered: boolean;
    private _titleElement: HTMLElement;
    private _tableWrapper: HTMLElement;

	constructor(targetElement: string|HTMLElement, suppliedOptions: Config.TableOptions) {
	    var defaultTableOptions: Config.TableOptions = { 
                fieldOptions: {},
                intervalOptions: {}
            },
            defaultIntervalOptions = {
                formats: Config.defaultTimeSeriesFormats
            };
        this.targetElement = Dom.getElement(targetElement);
	    this._options = _.extend(defaultTableOptions, suppliedOptions);
        this._options.intervalOptions = _.extend(this._options.intervalOptions, defaultIntervalOptions);
	}

	public displayData(resultsPromise: Q.IPromise<Api.QueryResults>, metadata: Queries.Metadata, showLoader: boolean = true) {
		this._renderTable(metadata);
        ResultHandling.handleResult(resultsPromise, metadata, this, this._loadData, showLoader);
    }

	private _loadData(results: Api.QueryResults, metadata: Queries.Metadata) {
        var dataset = new Dataset.TableDataset(metadata, this._options, results);
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

    private _renderTable(metadata: Queries.Metadata) {
        if(this._rendered)
            return;
            
        var options = this._options,
            tableContainer: HTMLElement = document.createElement('div'),
            tableWrapper = document.createElement('div'),
            rootElement = this.targetElement,
            titleElement = document.createElement('span')

        this.clear();

        tableContainer.className = 'connect-viz connect-table';
        titleElement.className = 'connect-viz-title';
        tableWrapper.className = 'connect-viz-result connect-table-wrapper';

        tableContainer.appendChild(titleElement);
        tableContainer.appendChild(tableWrapper);

        rootElement.appendChild(tableContainer);

        this._rendered = true;

        this._tableWrapper = tableWrapper;
        this._titleElement = titleElement;
        this._showTitle();        
        this.loader = new Loader(this.targetElement, tableContainer);
    }
}

export = Table;