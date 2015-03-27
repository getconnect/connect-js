import Clear = require('./clear');
import Common = require('./visualization');
import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Loader = require('./loader');


module ErrorHandling {
    var errorTypes = {
        noResults: {
            icon: 'ion-sad-outline',
            defaultMessage: 'No Results'
        },
        network: {
            icon: 'ion-ios-bolt',
            defaultMessage: 'No Results'
        },
        setup: {
            icon: 'ion-sad-outline',
            defaultMessage: 'Invalid Query'
        },
        other: {
            icon: 'ion-bug',
            defaultMessage: 'Oops, something went wrong displaying the visualization'
        }
    }


    export type LoadDataFunction = (results: Api.QueryResults, metadata: Queries.Metadata) => void;
    export function makeSafe(functionToWrap: LoadDataFunction, visualization: Common.Visualization, loader: Loader): LoadDataFunction{
        return (results: Api.QueryResults, metadata: Queries.Metadata) => {
            var targetElementId = visualization.targetElementId;
            try{
                
                if (results == null || !results.length){
                    loader.hide();
                    displayFriendlyError(targetElementId, 'noResults');
                    return;
                }

                return functionToWrap.call(visualization, results, metadata);
            }catch(error){                
                logError(error);
                displayFriendlyError(targetElementId);
            }
        };
    }

    export function clearError(selector: string){
        var elementForError = document.querySelector(selector),
            errorContainer = <HTMLElement>elementForError.querySelector('.connect-error'),
            viz = <HTMLElement>elementForError.querySelector('.connect-viz');
            
            viz.classList.remove('connect-viz-in-error');

            if (errorContainer){
                elementForError.removeChild(errorContainer);
            }
    }

    export function displayFriendlyError(selector: string, type?: string, message?: string){
        var errorType = type || 'other',
            errorIcon = errorTypes[type].icon,
            errorMessage = message || errorTypes[type].defaultMessage,
            elementForError = document.querySelector(selector),
            errorIconElement = document.createElement('span'),
            errorMessageElement = document.createElement('span'),
            errorElement = document.createElement('div'),
            errorClassName = 'connect-error',
            viz = <HTMLElement>elementForError.querySelector('.connect-viz');

        if (!elementForError)
            return;

        errorMessageElement.textContent = errorMessage;
        errorIconElement.className += errorIcon + ' connect-error-icon';        
        errorElement.className += errorClassName + ' connect-error-message';

        errorElement.appendChild(errorIconElement);
        errorElement.appendChild(errorMessageElement);

        if (viz){
            viz.appendChild(errorElement);
            viz.className += ' connect-viz-in-error'
        }
    }

    export function logError(error: Error){
        if (console && console.log){
            console.log(error);
        }
    }
}

export = ErrorHandling;