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
            defaultMessage: 'Network Error',
            retry: true,
        },
        setup: {
            icon: 'ion-sad-outline',
            defaultMessage: 'Invalid Query'
        },
        other: {
            icon: 'ion-bug',
            defaultMessage: 'Error'
        }
    }

    var statusErrorTypes = {
        status404: 'noResults',
        statusNetworkFailure: 'network'
    }

    export function handleError(targetElement: HTMLElement, error: any){
        var status = 'status' + error.status,
            errorType = statusErrorTypes[status] || 'other';

        displayFriendlyError(targetElement, errorType);
    }

    export function clearError(targetElement: HTMLElement){
        var elementForError = targetElement,
            errorContainer = <HTMLElement>elementForError.querySelector('.connect-error'),
            viz = <HTMLElement>elementForError.querySelector('.connect-viz');

            if (errorContainer){
                errorContainer.parentNode.removeChild(errorContainer);
            }
            
            if (viz){
                viz.classList.remove('connect-viz-in-error');
            }
    }

    export function displayFriendlyError(targetElement: HTMLElement, type: string = 'other', message: string = ''){
        var errorIcon = errorTypes[type].icon,
            retry = errorTypes[type].retry,
            errorMessage = message || errorTypes[type].defaultMessage,
            elementForError = targetElement,
            errorIconElement = document.createElement('span'),
            errorMessageElement = document.createElement('span'),
            errorElement = document.createElement('div'),
            errorClassName = 'connect-error',
            viz = <HTMLElement>elementForError.querySelector('.connect-viz');

        if (!elementForError){
            return;
        }

        errorMessageElement.textContent = errorMessage;
        errorIconElement.className += errorIcon + ' connect-error-icon';        
        errorElement.className += errorClassName + ' connect-error-message';

        errorElement.appendChild(errorIconElement);
        errorElement.appendChild(errorMessageElement);

        if(retry) {
            var retryElement = document.createElement('span');
            retryElement.textContent = "Retry";
            errorElement.appendChild(retryElement);
        }

        if (viz){
            viz.appendChild(errorElement);
            viz.className += ' connect-viz-in-error'
        }
    }

    export function logError(error: Error){
        if (console && console.log){
            console.log(error.toString());
        }
    }
}

export = ErrorHandling;