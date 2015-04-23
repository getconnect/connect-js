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
import c3 = require('c3');
import Classes = require('../css-classes');

if(!c3) { 
    throw "c3 has not been loaded."; 
}

class Chart implements Common.Visualization {
    public targetElement: HTMLElement;
    public loader: Loader;
    private _options: Config.VisualizationOptions;
    private _chart: C3.Chart;
    private _rendered: boolean;
    private _titleElement: HTMLElement;
    private _currentDataset: Dataset.ChartDataset;
    private _transitionDuration;
    private _resultHandler: ResultHandling.ResultHandler;
    
    constructor(targetElement: string|HTMLElement, chartOptions: Config.VisualizationOptions) {     
        this._options = this._parseOptions(chartOptions);
        this.targetElement = Dom.getElement(targetElement);
        this.loader = new Loader(this.targetElement);
        this._transitionDuration = {
            none: null,
            some: 300
        }
        this._resultHandler = new ResultHandling.ResultHandler();
    }

    private _parseOptions(chartOptions: Config.VisualizationOptions): Config.VisualizationOptions{

        var defaultOptions: Config.VisualizationOptions = {
                transitionOnReload: true,
                intervals: {},
                fields: {},
                chart: {
                    type: 'bar',
                    yAxisValueFormatter: (value) => value
                },
            },
            defaultIntervalOptions = {
                formats: Config.defaultTimeSeriesFormats
            },
            defaultC3Options = Config.defaultC3Options,
            options = null,
            options = _.extend(defaultOptions, chartOptions),
            type = options.chart.type;
        options.intervals = _.extend(options.intervals, defaultIntervalOptions);

        options[type] = _.extend(options[type] || {}, defaultC3Options[type]);

        return options;

    }

    public displayData(resultsPromise: Q.IPromise<Api.QueryResults>, reRender: boolean = true): void {
        this._renderChart();
        this._resultHandler.handleResult(resultsPromise, this, this._loadData, reRender);
    }

    private getDefaultLegendVisibility(results: Api.QueryResults): boolean {
        var metadata = results.metadata,
            selects = results.selects(),
            hasMultipleSelects = selects.length > 1,
            isGroupedInterval = (metadata.groups.length > 0 && metadata.interval != null);

        return hasMultipleSelects || isGroupedInterval;
    }

    private _loadData(results: Api.QueryResults, reRender: boolean): void {
        var options = this._options,
            type = options.chart.type,
            resultItems = results.results,
            typeOptions = options[type],
            dataset = this._buildDataset(results),
            keys = dataset.getLabels(),
            uniqueKeys = _.unique(keys),
            metadata = results.metadata,
            dateFormat = null,
            standardDateformatter = null,
            customDateFormatter = null,
            timezone = options.timezone || metadata.timezone,
            colors = Palette.getSwatch(uniqueKeys, options.chart.colors),
            internalChartConfig = (<any>this._chart).internal.config,
            useTransition = this._chart.data().length && (options.transitionOnReload || !reRender),
            transitionDuration = useTransition ? this._transitionDuration.some : this._transitionDuration.none,
            showLegend = options.chart.showLegend != null ? options.chart.showLegend : this.getDefaultLegendVisibility(results);
 
        internalChartConfig.transition_duration = transitionDuration;
        internalChartConfig.legend_show = showLegend;

        if(metadata.interval) {
            dateFormat = options.intervals.formats[metadata.interval];
            standardDateformatter = (value) => Formatters.formatDate(value, timezone, dateFormat);
            customDateFormatter = options.intervals.valueFormatter;
            internalChartConfig.axis_x_tick_format = customDateFormatter || standardDateformatter;
            internalChartConfig.axis_x_type = 'timeseries';
        }
     
        this._currentDataset = dataset;
        this._chart.load({
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
            fieldOption = options.fields[select] || Config.defaulField,
            valueFormatter = fieldOption.valueFormatter;

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

    private _renderChart() {
        if(this._rendered)
            return;
            
        var options = this._options,
            connectChartContainer = Dom.createElement('div', Classes.viz, Classes.chart),
            c3Element = Dom.createElement('div', Classes.result),
            rootElement = this.targetElement,
            titleElement = Dom.createTitle(options.title),
            tooltipValueFormatter = (value, ratio, id, index) => this._formatValueForLabel(id, value),
            config = {
                bindto: c3Element,
                size: {
                    height: options.chart.height
                },
                padding: options.chart.padding,
                data: {
                    json: [],
                    type: options.chart.type
                },
                axis: {
                    x: {   
                        type: 'category',
                        tick: {
                            outer: false,
                            format: undefined
                        }
                    },
                    y:{
                        tick: {
                            outer: false,
                            format: options.chart.yAxisValueFormatter
                        }
                    }
                },
                transition: {
                    duration: this._transitionDuration.none
                },
                tooltip: {
                    format: {
                        value: tooltipValueFormatter
                    }                   
                }
            };

        this.clear();
        connectChartContainer.appendChild(titleElement);
        connectChartContainer.appendChild(c3Element);
        rootElement.appendChild(connectChartContainer);
        config[options.chart.type] = options[options.chart.type];

        this._rendered = true;
        this._titleElement = titleElement;
        this._chart = c3.generate(config);
    }
}

export = Chart;