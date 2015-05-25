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
import Classes = require('../css-classes');
import deepExtend = require('deep-extend');

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
        var defaultOptions = { 
            transitionOnReload: true,
            text: {
                counterDurationMs: 800
            },
            fields: {} 
        };

        this._options = deepExtend({}, defaultOptions, textOptions);
        this.targetElement = Dom.getElement(targetElement);
        this.loader = new Loader(this.targetElement);
        this._currentValue = 0;
        this._resultHandler = new ResultHandling.ResultHandler();
    }

    public displayData(resultsPromise: Q.IPromise<Api.QueryResults>, reRender: boolean = true): void {
        this._renderText();
        this._resultHandler.handleResult(resultsPromise, this, this._loadData, reRender);
    }

    private _loadData(results: Api.QueryResults, reRender: boolean): void {
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
            transitionClass = isIncreasing ? Classes.textValueInc : Classes.textValueDec;        

        if (!this._checkMetaDataIsApplicable(metadata, selects)){
            this._renderQueryNotApplicable();
            return;
        }        

        this._currentValue = value;
        this._counter = this._counter || new Counter(this._valueTextElement, duration, valueFormatter);

        if (!hasChanged)
            return;
        
        if (!options.transitionOnReload && reRender){
            this._counter.setValue(value);
        }else{
            animationElementClassList.add(transitionClass);
            this._counter.update(value, () => {
                animationElementClassList.remove(transitionClass);
            });           
        }
    }

    public clear(): void {
        this._rendered = false;
        Dom.removeAllChildren(this.targetElement);
    }

    private _checkMetaDataIsApplicable(metadata: Api.Metadata, selects: string[]): boolean {
        var exactlyOneSelect = selects.length === 1,
            noGroupBys = metadata.groups.length === 0,
            noInterval = metadata.interval == null;

        return exactlyOneSelect && noGroupBys && noInterval;
    }

    private _renderText(){
        if (this._rendered)
            return;

        var options = this._options,
            container = Dom.createElement('div', Classes.viz, Classes.text),
            titleElement = Dom.createTitle(options.title),
            elementForWidget = this.targetElement,
            spanForValues = Dom.createElement('span'),
            valueTextElement = Dom.createElement('span', Classes.textValue),
            valueIncreaseIconElement = Dom.createElement('span', Classes.textIcon, Classes.textIconInc, Classes.arrowUp),
            valueDecreaseIconElement = Dom.createElement('span', Classes.textIcon, Classes.textIconDec, Classes.arrowDown),
            result = Dom.createElement('div', Classes.result);

        this.clear();
        spanForValues.appendChild(valueIncreaseIconElement);
        spanForValues.appendChild(valueDecreaseIconElement);
        spanForValues.appendChild(valueTextElement);
        result.appendChild(spanForValues);
        container.appendChild(titleElement);
        container.appendChild(result);
        elementForWidget.appendChild(container);

        this._valueContainerElement = result;
        this._valueTextElement = valueTextElement;
        this._valueTextElement.innerHTML = '&nbsp;';
        this._titleElement = titleElement;
        this._rendered = true;
    }

    private _renderQueryNotApplicable(){
        this._rendered = false;
        ErrorHandling.displayFriendlyError(this.targetElement, 'unsupportedQuery');
    }
}

export = Text;