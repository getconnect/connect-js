import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Common = require('./visualization');
import Loader = require('./loader');
import ErrorHandling = require('./error-handling');
import ResultHandling = require('./result-handling');
import Dom = require('./dom');
import Config = require('./config');
import Classes = require('./css-classes');

class VizShell {
    private _visualization: Common.Visualization;
    private _options: Config.VisualizationOptions;
    private _loader: Loader;
    private _titleElement: HTMLElement;
    private _targetElement: HTMLElement;
    private _vizElement: HTMLElement;
    private _queryResultsFactory: Api.QueryResultsFactory;
    private _rendered: boolean;
    private _destroyDom: () => void;
    private _resultHandler: ResultHandling.ResultHandler;

    constructor(targetElement: string|HTMLElement, data: Queries.ConnectQuery|Api.QueryResultsFactory, options: Config.VisualizationOptions, visualization: any) {
        this._queryResultsFactory = this._getQueryResultsFactory(data);
        this._targetElement = Dom.getElement(targetElement);
        this._visualization = visualization;
        this._resultHandler = new ResultHandling.ResultHandler(this._targetElement);
        this._options = options;

        this._displayResults(true);
    }

    public refresh() {
        this._displayResults(false);       
    }

    public _displayResults(reRender: boolean) {
        var resultsPromise = this._queryResultsFactory(),
            modifiedResultsPromise = this._visualization.chainPromise ? this._visualization.chainPromise(resultsPromise) : resultsPromise;

        this._renderDom();
        this._resultHandler.handleResult(modifiedResultsPromise, 
                (metadata: Api.Metadata, selects: string[]) => !this._visualization.isValidResultSet || this._visualization.isValidResultSet(metadata, selects),
                (results: any, reRender: boolean) => this._visualization.displayResults(results, reRender), 
                reRender);

    }

    public update(data: Queries.ConnectQuery|Api.QueryResultsFactory) {
        this._queryResultsFactory = this._getQueryResultsFactory(data);

        this._displayResults(true);
    }

    public recalculateSize() {
        if (this._visualization.recalculateSize)
            this._visualization.recalculateSize();
    }

    public destroy() {
        var vizElementParent = this._vizElement ? this._vizElement.parentNode : null;
        
        this._rendered = false;

        if (vizElementParent)
            vizElementParent.removeChild(this._vizElement);

        if (this._visualization.destroy)
            this._visualization.destroy();
    }

    private _getQueryResultsFactory(data: Queries.ConnectQuery|Api.QueryResultsFactory) : Api.QueryResultsFactory {
        return (<Queries.ConnectQuery>data).execute ? () => (<Queries.ConnectQuery>data).execute() : <Api.QueryResultsFactory>data
    }

    private _renderDom() {
        if(this._rendered)
            return;
            
        var options = this._options,
            vizElement = Dom.createElement('div', Classes.viz),
            resultsElement = Dom.createElement('div', Classes.result),
            titleElement = Dom.createTitle(options.title);

        vizElement.appendChild(titleElement);
        vizElement.appendChild(resultsElement);
        this._targetElement.appendChild(vizElement);

        this._titleElement = titleElement;
        this._vizElement = vizElement;
        this._visualization.renderDom(vizElement, resultsElement);
        this._rendered = true;
    }
}

export = VizShell;