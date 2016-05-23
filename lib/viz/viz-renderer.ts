import _ = require('underscore');
import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Common = require('./visualization');
import Loader = require('./loader');
import ErrorHandling = require('./error-handling');
import ResultHandling = require('./result-handling');
import Dom = require('./dom');
import Config = require('./config');
import Classes = require('./css-classes');
import deepExtend = require('deep-extend');

class VizRenderer {
    private _visualization: Common.Visualization;
    private _options: Config.VisualizationOptions;
    private _loader: Loader;
    private _titleElement: HTMLElement;
    private _targetElement: HTMLElement;
    private _vizElement: HTMLElement;
    private _resultsElement: HTMLElement;
    private _queryResultsFactory: Api.QueryResultsFactory;
    private _rendered: boolean;
    private _destroyDom: () => void;
    private _resultHandler: ResultHandling.ResultHandler;

    constructor(targetElement: string|HTMLElement, data: Queries.ConnectQuery|Api.QueryResultsFactory, 
        options: Config.VisualizationOptions, visualization: Common.Visualization) {

        this._targetElement = Dom.getElement(targetElement);
        if (!this._targetElement) {
            console.warn(`Warning: The supplied container ${targetElement} could not be found.`);
            return;
        }

        this._queryResultsFactory = this._getQueryResultsFactory(data);
        this._visualization = visualization;
        this._resultHandler = new ResultHandling.ResultHandler(this._targetElement);
        this._options = this._visualization.defaultOptions ? deepExtend({}, this._visualization.defaultOptions(), options) : options;

        this._displayResults(true);
    }

    public refresh() {
        this._displayResults(false);
    }

    public _displayResults(hasQueryUpdated: boolean) {
        var resultsPromise = this._queryResultsFactory(),
            canModifyPromise = this._visualization.modifyResults != null,
            modifiedResultsPromise = canModifyPromise ? this._visualization.modifyResults(resultsPromise) : resultsPromise;

        this._initDom();
        this._resultHandler.handleResult(this._visualization, this._resultsElement, modifiedResultsPromise, this._options, hasQueryUpdated);
    }

    public update(data: Queries.ConnectQuery|Api.QueryResultsFactory) {
        this._queryResultsFactory = this._getQueryResultsFactory(data);

        this._displayResults(true);
    }

    public redraw() {
        if (this._visualization.redraw)
            this._visualization.redraw();
    }

    public destroy() {
        
        this._targetElement.removeChild(this._vizElement);

        if (this._visualization.destroy)
            this._visualization.destroy();

        this._initDom = VizRenderer.prototype._initDom;
    }

    private _getQueryResultsFactory(data: Queries.ConnectQuery|Api.QueryResultsFactory) : Api.QueryResultsFactory {
        return (<Queries.ConnectQuery>data).execute ? () => (<Queries.ConnectQuery>data).execute() : <Api.QueryResultsFactory>data
    }

    private _initDom() {            
        var options = this._options,
            vizElement = Dom.createElement('div', Classes.viz),
            resultsElement = Dom.createElement('div', Classes.result),
            titleElement = Dom.createTitle(options.title);

        vizElement.appendChild(titleElement);
        vizElement.appendChild(resultsElement);
        this._targetElement.appendChild(vizElement);

        if (this._visualization.cssClasses) {
            _.each(this._visualization.cssClasses(options), (value) => vizElement.classList.add(value));
        }

        this._titleElement = titleElement;
        this._vizElement = vizElement;
        this._resultsElement = resultsElement;
        if (this._visualization.init) {
            this._visualization.init(resultsElement, options);
        }
        this._initDom = () => {};
    }
}

export = VizRenderer;