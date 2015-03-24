import Config = require('./config');

class Loader {
    private _loaderContainer;
    private _elementForLoader;

    constructor(targetElementId: string){
        var elementForLoader = document.querySelector(targetElementId),
            bar1 = document.createElement('div'),
            bar2 = document.createElement('div'),
            bar3 = document.createElement('div'),
            bar4 = document.createElement('div'),
            bar5 = document.createElement('div'),
            loaderContainer = document.createElement('div');

        bar1.className = 'connect-loader-bar1';
        bar2.className = 'connect-loader-bar2';
        bar3.className = 'connect-loader-bar3';
        bar4.className = 'connect-loader-bar4';
        bar5.className = 'connect-loader-bar5';
        loaderContainer.className = 'connect-loader';

        loaderContainer.appendChild(bar1);
        loaderContainer.appendChild(bar2);
        loaderContainer.appendChild(bar3);
        loaderContainer.appendChild(bar4);
        loaderContainer.appendChild(bar5);

        this._elementForLoader = elementForLoader;
        this._loaderContainer = loaderContainer;
    }

    show(){
        var elementLoading = this._elementForLoader.firstChild,
            firstChild = elementLoading.firstChild;
        
        elementLoading.className += ' connect-viz-loading';
        elementLoading.insertBefore(this._loaderContainer, firstChild);
    }

    hide(){
        var elementLoading = this._elementForLoader.firstChild

        elementLoading.className = elementLoading.className.replace(' connect-viz-loading', '');
        elementLoading.removeChild(this._loaderContainer);
    }
}

export = Loader;