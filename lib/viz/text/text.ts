import Config = require('../config');
import Api = require('../../core/api');
import Common = require('../visualization');
import Dom = require('../dom');
import Counter = require('./counter');
import Formatters = require('../formatters');
import Classes = require('../css-classes');

class Text implements Common.Visualization {
    private _currentValue: number;
    private _rendered: boolean;
    private _destroyDom: () => void;
    private _valueTextElement: HTMLElement;
    private _counter: Counter;
    private _counterDuration: number;

    constructor() {
        this._currentValue = 0;
    }

    public init(container: HTMLElement, options: Config.VisualizationOptions) {
        var spanForValues = Dom.createElement('span'),
            valueTextElement = Dom.createElement('span', Classes.textValue),
            valueIncreaseIconElement = Dom.createElement('span', Classes.textIcon, Classes.textIconInc, Classes.arrowUp),
            valueDecreaseIconElement = Dom.createElement('span', Classes.textIcon, Classes.textIconDec, Classes.arrowDown);

        spanForValues.appendChild(valueIncreaseIconElement);
        spanForValues.appendChild(valueDecreaseIconElement);
        spanForValues.appendChild(valueTextElement);
        container.appendChild(spanForValues);

        this._valueTextElement = valueTextElement;
        this._valueTextElement.innerHTML = '&nbsp;';
    }

    public render(container: HTMLElement, results: Api.QueryResults, options: Config.VisualizationOptions, hasQueryChanged: boolean) {
        var metadata = results.metadata,
            selects = results.selects(),
            onlyResult = results.results[0],
            aliasOfSelect = selects[0],
            fieldOption = options.fields[aliasOfSelect] || Config.defaultField,
            valueFormatter = Formatters.format(fieldOption.format),
            value = onlyResult[aliasOfSelect],
            animationElementClassList = container.classList,
            isIncreasing = value > this._currentValue,
            hasChanged = valueFormatter(this._currentValue) !== valueFormatter(value),
            duration = options.text.counterDurationMs,
            transitionClass = isIncreasing ? Classes.textValueInc : Classes.textValueDec; 

        this._currentValue = value;
        this._counter = this._counter || new Counter(this._valueTextElement, duration, valueFormatter);

        if (!hasChanged)
            return;
        
        if (!options.transitionOnReload && hasQueryChanged) {
            this._counter.setValue(value);
        } else {
            animationElementClassList.add(transitionClass);
            this._counter.update(value, () => {
                animationElementClassList.remove(transitionClass);
            });           
        }
    }
    
    public defaultOptions() {
        var defaultOptions: Config.VisualizationOptions  = { 
            transitionOnReload: true,
            text: {
                counterDurationMs: 800
            },
            fields: {}
        };
        return defaultOptions;
    }

    public isSupported(metadata: Api.Metadata, selects: string[]): boolean {
        var exactlyOneSelect = selects.length === 1,
            noGroupBys = metadata.groups.length === 0,
            noInterval = metadata.interval == null;

        return exactlyOneSelect && noGroupBys && noInterval;
    }
    
    public cssClasses(options: Config.VisualizationOptions) {
        return [Classes.text];
    }
}

export = Text;