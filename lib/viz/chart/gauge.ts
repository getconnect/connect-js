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
import c3 = require('../c3');
import Classes = require('../css-classes');
import deepExtend = require('deep-extend');

class Gauge implements Common.Visualization {
    private _options: Config.VisualizationOptions;
    private _minSelectName: string;
    private _maxSelectName: string;
    private _gauge: C3.Chart;
    private _currentDataset: Dataset.ChartDataset;
    private _transitionDuration;
    private _loadsMinMaxFromResult: boolean;
    
    constructor(gaugeOptions: Config.VisualizationOptions) {     
        this._options = this._parseOptions(gaugeOptions);
        this._transitionDuration = {
            none: null,
            some: 300
        }
    }

    public renderDom(vizElement: HTMLElement, resultsElement: HTMLElement){            
        var options = this._options,
            dateFormat = null,
            colors = Palette.getSwatch(options.gauge.color ? [options.gauge.color] : null),
            tooltipValueFormatter = (value, ratio, id, index) => this._formatValueForLabel(id, value),
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
        config['bindto'] = resultsElement;
        
        vizElement.classList.add(Classes.gauge);
        this._gauge = c3.generate(config);
    }

    public displayResults(results: Api.QueryResults, isQueryUpdate: boolean): void {
        var options = this._options,
            internalGaugeConfig = (<any>this._gauge).internal.config,
            metadata = results.metadata,
            selects = results.selects(),
            select = _.first(selects),
            typeOptions = options.gauge,
            resultItems = results.results,
            dataset = this._buildDataset(results),
            keys = dataset.getLabels(),
            transitionDuration = !options.transitionOnReload && isQueryUpdate ? this._transitionDuration.none : this._transitionDuration.some;

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
            }
        });
    }

    public modifyResults(resultsPromise: Q.IPromise<Api.QueryResults>): Q.IPromise<Api.QueryResults>{
        return resultsPromise.then((results) => {
            var resultsCopy = results.clone();
            return this._loadMinMax(resultsCopy);
        });
    }

    public isResultSetSupported(metadata: Api.Metadata, selects: string[]): boolean {
        var exactlyOneSelect = selects.length === 1,
            noGroupBys = metadata.groups.length === 0,
            noInterval = metadata.interval == null;

        return exactlyOneSelect && noGroupBys && noInterval;
    }

    public recalculateSize(): void {
        this._gauge.flush();
    }

    public destroy(): void {
        this._gauge.destroy();
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
}

export = Gauge;