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

class Chart implements Common.Visualization {
    public targetElement: HTMLElement;
    public loader: Loader;
    private _options: Config.VisualizationOptions;
    private _chart: C3.Chart;
    private _rendered: boolean;
    private _titleElement: HTMLElement;
    private _currentDataset: Dataset.ChartDataset;
    private _duration;
    private _resultHandler: ResultHandling.ResultHandler;
    
    constructor(targetElement: string|HTMLElement, chartOptions: Config.VisualizationOptions) {     
        this._options = this._parseOptions(chartOptions);
        this.targetElement = Dom.getElement(targetElement);
        this.loader = new Loader(this.targetElement);
        this._duration = {
            fullReload: null,
            update: 300
        }
        this._resultHandler = new ResultHandling.ResultHandler();
    }

    private _parseOptions(chartOptions: Config.VisualizationOptions): Config.VisualizationOptions{

        var defaultOptions: Config.VisualizationOptions = {
                intervals: {},
                fields: {},
                chart: {
                    type: 'bar',
                    showLegend: true,
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

    public displayData(resultsPromise: Q.IPromise<Api.QueryResults>, fullReload: boolean = true): void {
        this._renderChart();
        this._resultHandler.handleResult(resultsPromise, this, this._loadData, fullReload);
    }

    private _loadData(results: Api.QueryResults, fullReload: boolean): void {
        var options = this._options,
            type = options.chart.type,
            resultItems = results.results,
            typeOptions = options[type],
            dataset = this._buildDataset(results),
            keys = dataset.getLabels(),
            uniqueKeys = _.unique(keys),
            colors = Palette.getSwatch(uniqueKeys, options.chart.colors),
            internalChartConfig = (<any>this._chart).internal.config,
            transitionDuration = fullReload ? this._duration.fullReload : this._duration.update;
            
        internalChartConfig.transition_duration = transitionDuration;
     
        this._currentDataset = dataset;
        this._chart.load({
            json: dataset.getData(),
            keys: {
                x: '_x',
                value: keys
            },
            colors: colors
        });
        this._showTitle();
    }

    public clear(): void{        
        this._rendered = false;
        Dom.removeAllChildren(this.targetElement)
    }

    private _buildDataset(results: Api.QueryResults): Dataset.ChartDataset{
        var options = this._options,
            formatters = {        
                selectLabelFormatter: select => (options.fields[select] || {}).label || select,
                groupValueFormatter: (groupByName, groupValue) => this._formatGroupValue(groupByName, groupValue)
            };

        return new Dataset.ChartDataset(results, formatters);
    }

    private _showTitle(){
        var options = this._options,
            titleText = options.title ? options.title.toString() : '',
            showTitle = titleText.length > 0;

        this._titleElement.textContent = titleText;
        this._titleElement.style.display = !showTitle ? 'none' : '';      
    }

    private _formatValueForLabel(label: string, value: any){ 
        var dataset = this._currentDataset,
            select = this._currentDataset.getSelect(label),
            options = this._options,
            fieldOption = options.fields[select] || {},
            valueFormatter = fieldOption.valueFormatter;

        if (valueFormatter){
            return valueFormatter(value);
        }
        
        return value;
    }

    private _formatGroupValue(groupByName: string, groupValue: any){
        var fieldOption = this._options.fields[groupByName] || {},
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
            connectChartContainer: HTMLElement = document.createElement('div'),
            c3Element: HTMLElement = document.createElement('div'),
            rootElement = this.targetElement,
            titleElement = document.createElement('span'),
            timezone = options.timezone || metadata.timezone,
            dateFormat = null,
            standardDateformatter = (value) => Formatters.formatDate(value, timezone, dateFormat),
            customDateFormatter = options.intervals.valueFormatter,
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
                    duration: this._duration.fullReload
                },
                tooltip: {
                    format: {
                        value: tooltipValueFormatter
                    }                   
                },
                legend: {
                    show: options.chart.showLegend
                }
            };

        this.clear();
        titleElement.className = 'connect-viz-title';
        c3Element.className = 'connect-viz-result'
        connectChartContainer.className = 'connect-viz connect-chart connect-chart-' + options.chart.type;
        connectChartContainer.appendChild(titleElement);
        connectChartContainer.appendChild(c3Element);
        rootElement.appendChild(connectChartContainer);
        config[options.chart.type] = options[options.chart.type];

        if(metadata.interval) {
            dateFormat = options.intervals.formats[metadata.interval];
            config.data['xFormat'] = '%Y-%m-%dT%H:%M:%SZ';
            config.data['xLocaltime'] = false;
            config.axis.x.type = 'timeseries';
            config.axis.x.tick.format = customDateFormatter || standardDateformatter;
        }
        this._rendered = true;
        this._titleElement = titleElement;
        this._showTitle();        
        this._chart = c3.generate(config);
    }
}

export = Chart;