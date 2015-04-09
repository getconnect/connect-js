import Config = require('./config');

class Loader {
    private _loaderContainer;
    private _visible;
    private _targetElement;
    private _vizSelector = '.connect-viz';
    private _parentOfLoaderSelector = '.connect-viz-result';
    private _loaderClass = 'connect-viz-loading';

    constructor(targetElement: HTMLElement){
        var bar1 = document.createElement('div'),
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

        this._targetElement = targetElement;
        this._loaderContainer = loaderContainer;
    }

    show(){               
        var vizContainer = this._targetElement.querySelector(this._vizSelector),
            parentOfLoader = this._targetElement.querySelector(this._parentOfLoaderSelector);

        if (!vizContainer || !parentOfLoader)    
            return; 
        
        vizContainer.classList.add(this._loaderClass);
        parentOfLoader.appendChild(this._loaderContainer);
        this._visible = true;

    }

    hide(){
        var vizContainer = this._targetElement.querySelector(this._vizSelector),
            parentOfLoader = this._targetElement.querySelector(this._parentOfLoaderSelector);

        if (!this._visible)
            return;
        
        if (vizContainer)
            vizContainer.classList.remove(this._loaderClass);

        if (parentOfLoader)
            parentOfLoader.removeChild(this._loaderContainer);

        this._visible = false;
    }
}

export = Loader;