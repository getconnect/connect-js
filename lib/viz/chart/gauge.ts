import Config = require('../config');
import Dataset = require('./dataset');
import Queries = require('../../core/queries/queries');
import Api = require('../../core/api');
import _ = require('underscore');
import Common = require('../visualization');
import ErrorHandling = require('../error-handling');
import Palette = require('../palette');
import Loader = require('../loader');
import Formatters = require('../formatters');
import Dom = require('../dom');
import ResultHandling = require('../result-handling');
import c3 = require('../c3');
import Classes = require('../css-classes');
import deepExtend = require('../deep-extend');

class Gauge implements Common.Visualization {
    public targetElement: HTMLElement;
    public loader: Loader;
    private _options: Config.VisualizationOptions;
    private _minSelectName: string;
    private _maxSelectName: string;
    private _gauge: C3.Chart;
    private _rendered: boolean;
    private _titleElement: HTMLElement;
    private _currentDataset: Dataset.ChartDataset;
    private _transitionDuration;
    private _resultHandler: ResultHandling.ResultHandler;
    private _loadsMinMaxFromResult: boolean;
    
    constructor(targetElement: string|HTMLElement, gaugeOptions: Config.VisualizationOptions) {     
        this._options = this._parseOptions(gaugeOptions);
        this.targetElement = Dom.getElement(targetElement);
        this.loader = new Loader(this.targetElement);
        this._resultHandler = new ResultHandling.ResultHandler();
        this._transitionDuration = {
            none: null,
            some: 300
        }
    }

    private _parseOptions(gaugeOptions: Config.VisualizationOptions): Config.VisualizationOptions{

        var defaultOptions: Config.VisualizationOptions = {
                transitionOnReload: true,
                fields: {},                
                gauge: {},
            },         
            options = null;

        options = deepExtend({}, defaultOptions, gaugeOptions);
        this._loadsMinMaxFromResult = _.isString(options.gauge.min + options.gauge.max);

        if (this._loadsMinMaxFromResult){
            this._minSelectName = _.isString(options.gauge.min) ? options.gauge.min : null;
            this._maxSelectName = _.isString(options.gauge.max) ? options.gauge.max : null;
        }

        return options;
    }

    public displayData(resultsPromise: Q.IPromise<Api.QueryResults>, reRender: boolean = true): void {        
        resultsPromise = resultsPromise.then((results) => {
            var resultsCopy = results.clone();
            return this._loadMinMax(resultsCopy);
        });

        this._renderGauge();
        this._resultHandler.handleResult(resultsPromise, this, this._loadData, reRender);
    }

    private _loadMinMax(results: Api.QueryResults){
        var resultItems = results.results,
            internalGaugeConfig = (<any>this._gauge).internal.config,
            setMinProperty = this._minSelectName && resultItems.length,
            setMaxProperty = this._maxSelectName && resultItems.length,
            showLabelConfigProperty = 'gauge_label_show',
            minConfigProperty = 'gauge_min',
            resultItems = results.results,
            maxConfigProperty = 'gauge_max';

        if (setMinProperty){
            internalGaugeConfig[minConfigProperty] = resultItems[0][this._minSelectName];
            internalGaugeConfig[showLabelConfigProperty] = true;
            delete resultItems[0][this._minSelectName];
        }

        if (setMaxProperty){
            internalGaugeConfig[maxConfigProperty] = resultItems[0][this._maxSelectName];
            internalGaugeConfig[showLabelConfigProperty] = true;
            delete resultItems[0][this._maxSelectName];
        }

        return results;
    }

    private _loadData(results: Api.QueryResults, reRender: boolean): void {
        var options = this._options,
            internalGaugeConfig = (<any>this._gauge).internal.config,
            metadata = results.metadata,
            selects = results.selects(),
            select = _.first(selects),
            typeOptions = options.gauge,
            resultItems = results.results,
            dataset = this._buildDataset(results),
            keys = dataset.getLabels(),
            uniqueKeys = _.unique(keys),
            colors = Palette.getSwatch(uniqueKeys, options.gauge.color ? [options.gauge.color] : null),
            transitionDuration = !options.transitionOnReload && reRender ? this._transitionDuration.none : this._transitionDuration.some;
            
        if (!this._checkMetaDataIsApplicable(metadata, selects)){
            this._renderQueryNotApplicable();
            return;
        } 

        internalGaugeConfig.transition_duration = transitionDuration;

        if ((options.fields[select] || Config.defaulField).valueFormatter){
            internalGaugeConfig.gauge_label_format = options.fields[select].valueFormatter;
        }

        this._currentDataset = dataset;
        this._gauge.load({
            json: dataset.getData(),
            keys: {
                x: '_x',
                value: keys
            },
            colors: colors
        });
    }

    public clear(): void{        
        this._rendered = false;
        Dom.removeAllChildren(this.targetElement)
    }    

    private _checkMetaDataIsApplicable(metadata: Api.Metadata, selects: string[]): boolean {
        var exactlyOneSelect = selects.length === 1,
            noGroupBys = metadata.groups.length === 0,
            noInterval = metadata.interval == null;

        return exactlyOneSelect && noGroupBys && noInterval;
    }

    private _buildDataset(results: Api.QueryResults): Dataset.ChartDataset{
        var options = this._options,
            formatters = {        
                selectLabelFormatter: select => (options.fields[select] || Config.defaulField).label || select,
                groupValueFormatter: (groupByName, groupValue) => this._formatGroupValue(groupByName, groupValue)
            };

        return new Dataset.ChartDataset(results, formatters); 
    }

    private _formatValueForLabel(label: string, value: any){ 
        var dataset = this._currentDataset,
            select = this._currentDataset.getSelect(label),
            options = this._options,
            defaultFormatter = Config.defaultC3GaugeOptions.gauge.label.format,
            fieldOption = options.fields[select] || Config.defaulField,
            valueFormatter = fieldOption.valueFormatter || defaultFormatter;

        if (valueFormatter){
            return valueFormatter(value);
        }
        
        return value;
    }

    private _formatGroupValue(groupByName: string, groupValue: any){
        var fieldOption = this._options.fields[groupByName] || Config.defaulField,
            valueFormatter = fieldOption.valueFormatter;

        if (valueFormatter){
            return valueFormatter(groupValue);
        }

        return groupValue;
    }

    private _renderGauge() {
        if(this._rendered)
            return;
            
        var options = this._options,
            connectGaugeContainer = Dom.createElement('div', Classes.viz, Classes.gauge),
            c3Element = Dom.createElement('div', Classes.result),
            rootElement = this.targetElement,
            titleElement = Dom.createTitle(options.title),
            dateFormat = null,
            tooltipValueFormatter = (value, ratio, id, index) => this._formatValueForLabel(id, value),
            defaultC3GaugeOptions = this._loadsMinMaxFromResult ? Config.defaultC3MinMaxFromResultsGaugeOptions : Config.defaultC3GaugeOptions,
            config = {
                padding: options.gauge.padding,
                data: {
                    json: [],
                    type: 'gauge'
                },
                transition: {
                    duration: this._transitionDuration.none
                },
                tooltip: {
                    format: {
                        value: tooltipValueFormatter
                    }                   
                },
                gauge: {
                    min: !this._minSelectName ? options.gauge.min : undefined,
                    max: !this._maxSelectName ? options.gauge.max : undefined
                }
            };

        this.clear();
        connectGaugeContainer.appendChild(titleElement);
        connectGaugeContainer.appendChild(c3Element);
        rootElement.appendChild(connectGaugeContainer);
        config = deepExtend({}, defaultC3GaugeOptions, config);
        config['bindto'] = c3Element;

        this._rendered = true;
        this._titleElement = titleElement;
        this._gauge = c3.generate(config);
    }

    private _renderQueryNotApplicable(){
        this._rendered = false;
        ErrorHandling.displayFriendlyError(this.targetElement, 'unsupportedQuery');
    }
}

export = Gauge;