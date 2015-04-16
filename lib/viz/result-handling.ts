import Common = require('./visualization');
import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Loader = require('./loader');
import ErrorHandling = require('./error-handling');

module ResultHandling{
    export type LoadDataFunction = (results: Api.QueryResults, metadata: Api.Metadata, fullReload: boolean) => void;

    export function handleResult(resultsPromise: Q.IPromise<Api.QueryResults>, metadata: Api.Metadata, visualization: Common.Visualization, loadData: LoadDataFunction, fullReload: boolean){
        var loader = visualization.loader,
            targetElement = visualization.targetElement,
            hideLoader = () => {
                if (fullReload){
                    loader.hide();
                }
            }

        if (fullReload){
            ErrorHandling.clearError(targetElement);
            loader.show();
        }

        resultsPromise.then(results => {
            hideLoader();
            try{
                ErrorHandling.clearError(targetElement);
                if (results == null || results.results == null || !results.results.length){
                    ErrorHandling.displayFriendlyError(targetElement, 'noResults');
                    return;
                }
                loadData.call(visualization, results, metadata, fullReload);
            }catch(error){
                ErrorHandling.logError(error);
                ErrorHandling.displayFriendlyError(targetElement);
            }
        }, error => {
            hideLoader();
            ErrorHandling.clearError(targetElement);
            ErrorHandling.handleError(targetElement, error);
        });
    }
}

export = ResultHandling;