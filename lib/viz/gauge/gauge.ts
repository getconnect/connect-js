import Config = require('../config');
import Dataset = require('../chart/dataset');
import Queries = require('../../core/queries/queries');
import Api = require('../../core/api');
import _ = require('underscore');
import Common = require('../visualization');
import ErrorHandling = require('../error-handling');
import Palette = require('../palette');
import Loader = require('../loader');
import Formatters = require('../formatters');
import Dom = require('../dom');
import c3 = require('../c3');
import Classes = require('../css-classes');
import deepExtend = require('deep-extend');

class Gauge implements Common.Visualization {
    private _minSelectName: string;
    private _maxSelectName: string;
    private _gauge: C3.Chart;
    private _currentDataset: Dataset.ChartDataset;
    private _transitionDuration;
    private _loadsMinMaxFromResult: boolean;
    
    constructor() {     
        this._transitionDuration = {
            none: null,
            some: 300
        }
    }

    public init(container: HTMLElement, options: Config.VisualizationOptions) {         
        var dateFormat = null,
            colors = Palette.getSwatch(options.gauge.color ? [options.gauge.color] : null),
            tooltipValueFormatter = (value, ratio, id, index) => this._formatValueForLabel(id, value, options),
            defaultC3GaugeOptions = this._loadsMinMaxFromResult ? Config.defaultC3MinMaxFromResultsGaugeOptions : Config.defaultC3GaugeOptions,
            config = {
                size: {
                    height: options.gauge.height,
                    width: options.gauge.width
                },
                padding: options.gauge.padding,
                data: {
                    json: [],
                    type: 'gauge'
                },
                color: {
                    pattern: colors
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

        config = deepExtend({}, defaultC3GaugeOptions, config);
        config['bindto'] = container;
        
        this._initMinMaxFromResult(options);
        
        this._gauge = c3.generate(config);
    }

    public render(container: HTMLElement, results: Api.QueryResults, options: Config.VisualizationOptions, hasQueryChanged: boolean) {
        var internalGaugeConfig = (<any>this._gauge).internal.config,
            metadata = results.metadata,
            selects = results.selects(),
            select = _.first(selects),
            typeOptions = options.gauge,
            resultItems = results.results,
            dataset = this._buildDataset(results, options),
            keys = dataset.getLabels(),
            transitionDuration = !options.transitionOnReload && hasQueryChanged ? this._transitionDuration.none : this._transitionDuration.some;

        internalGaugeConfig.transition_duration = transitionDuration;

        if ((options.fields[select] || Config.defaulField).valueFormatter) {
            internalGaugeConfig.gauge_label_format = options.fields[select].valueFormatter;
        }

        this._currentDataset = dataset;
        this._gauge.load({
            json: dataset.getData(),
            keys: {
                x: '_x',
                value: keys
            }
        });
    }
    
    public redraw() {
        this._gauge.flush();
    }

    public destroy() {
        this._gauge.destroy();
    }

    public defaultOptions() {
        var defaultOptions: Config.VisualizationOptions = {
            transitionOnReload: true,
            fields: {},                
            gauge: {},
        };
        return defaultOptions;
    }

    public modifyResults(resultsPromise: Q.IPromise<Api.QueryResults>): Q.IPromise<Api.QueryResults> {
        return resultsPromise.then((results) => {
            var resultsCopy = results.clone();
            return this._loadMinMax(resultsCopy);
        });
    }

    public isSupported(metadata: Api.Metadata, selects: string[]): boolean {
        var exactlyOneSelect = selects.length === 1,
            noGroupBys = metadata.groups.length === 0,
            noInterval = metadata.interval == null;

        return exactlyOneSelect && noGroupBys && noInterval;
    }
    
    public cssClasses(options: Config.VisualizationOptions) {
        return [Classes.gauge];
    }
    
    private _initMinMaxFromResult(options: Config.VisualizationOptions) {
        var optionsMin = options.gauge.min,
            optionsMax = options.gauge.max;
        
        this._minSelectName = typeof optionsMin === 'string' ? optionsMin : null;
        this._maxSelectName = typeof optionsMax === 'string' ? optionsMax : null;
        
        this._loadsMinMaxFromResult = typeof optionsMin === 'string' || typeof optionsMax === 'string';
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

        if (setMinProperty) {
            internalGaugeConfig[minConfigProperty] = resultItems[0][this._minSelectName];
            internalGaugeConfig[showLabelConfigProperty] = true;
            delete resultItems[0][this._minSelectName];
        }

        if (setMaxProperty) {
            internalGaugeConfig[maxConfigProperty] = resultItems[0][this._maxSelectName];
            internalGaugeConfig[showLabelConfigProperty] = true;
            delete resultItems[0][this._maxSelectName];
        }

        return results;
    }

    private _buildDataset(results: Api.QueryResults, options: Config.VisualizationOptions): Dataset.ChartDataset{
        var formatters = {        
            selectLabelFormatter: select => (options.fields[select] || Config.defaulField).label || select,
            groupValueFormatter: (groupByName, groupValue) => this._formatGroupValue(groupByName, groupValue, options)
        };

        return new Dataset.ChartDataset(results, formatters); 
    }

    private _formatValueForLabel(label: string, value: any, options: Config.VisualizationOptions){ 
        var dataset = this._currentDataset,
            select = this._currentDataset.getSelect(label),
            defaultFormatter = Config.defaultC3GaugeOptions.gauge.label.format,
            fieldOption = options.fields[select] || Config.defaulField,
            valueFormatter = fieldOption.valueFormatter || defaultFormatter;

        if (valueFormatter) {
            return valueFormatter(value);
        }
        
        return value;
    }

    private _formatGroupValue(groupByName: string, groupValue: any, options: Config.VisualizationOptions){
        var fieldOption = options.fields[groupByName] || Config.defaulField,
            valueFormatter = fieldOption.valueFormatter;

        if (valueFormatter) {
            return valueFormatter(groupValue);
        }

        return groupValue;
    }
}

export = Gauge;