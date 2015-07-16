import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Common = require('./visualization');
import Loader = require('./loader');
import ErrorHandling = require('./error-handling');
import ResultHandling = require('./result-handling');
import Dom = require('./dom');
import Config = require('./config');
import Classes = require('./css-classes');

class VizRenderer {
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

    constructor(targetElement: string|HTMLElement, data: Queries.ConnectQuery|Api.QueryResultsFactory, 
        options: Config.VisualizationOptions, visualization: Common.Visualization) {

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

    public _displayResults(isQueryUpdate: boolean) {
        var resultsPromise = this._queryResultsFactory(),
            canModifyPromise = this._visualization.modifyResults != null,
            modifiedResultsPromise = canModifyPromise ? this._visualization.modifyResults(resultsPromise) : resultsPromise;

        this._renderDom();
        this._resultHandler.handleResult(this._visualization, modifiedResultsPromise, isQueryUpdate);

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
        
        this._targetElement.removeChild(this._vizElement);

        if (this._visualization.destroy)
            this._visualization.destroy();

        this._renderDom = VizRenderer.prototype._renderDom;
    }

    private _getQueryResultsFactory(data: Queries.ConnectQuery|Api.QueryResultsFactory) : Api.QueryResultsFactory {
        return (<Queries.ConnectQuery>data).execute ? () => (<Queries.ConnectQuery>data).execute() : <Api.QueryResultsFactory>data
    }

    private _renderDom() {            
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
        this._renderDom = () => {};
    }
}

export = VizRenderer;