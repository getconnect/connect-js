import Clear = require('./clear');
import Common = require('./visualization');
import Queries = require('../core/queries/queries');
import Api = require('../core/api');


module ErrorHandling {
    export type LoadDataFunction = (results: Api.QueryResults, metadata: Queries.Metadata) => void;
    export function makeSafe(functionToWrap: LoadDataFunction, visualization: Common.Visualization): LoadDataFunction{
        return (results: Api.QueryResults, metadata: Queries.Metadata) => {
            var targetElementId = visualization.targetElementId;
            try{
                
                if (results == null || !results.length){
                    displayFriendlyError(targetElementId, "No Results");
                    return;
                }

                return functionToWrap.call(visualization, results, metadata);
            }catch(error){                
                visualization.clear();
                logError(error);
                displayFriendlyError(targetElementId);
            }
        };
    }

    export function displayFriendlyError(selector: string, errorMessage?: string){
        Clear.removeAllChildren(selector);

        var elementForError = document.querySelector(selector),
            errorElement = document.createElement('span'),
            errorClassName = 'connect-error';

        if (!elementForError)
            return;

        errorElement.textContent = errorMessage || 'Oops, something went wrong displaying the visualization.';
        errorElement.className += errorClassName;
        elementForError.appendChild(errorElement);
    }

    export function logError(error: Error){
        if (console && console.log){
            console.log(error);
        }
    }
}

export = ErrorHandling;