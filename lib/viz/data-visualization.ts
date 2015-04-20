import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Common = require('./visualization');
import Loader = require('./loader');
import ErrorHandling = require('./error-handling');

class DataVisualization{
    private _visualization: Common.Visualization;
    private _promiser: Api.Promiser;
    private _isLoading: boolean;

    constructor(data: Queries.ConnectQuery|Api.Promiser, visualization: Common.Visualization) {
        this._promiser = this.getPromiser(data);
        this._visualization = visualization;
        this._isLoading = false;

        this.refresh(true);
    }

    public refresh(reRender: boolean = false) {
        if (this._isLoading)
            return;

        this._isLoading = true;

        var targetElement = this._visualization.targetElement,
            loadingTracker = this._promiser().then(
                (data) => { this._isLoading = false });

        this._visualization.displayData(this._promiser(), false);
    }

    public update(data: Queries.ConnectQuery|Api.Promiser) {
        this._isLoading = false;
        this._promiser = this.getPromiser(data);

        this.refresh(true);
    }

    private getPromiser(data: Queries.ConnectQuery|Api.Promiser) : Api.Promiser{
        return (<Queries.ConnectQuery>data).execute ? () => (<Queries.ConnectQuery>data).execute() : <Api.Promiser>data
    }
}

export = DataVisualization;