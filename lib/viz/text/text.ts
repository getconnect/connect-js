import Config = require('../config');
import ErrorHandling = require('../error-handling');
import Queries = require('../../core/queries/queries');
import Api = require('../../core/api');
import _ = require('underscore');
import Common = require('../visualization');
import Loader = require('../loader');
import ResultHandling = require('../result-handling');
import Dom = require('../dom');
import Counter = require('./counter');

class Text implements Common.Visualization {
    public targetElement: HTMLElement;
    public loader: Loader;
    private _options: Config.VisualizationOptions;
    private _currentValue: number;
    private _rendered: boolean;
    private _valueTextElement: HTMLElement;
    private _valueContainerElement: HTMLElement;
    private _titleElement: HTMLElement;
    private _counter: Counter;
    private _counterDuration: number;
    private _resultHandler: ResultHandling.ResultHandler;

    constructor(targetElement: string|HTMLElement, textOptions: Config.VisualizationOptions) {
        this._options = _.extend({ 
            text: {
                counterDurationMs: 800
            },
            fields: {} 
        }, textOptions);

        this.targetElement = Dom.getElement(targetElement);
        this.loader = new Loader(this.targetElement);
        this._currentValue = 0;
        this._resultHandler = new ResultHandling.ResultHandler();
    }

    public displayData(resultsPromise: Q.IPromise<Api.QueryResults>, metadata: Api.Metadata, showLoader: boolean = true): void {        
        this._renderText(metadata);

        if (!this._checkMetaDataIsApplicable(metadata)){
            this._renderQueryNotApplicable();
            return;
        }        

        this._resultHandler.handleResult(resultsPromise, metadata, this, this._loadData, showLoader);
    }

    private _loadData(results: Api.QueryResults, metadata: Api.Metadata): void {        
        var options = this._options,
            onlyResult = results.results[0],
            aliasOfSelect = metadata.selects[0],
            defaultFieldOption = { valueFormatter: (value) => value },
            fieldOption = options.fields[aliasOfSelect] || defaultFieldOption,
            valueFormatter = fieldOption.valueFormatter,
            value = onlyResult[aliasOfSelect],
            animationElementClassList = this._valueContainerElement.classList,
            isIncreasing = value > this._currentValue,
            hasChanged = valueFormatter(this._currentValue) !== valueFormatter(value),
            duration = options.text.counterDurationMs,
            transitionClass = isIncreasing ? 'connect-text-value-increasing' : 'connect-text-value-decreasing';
        
        this._showTitle(metadata);
        this._currentValue = value;

        if (!hasChanged)
            return;
        
        animationElementClassList.add(transitionClass);
        this._counter = this._counter || new Counter(this._valueTextElement, duration, valueFormatter);
        this._counter.update(value, () => {
            animationElementClassList.remove(transitionClass);
        });
    }

    public clear(): void{        
        this._rendered = false;
        Dom.removeAllChildren(this.targetElement);
    }

    private _checkMetaDataIsApplicable(metadata: Api.Metadata): boolean {
        var exactlyOneSelect = metadata.selects.length === 1,
            noGroupBys = metadata.groups.length === 0,
            noInterval = metadata.interval == null;

        return exactlyOneSelect && noGroupBys && noInterval;
    }

    private _showTitle(metadata: Api.Metadata){
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
            spanForValues = document.createElement('span'),
            valueTextElement = document.createElement('span'),
            valueIncreaseIconElement = document.createElement('span'),
            valueDecreaseIconElement = document.createElement('span'),
            valueElement = document.createElement('div');

        container.className = 'connect-viz connect-text';
        label.className = 'connect-viz-title';
        valueElement.className = 'connect-viz-result';
        valueTextElement.className = 'connect-text-value'
        valueIncreaseIconElement.className = 'connect-text-icon connect-text-icon-increase ion-arrow-up-b';
        valueDecreaseIconElement.className = 'connect-text-icon connect-text-icon-decrease ion-arrow-down-b';

        this.clear();
        spanForValues.appendChild(valueIncreaseIconElement);
        spanForValues.appendChild(valueDecreaseIconElement);
        spanForValues.appendChild(valueTextElement);
        valueElement.appendChild(spanForValues);
        container.appendChild(label);
        container.appendChild(valueElement);
        elementForWidget.appendChild(container);

        this._valueContainerElement = valueElement;
        this._valueTextElement = valueTextElement;
        this._valueTextElement.innerHTML = '&nbsp;';
        this._titleElement = label;
        this._showTitle(metadata);
        this._rendered = true;
    }

    private _renderQueryNotApplicable(){
        this._rendered = false;
        ErrorHandling.displayFriendlyError(this.targetElement, 'unsupportedQuery');
    }
}

export = Text;