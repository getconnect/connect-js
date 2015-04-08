import Common = require('./visualization');
import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Loader = require('./loader');
import ErrorHandling = require('./error-handling');

module ResultHandling{
    export type LoadDataFunction = (results: Api.QueryResults, metadata: Queries.Metadata) => void;

    export function handleResult(resultsPromise: Q.IPromise<Api.QueryResults>, metadata: Queries.Metadata, visualization: Common.Visualization, loadData: LoadDataFunction, showLoader: boolean){
        var loader = visualization.loader,
            targetElement = visualization.targetElement,
            hideLoader = () => {
                if (showLoader){
                    loader.hide();
                }
            }

        console.log('clearing error');
        ErrorHandling.clearError(targetElement);

        if (showLoader){
            loader.show();
        }

        resultsPromise.then(results => {
            hideLoader();
            try{
                if (results == null || !results.length){
                    ErrorHandling.displayFriendlyError(targetElement, 'noResults');
                    return;
                }
                loadData.call(visualization, results, metadata);
            }catch(error){
                ErrorHandling.logError(error);
                ErrorHandling.displayFriendlyError(targetElement);
            }
        }, error => {
            hideLoader();
            ErrorHandling.handleError(targetElement, error);
        });
    }
}

export = ResultHandling;