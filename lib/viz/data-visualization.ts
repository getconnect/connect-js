import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Common = require('./visualization');
import Loader = require('./loader');
import ErrorHandling = require('./error-handling');

class DataVisualization{
    private _visualization: Common.Visualization;
    private _queryResultsFactory: Api.QueryResultsFactory;
    private _isLoading: boolean;

    constructor(data: Queries.ConnectQuery|Api.QueryResultsFactory, visualization: Common.Visualization) {
        this._queryResultsFactory = this.getQueryResultsFactory(data);
        this._visualization = visualization;
        this._isLoading = false;

        this.refresh(true);
    }

    public refresh(reRender: boolean = false) {
        if (this._isLoading)
            return;

        this._isLoading = true;

        var targetElement = this._visualization.targetElement,
            results = this._queryResultsFactory(),
            loadingTracker = results.then(
                (data) => { this._isLoading = false });

        this._visualization.displayData(results, reRender);
    }

    public update(data: Queries.ConnectQuery|Api.QueryResultsFactory, reRender: boolean = true) {
        this._isLoading = false;
        this._queryResultsFactory = this.getQueryResultsFactory(data);

        this.refresh(reRender);
    }

    private getQueryResultsFactory(data: Queries.ConnectQuery|Api.QueryResultsFactory) : Api.QueryResultsFactory{
        return (<Queries.ConnectQuery>data).execute ? () => (<Queries.ConnectQuery>data).execute() : <Api.QueryResultsFactory>data
    }
}

export = DataVisualization;