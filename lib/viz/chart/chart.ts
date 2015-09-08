import Config = require('../config');
import Dataset = require('./dataset');
import Queries = require('../../core/queries/queries');
import Api = require('../../core/api');
import _ = require('underscore');
import ErrorHandling = require('../error-handling');
import Palette = require('../palette');
import Loader = require('../loader');
import Formatters = require('../formatters');
import c3 = require('../c3');
import Classes = require('../css-classes');
import deepExtend = require('deep-extend');
import Common = require('../visualization');

class Chart implements Common.Visualization {
    private _chart: C3.Chart;
    private _currentDataset: Dataset.ChartDataset;
    private _transitionDuration;
    
    constructor() {
        this._transitionDuration = {
            none: null,
            some: 300
        }
    }

    public init(container: HTMLElement, options: Config.VisualizationOptions) {
        var yAxisOptions = options.chart.yAxis,
            suppliedColors = options.chart.colors,
            colors = Palette.getSwatch(_.isArray(suppliedColors) ? <string[]>suppliedColors : undefined),
            isStartAtZeroSpecified = yAxisOptions.startAtZero != null,
            tooltipValueFormatter = (value, ratio, id, index) => this._formatValueForLabel(id, value, options),
            config = {
                size: {
                    height: options.chart.height,
                    width: options.chart.width
                },
                padding: options.chart.padding,
                data: {
                    json: [],
                    type: options.chart.type,
                    color: (color, datum) => {
                        return this._modifyColor(color, datum, options);
                    }
                },
                color: {
                    pattern: colors
                },
                axis: {
                    x: {   
                        type: 'category',
                        tick: {
                            outer: false,
                            format: undefined
                        }
                    },
                    y: {
                        padding: {
                            bottom: 5
                        },
                        tick: {
                            outer: false,
                            format: yAxisOptions.valueFormatter
                        }
                    }
                },
                bar: {},
                area: {},
                transition: {
                    duration: this._transitionDuration.none
                },
                tooltip: {
                    format: {
                        value: tooltipValueFormatter
                    }                   
                }
            };

        config = deepExtend({}, Config.defaultC3ChartOptions, config);
        config['bindto'] = container;

        if (isStartAtZeroSpecified) {
             config.area['zerobased'] = yAxisOptions.startAtZero;
             config.bar['zerobased'] = yAxisOptions.startAtZero;
        }

        this._chart = c3.generate(config);
    }
    
    public render(container: HTMLElement, results: Api.QueryResults, options: Config.VisualizationOptions, hasQueryChanged: boolean) {
        var type = options.chart.type,
            resultItems = results.results,
            typeOptions = options[type],
            dataset = this._buildDataset(results, options),
            data = dataset.getData(),
            keys = dataset.getLabels(),
            metadata = results.metadata,
            dateFormat = null,
            standardDateformatter = null,
            customDateFormatter = null,
            timezone = options.timezone || metadata.timezone,
            internalChartConfig = (<any>this._chart).internal.config,
            useTransition = this._chart.data().length && (options.transitionOnReload || !hasQueryChanged),
            transitionDuration = useTransition ? this._transitionDuration.some : this._transitionDuration.none,
            showLegend = options.chart.showLegend != null ? options.chart.showLegend : this._getDefaultLegendVisibility(results);
 
        internalChartConfig.transition_duration = transitionDuration;
        internalChartConfig.legend_show = showLegend;

        if (options.chart.stack) {
            this._chart.groups([dataset.getLabels()])
        }

        if (metadata.interval) {
            dateFormat = options.intervals.formats[metadata.interval];
            standardDateformatter = (value) => Formatters.formatDate(value, timezone, dateFormat);
            customDateFormatter = options.intervals.valueFormatter;
            internalChartConfig.axis_x_tick_format = customDateFormatter || standardDateformatter;
            internalChartConfig.axis_x_type = 'timeseries';
        } else {
            internalChartConfig.axis_x_categories = _.pluck(data, '_x')
        }
        
        this._currentDataset = dataset;
        this._chart.load({
            json: data,
            keys: {
                x: '_x',
                value: keys
            }
        });
    }
    
    public redraw(): void {
        this._chart.flush();
    }
    
    public destroy(): void {
        this._chart.destroy();
    }

    public defaultOptions() {
        var defaultFormatter = (value: any) => value,
            defaultOptions: Config.VisualizationOptions = {
                transitionOnReload: true,
                intervals: {
                    formats: Config.defaultTimeSeriesFormats
                },
                fields: {},
                chart: {
                    type: 'bar',
                    yAxis: {
                        valueFormatter: defaultFormatter
                    },
                    tooltip: {
                        valueFormatter: defaultFormatter
                    }
                },                
            };
        return defaultOptions;
    }
    
    public cssClasses(options: Config.VisualizationOptions) {
        return [Classes.chart];
    }

    private _getDefaultLegendVisibility(results: Api.QueryResults): boolean {
        var metadata = results.metadata,
            selects = results.selects(),
            hasMultipleSelects = selects.length > 1,
            isGroupedInterval = (metadata.groups.length > 0 && metadata.interval != null);

        return hasMultipleSelects || isGroupedInterval;
    }
    
    private _buildDataset(results: Api.QueryResults, options: Config.VisualizationOptions): Dataset.ChartDataset {
        var formatters = {        
            selectLabelFormatter: select => (options.fields[select] || Config.defaulField).label || select,
            groupValueFormatter: (groupByName, groupValue) => this._formatGroupValue(groupByName, groupValue, options)
        };

        return new Dataset.ChartDataset(results, formatters);
    }

    private _formatValueForLabel(label: string, value: any, options: Config.VisualizationOptions) { 
        var dataset = this._currentDataset,
            select = this._currentDataset.getSelect(label),
            fieldOption = options.fields[select] || Config.defaulField,
            valueFormatter = fieldOption.valueFormatter;

        if (valueFormatter) {
            return valueFormatter(value);
        }
        
        return value;
    }

    private _formatGroupValue(groupByName: string, groupValue: any, options: Config.VisualizationOptions) {
        var fieldOption = options.fields[groupByName] || Config.defaulField,
            valueFormatter = fieldOption.valueFormatter;

        if (valueFormatter) {
            return valueFormatter(groupValue);
        }

        return groupValue;
    }

    private _modifyColor(currentColor: string, datum: any, options: Config.VisualizationOptions): string {
        var context: Config.ChartDataContext = null,
            modifiedColor: string = null,
            colorModifier = options.chart.colors,
            showLegend = (<any>this._chart).internal.config.legend_show;
      
        if (!showLegend && _.isString(datum)) {
            return currentColor;
        }
        
        if (!colorModifier || !_.isFunction(colorModifier)) {
            return currentColor;
        }

        if (_.isArray(datum.values)) {
            context = this._currentDataset.getContext(_.first(datum.values));
        } else {
            context = this._currentDataset.getContext(datum);
        }
        
        if (context) {
            modifiedColor = (<Config.ColorModifier>colorModifier)(context);
            if (modifiedColor) {
                return modifiedColor;
            }
        }
        return currentColor;
    }
}

export = Chart;