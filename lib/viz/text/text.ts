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
    private _options: Config.VisualizationOptions;
    private _currentValue: number;
    private _rendered: boolean;
    private _destroyDom: () => void;
    private _valueTextElement: HTMLElement;
    private _valueContainerElement: HTMLElement;
    private _counter: Counter;
    private _counterDuration: number;

    constructor(textOptions: Config.VisualizationOptions) {
        var defaultOptions = { 
            transitionOnReload: true,
            text: {
                counterDurationMs: 800
            },
            fields: {} 
        };

        this._options = deepExtend({}, defaultOptions, textOptions);
        this._currentValue = 0;
    }

    public renderDom(vizElement: HTMLElement, resultsElement: HTMLElement){
        var spanForValues = Dom.createElement('span'),
            valueTextElement = Dom.createElement('span', Classes.textValue),
            valueIncreaseIconElement = Dom.createElement('span', Classes.textIcon, Classes.textIconInc, Classes.arrowUp),
            valueDecreaseIconElement = Dom.createElement('span', Classes.textIcon, Classes.textIconDec, Classes.arrowDown);

        vizElement.classList.add(Classes.text)

        spanForValues.appendChild(valueIncreaseIconElement);
        spanForValues.appendChild(valueDecreaseIconElement);
        spanForValues.appendChild(valueTextElement);
        resultsElement.appendChild(spanForValues);

        this._valueContainerElement = resultsElement;
        this._valueTextElement = valueTextElement;
        this._valueTextElement.innerHTML = '&nbsp;';
    }

    public displayResults(results: Api.QueryResults, isQueryUpdate: boolean): void {
        var options = this._options,
            metadata = results.metadata,
            selects = results.selects(),
            onlyResult = results.results[0],
            aliasOfSelect = selects[0],
            defaultFieldOption = { valueFormatter: (value) => value },
            fieldOption = options.fields[aliasOfSelect] || defaultFieldOption,
            valueFormatter = fieldOption.valueFormatter || defaultFieldOption.valueFormatter,
            value = onlyResult[aliasOfSelect],
            animationElementClassList = this._valueContainerElement.classList,
            isIncreasing = value > this._currentValue,
            hasChanged = valueFormatter(this._currentValue) !== valueFormatter(value),
            duration = options.text.counterDurationMs,
            transitionClass = isIncreasing ? Classes.textValueInc : Classes.textValueDec; 

        this._currentValue = value;
        this._counter = this._counter || new Counter(this._valueTextElement, duration, valueFormatter);

        if (!hasChanged)
            return;
        
        if (!options.transitionOnReload && isQueryUpdate){
            this._counter.setValue(value);
        }else{
            animationElementClassList.add(transitionClass);
            this._counter.update(value, () => {
                animationElementClassList.remove(transitionClass);
            });           
        }
    }

    public isResultSetSupported(metadata: Api.Metadata, selects: string[]): boolean {
        var exactlyOneSelect = selects.length === 1,
            noGroupBys = metadata.groups.length === 0,
            noInterval = metadata.interval == null;

        return exactlyOneSelect && noGroupBys && noInterval;
    }
}

export = Text;