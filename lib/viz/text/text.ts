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

    public displayData(resultsPromise: Q.IPromise<Api.QueryResults>, fullReload: boolean = true): void {        
        this._renderText();
        this._resultHandler.handleResult(resultsPromise, this, this._loadData, fullReload);
    }

    private _loadData(results: Api.QueryResults, fullReload: boolean): void {        
        var options = this._options,
            metadata = results.metadata,
            selects = results.selects(),
            onlyResult = results.results[0],
            aliasOfSelect = selects[0],
            defaultFieldOption = { valueFormatter: (value) => value },
            fieldOption = options.fields[aliasOfSelect] || defaultFieldOption,
            valueFormatter = fieldOption.valueFormatter,
            value = onlyResult[aliasOfSelect],
            animationElementClassList = this._valueContainerElement.classList,
            isIncreasing = value > this._currentValue,
            hasChanged = valueFormatter(this._currentValue) !== valueFormatter(value),
            duration = options.text.counterDurationMs,
            transitionClass = isIncreasing ? 'connect-text-value-increasing' : 'connect-text-value-decreasing';        

        if (!this._checkMetaDataIsApplicable(metadata, selects)){
            this._renderQueryNotApplicable();
            return;
        }        

        this._currentValue = value;
        this._counter = this._counter || new Counter(this._valueTextElement, duration, valueFormatter);

        if (!hasChanged)
            return;
        
        if (fullReload){
            this._counter.setValue(value);
        }else{
            animationElementClassList.add(transitionClass);
            this._counter.update(value, () => {
                animationElementClassList.remove(transitionClass);
            });           
        }
    }

    public clear(): void{        
        this._rendered = false;
        Dom.removeAllChildren(this.targetElement);
    }

    private _checkMetaDataIsApplicable(metadata: Api.Metadata, selects: string[]): boolean {
        var exactlyOneSelect = selects.length === 1,
            noGroupBys = metadata.groups.length === 0,
            noInterval = metadata.interval == null;

        return exactlyOneSelect && noGroupBys && noInterval;
    }

    private _showTitle(){
        var options = this._options,
            title = options.title,
            titleText = title && (<string>title).length > 0 ? title.toString() : '',
            showTitle = title !== false;

        this._titleElement.textContent = titleText;
        this._titleElement.style.display = !showTitle ? 'none' : '';
    }

    private _renderText(){
        if (this._rendered)
            return;

        var container = Dom.createElement('div', 'connect-viz', 'connect-text'),
            label = Dom.createElement('span', 'connect-viz-title'),
            elementForWidget = this.targetElement,
            spanForValues = Dom.createElement('span'),
            valueTextElement = Dom.createElement('span', 'connect-text-value'),
            valueIncreaseIconElement = Dom.createElement('span', 'connect-text-icon', 'connect-text-icon-increase', 'ion-arrow-up-b'),
            valueDecreaseIconElement = Dom.createElement('span', 'connect-text-icon', 'connect-text-icon-decrease', 'ion-arrow-down-b'),
            result = Dom.createElement('div', 'connect-viz-result');

        this.clear();
        spanForValues.appendChild(valueIncreaseIconElement);
        spanForValues.appendChild(valueDecreaseIconElement);
        spanForValues.appendChild(valueTextElement);
        result.appendChild(spanForValues);
        container.appendChild(label);
        container.appendChild(result);
        elementForWidget.appendChild(container);

        this._valueContainerElement = result;
        this._valueTextElement = valueTextElement;
        this._valueTextElement.innerHTML = '&nbsp;';
        this._titleElement = label;
        this._showTitle();
        this._rendered = true;
    }

    private _renderQueryNotApplicable(){
        this._rendered = false;
        ErrorHandling.displayFriendlyError(this.targetElement, 'unsupportedQuery');
    }
}

export = Text;