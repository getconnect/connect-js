import Config = require('../config');
import Dataset = require('./dataset');
import Queries = require('../../core/queries/queries');
import Api = require('../../core/api');
import _ = require('underscore');
import Common = require('../visualization');
import Clear = require('../clear');
import ErrorHandling = require('../error-handling');
import Palette = require('../palette');
import Loader = require('../loader');
import Formatters = require('../formatters');

class Chart implements Common.Visualization {
    public targetElementId: string;
    private _options: Config.ChartOptions;
    private _chart: C3.Chart;
    private _rendered: boolean;
    private _titleElement: HTMLElement;
    private _loader: Loader;
    private _currentDataset: Dataset;
    
    constructor(targetElementId: string, chartOptions: Config.ChartOptions) {     
        this._options = this._parseOptions(chartOptions);
        this.targetElementId = targetElementId;
        this._loadData = ErrorHandling.makeSafe(this._loadData, this);
        this._loader = new Loader(this.targetElementId);
    }

    private _parseOptions(chartOptions: Config.ChartOptions): Config.ChartOptions{
        var defaultOptions: Config.ChartOptions = {
                type: 'bar',
                intervalOptions: {},
                fieldOptions: {},
                yAxisValueFormatter: (value) => value
            },
            defaultIntervalOptions = {
                formats: Config.defaultTimeSeriesFormats
            },
            defaultC3Options = Config.defaultC3Options,
            type = chartOptions.type,
            options = null;

        options = _.extend(defaultOptions, chartOptions);
        options.intervalOptions = _.extend(options.intervalOptions, defaultIntervalOptions);
        options[type] = _.extend(options[type] || {}, defaultC3Options[type]);

        return options;

    }

    private _initializeFieldOptions(metadata: Queries.Metadata): void{
        var fields = metadata.selects.concat(metadata.groups),
            firstSelect = metadata.selects[0],
            options = this._options,
            fieldOptions = options.fieldOptions,
            type = options.type;

        _.each(fields, (fieldName) => {
            fieldOptions[fieldName] = fieldOptions[fieldName] || {}
        });

        if (type === 'gauge'){
            fieldOptions[firstSelect].valueFormatter = fieldOptions[firstSelect].valueFormatter || options[type].label.format;
            options[type].label.format = fieldOptions[firstSelect].valueFormatter;
        }
    }

    public displayData(resultsPromise: Q.IPromise<Api.QueryResults>, metadata: Queries.Metadata): void {        

        this._initializeFieldOptions(metadata);
        this._renderChart(metadata);
        this._loader.show();

        resultsPromise.then(results => {
            this._loadData(results, metadata);
        });
    }

    private _loadData(results: Api.QueryResults, metadata: Queries.Metadata): void {
        var options = this._options,
            selectLabelFormatter = (select) => options.fieldOptions[select].label || select,
            groupValueFormatter = (groupByName, groupValue) => this._formatGroupValue(groupByName, groupValue),
            dataset = new Dataset(results, metadata, selectLabelFormatter, groupValueFormatter),
            keys = dataset.getKeys(),
            uniqueKeys = _.unique(keys),
            colors = _.extend(_.object(uniqueKeys, Palette.defaultSwatch), options.colors);

        this._currentDataset = dataset;
        this._loader.hide();    
        this._chart.load({
            json: dataset.data,
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
        Clear.removeAllChildren(this.targetElementId)
    }

    private _showTitle(){
        var options = this._options,
            titleText = options.title ? options.title.toString() : '',
            showTitle = titleText.length > 0;

        this._titleElement.textContent = titleText;
        this._titleElement.style.display = !showTitle ? 'none' : '';      
    }

    private _formatValueForKey(key: string, value: any){ 
        var dataset = this._currentDataset,
            fieldName = this._currentDataset.getFieldNameForKey(key),
            options = this._options,
            fieldOption = options.fieldOptions[fieldName],
            valueFormatter = fieldOption.valueFormatter;

        if (valueFormatter){
            return valueFormatter(value);
        }
        
        return value;
    }

    private _formatGroupValue(groupByName: string, groupValue: any){
        var fieldOption = this._options.fieldOptions[groupByName],
            valueFormatter = fieldOption.valueFormatter;

        if (valueFormatter){
            return valueFormatter(groupValue);
        }

        return groupValue;
    }

    private _renderChart(metadata: Queries.Metadata) {
        if(this._rendered)
            return;
            
        var options = this._options,
            connectChartContainer: HTMLElement = document.createElement('div'),
            c3Element: HTMLElement = document.createElement('div'),
            rootElement = document.querySelector(this.targetElementId),
            titleElement = document.createElement('span'),
            timezone = options.timezone || metadata.timezone,
            dateFormat = null,
            standardDateformatter = (value) => Formatters.formatDate(value, timezone, dateFormat),
            customDateFormatter = options.intervalOptions.valueFormatter,
            tooltipValueFormatter = (value, ratio, id, index) => this._formatValueForKey(id, value),
            config = {
                bindto: c3Element,
                size: {
                    height: options.height
                },
                padding: options.padding,
                data: {
                    json: [],
                    type: options.type
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
                            format: options.yAxisValueFormatter
                        }
                    }
                },
                transition: {
                    duration: null
                },
                tooltip: {
                    format: {
                        value: tooltipValueFormatter
                    }                   
                }
            };

        this.clear();
        titleElement.className = 'connect-viz-title';
        connectChartContainer.className = 'connect-viz connect-chart';
        connectChartContainer.appendChild(titleElement);
        connectChartContainer.appendChild(c3Element);
        rootElement.appendChild(connectChartContainer);

        config[options.type] = options[options.type];
        if(metadata.interval) {
            dateFormat = options.intervalOptions.formats[metadata.interval];
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