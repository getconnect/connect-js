import Config = require('./config');
import ErrorHandling = require('./error-handling');
import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import _ = require('underscore');
import Common = require('./visualization');
import Clear = require('./clear');
import Loader = require('./loader');
import Dom = require('./dom');

class Text implements Common.Visualization {
    public targetElement: HTMLElement;
    private _options: Config.TextOptions;
    private _rendered: boolean;
    private _valueElement: HTMLElement;
    private _titleElement: HTMLElement;
    private _loader: Loader;

    constructor(targetElement: string|HTMLElement, textOptions: Config.TextOptions) {
        this._options = _.extend({ 
            valueFormatter: (value) => value 
        }, textOptions);

        this.targetElement = Dom.getElement(targetElement);
    }

    public displayData(resultsPromise: Q.IPromise<Api.QueryResults>, metadata: Queries.Metadata): void {        
        if (!this._checkMetaDataIsApplicable(metadata)){
            this._renderQueryNotApplicable();
            return;
        }

        this._renderText(metadata);
        this._loader.show();

        resultsPromise.then(results => {
            this._loadData(results, metadata)
        });
    }

    public _loadData(results: Api.QueryResults, metadata: Queries.Metadata): void {        
        var options = this._options,
            onlyResult = results[0],
            aliasOfSelect = metadata.selects[0],
            valueText = options.fieldOptions[aliasOfSelect].valueFormatter(onlyResult[aliasOfSelect]);
        this._loader.hide();
        this._valueElement.textContent = valueText;
        this._showTitle(metadata);  
    }

    public clear(): void{        
        this._rendered = false;
        Clear.removeAllChildren(this.targetElement);
    }

    private _checkMetaDataIsApplicable(metadata: Queries.Metadata): boolean {
        var exactlyOneSelect = metadata.selects.length === 1,
            noGroupBys = metadata.groups.length === 0,
            noInterval = metadata.interval == null;

        return exactlyOneSelect && noGroupBys && noInterval;
    }

    private _showTitle(metadata: Queries.Metadata){
        var options = this._options,
            aliasOfSelect = metadata.selects[0],
            title = options.title,
            titleText = title && (<string>title).length > 0 ? title.toString() : aliasOfSelect,
            showTitle = title !== false;

        this._titleElement.textContent = titleText;
        this._titleElement.style.display = !showTitle ? 'none' : '';
    }

    private _renderText(metadata){
        if (this._rendered)
            return;

        var container = document.createElement('div'),
            label = document.createElement('span'),
            elementForWidget = this.targetElement,
            valueTextElement = document.createElement('span'),
            valueElement = document.createElement('div');

        container.className = 'connect-viz connect-text';
        label.className = 'connect-viz-title';
        valueElement.className = 'connect-text-value';

        this.clear();
        valueElement.appendChild(valueTextElement);
        container.appendChild(label);
        container.appendChild(valueElement);
        elementForWidget.appendChild(container);

        this._valueElement = valueTextElement;
        this._valueElement.textContent = ' '
        this._titleElement = label;
        this._showTitle(metadata);        
        this._loader = new Loader(this.targetElement, valueElement);
        this._loadData = ErrorHandling.makeSafe(this._loadData, this, this._loader);
        this._rendered = true;
    }

    private _renderQueryNotApplicable(){
        var errorMsg = 'To display in a text widget a query must contain 1 select, 0 groupBys, and no interval';

        this._rendered = false;
        ErrorHandling.displayFriendlyError(this.targetElement, errorMsg);
    }
}

export = Text;