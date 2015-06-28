import Viz  = require('./visualization');
import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Loader = require('./loader');
import ErrorHandling = require('./error-handling');

module ResultHandling{
    export type LoadDataFunction = (results: Api.QueryResults, reRender: boolean) => void;
    export type IsValidResultSetFunction = (metadata: Api.Metadata, selects: string[]) => boolean;

    export class ResultHandler{
        private _lastReloadTime: number;
        private _lastRequestProcessed: number;
        private _currentRequestCount: number;
        private _loader: Loader;
        private _targetElement: HTMLElement;

        constructor(targetElement: HTMLElement) {
            this._currentRequestCount = 0;
            this._lastRequestProcessed = 0;
            this._lastReloadTime = 0;
            this._targetElement = targetElement;
            this._loader = new Loader(targetElement); 
        }

        handleResult(visualization: Viz.Visualization, resultsPromise: Q.IPromise<Api.QueryResults>, reRender: boolean){
            var loader = this._loader,
                targetElement = this._targetElement,                
                isResultSetSupported = (metadata: Api.Metadata, selects: string[]) => !visualization.isResultSetSupported || visualization.isResultSetSupported(metadata, selects),                
                requestNumber,
                lastReloadTime;  

            if (reRender || this._lastReloadTime === 0){
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

                    if (!isResultSetSupported(results.metadata, results.selects())){
                        ErrorHandling.displayFriendlyError(targetElement, 'unsupportedQuery');
                        return;
                    }
                    
                    visualization.displayResults(results, reRender);
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