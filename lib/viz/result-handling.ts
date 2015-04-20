import Common = require('./visualization');
import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Loader = require('./loader');
import ErrorHandling = require('./error-handling');

module ResultHandling{
    export type LoadDataFunction = (results: Api.QueryResults, fullReload: boolean) => void;

    export class ResultHandler{
        private _lastReloadTime: number;
        private _lastRequestProcessed: number;
        private _currentRequestCount: number;

        constructor() {
            this._currentRequestCount = 0;
            this._lastRequestProcessed = 0;
            this._lastReloadTime = 0;
        }

        handleResult(resultsPromise: Q.IPromise<Api.QueryResults>, visualization: Common.Visualization, loadData: LoadDataFunction, fullReload: boolean){
            var loader = visualization.loader,
                targetElement = visualization.targetElement,   
                requestNumber,
                lastReloadTime;  

            if (fullReload || this._lastReloadTime === 0){
                ErrorHandling.clearError(targetElement);
                loader.show();
                this._lastReloadTime = Date.now();
                this._currentRequestCount = 0;
                this._lastRequestProcessed = 0;
            }
            
            lastReloadTime = this._lastReloadTime;
            requestNumber = this._currentRequestCount;
            this._currentRequestCount++;   

            resultsPromise.then(results => {
                if (lastReloadTime < this._lastReloadTime)
                    return;

                if (requestNumber < this._lastRequestProcessed)
                    return;

                loader.hide();
                this._lastRequestProcessed = requestNumber;
                try{
                    ErrorHandling.clearError(targetElement);
                    if (results == null || results.results == null || !results.results.length){
                        ErrorHandling.displayFriendlyError(targetElement, 'noResults');
                        return;
                    }
                    loadData.call(visualization, results, fullReload);
                }catch(error){
                    ErrorHandling.logError(error);
                    ErrorHandling.displayFriendlyError(targetElement);
                }
            }, error => {
                loader.hide();
                ErrorHandling.clearError(targetElement);
                ErrorHandling.logError(error);
                ErrorHandling.handleError(targetElement, error);
            });     
        }    

    }
}

export = ResultHandling;