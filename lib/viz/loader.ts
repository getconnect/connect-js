import Config = require('./config');

class Loader {
    private _loaderContainer;
    private _elementForLoader;
    private _vizContainer;
    private _visible;

    constructor(targetElement: HTMLElement, containerElement: HTMLElement){
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

        this._elementForLoader = containerElement;
        this._loaderContainer = loaderContainer;
        this._vizContainer = targetElement.querySelector('.connect-viz');
    }

    show(){               
        this._vizContainer.className += ' connect-viz-loading';
        this._elementForLoader.appendChild(this._loaderContainer);
        this._visible = true;

    }

    hide(){
        if (!this._visible)
            return;
        this._vizContainer.className = this._vizContainer.className.replace(' connect-viz-loading', '');
        this._elementForLoader.removeChild(this._loaderContainer);
        this._visible = false;
    }
}

export = Loader;