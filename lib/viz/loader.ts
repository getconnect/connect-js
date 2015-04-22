import Config = require('./config');
import Classes = require('./css-classes');
import Dom = require('./dom');

class Loader {
    private _loaderContainer;
    private _visible;
    private _targetElement;

    constructor(targetElement: HTMLElement){
        var bar1 = Dom.createElement('div', Classes.loaderBar1),
            bar2 = Dom.createElement('div', Classes.loaderBar2),
            bar3 = Dom.createElement('div', Classes.loaderBar3),
            bar4 = Dom.createElement('div', Classes.loaderBar4),
            bar5 = Dom.createElement('div', Classes.loaderBar5),
            loaderContainer = Dom.createElement('div', Classes.loader);

        loaderContainer.appendChild(bar1);
        loaderContainer.appendChild(bar2);
        loaderContainer.appendChild(bar3);
        loaderContainer.appendChild(bar4);
        loaderContainer.appendChild(bar5);

        this._targetElement = targetElement;
        this._loaderContainer = loaderContainer;
    }

    show(){               
        var vizContainer = this._targetElement.querySelector('.' + Classes.viz),
            parentOfLoader = this._targetElement.querySelector('.' + Classes.result);

        if (!vizContainer || !parentOfLoader)    
            return; 
        
        vizContainer.classList.add(Classes.loading);
        parentOfLoader.appendChild(this._loaderContainer);
        this._visible = true;

    }

    hide(){
        var vizContainer = this._targetElement.querySelector('.' + Classes.viz),
            parentOfLoader = this._targetElement.querySelector('.' + Classes.result);

        if (!this._visible)
            return;
        
        if (vizContainer)
            vizContainer.classList.remove(Classes.loading);

        if (parentOfLoader)
            parentOfLoader.removeChild(this._loaderContainer);

        this._visible = false;
    }
}

export = Loader;