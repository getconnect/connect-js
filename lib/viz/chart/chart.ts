import Config = require('../config');
import GroupedIntervalDataset = require('./grouped-interval-dataset');
import StandardDataset = require('./standard-dataset');
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
    private _options: Config.ChartOptions;
    private _minSelectName: string;
    private _maxSelectName: string;
    private _chart: C3.Chart;
    private _rendered: boolean;
    private _titleElement: HTMLElement;
    private _currentDataset: Dataset.ChartDataset;
    
    constructor(targetElement: string|HTMLElement, chartOptions: Config.ChartOptions) {     
        this._options = this._parseOptions(chartOptions);
        this.targetElement = Dom.getElement(targetElement);
        this.loader = new Loader(this.targetElement);
    }

    private _parseOptions(chartOptions: Config.ChartOptions): Config.ChartOptions{
        var defaultOptions: Config.ChartOptions = {
                type: 'bar',
                intervalOptions: {},
                fieldOptions: {},
                showLegend: true,
                yAxisValueFormatter: (value) => value
            },
            defaultIntervalOptions = {
                formats: Config.defaultTimeSeriesFormats
            },
            defaultC3Options = Config.defaultC3Options,
            type = chartOptions.type,
            options = null,
            loadsMinMaxFromResult = null,
            minMaxFromResultsOptions = _.extend(Config.defaultC3Options.minMaxFromResults, defaultC3Options[type]);

        options = _.extend(defaultOptions, chartOptions);
        options.intervalOptions = _.extend(options.intervalOptions, defaultIntervalOptions);
        loadsMinMaxFromResult = options[options.type] && _.isString(options[options.type].min + options[options.type].max);

        if (loadsMinMaxFromResult){
            this._minSelectName = _.isString(options[options.type].min) ? options[options.type].min : null;
            this._maxSelectName = _.isString(options[options.type].max) ? options[options.type].max : null;
            options[type] = _.extend(options[type] || {}, minMaxFromResultsOptions);
        }else{
            options[type] = _.extend(options[type] || {}, defaultC3Options[type]);
        }

        return options;

    }

    private _initializeFieldOptions(metadata: Queries.Metadata): void{
        var fields = metadata.selects.concat(metadata.groups),
            firstSelect = metadata.selects[0],
            options = this._options,
            fieldOptions = options.fieldOptions,
            type = options.type,
            isSingleArc = fields.length == 1 &&
                          options[type].label &&
                          options[type].label.format;

        _.each(fields, (fieldName) => {
            fieldOptions[fieldName] = fieldOptions[fieldName] || {}
        });

        if (isSingleArc){
            options[type].label = _.clone(options[type].label);
            fieldOptions[firstSelect].valueFormatter = fieldOptions[firstSelect].valueFormatter || options[type].label.format;
            options[type].label.format = fieldOptions[firstSelect].valueFormatter;
        }
    }

    public displayData(resultsPromise: Q.IPromise<Api.QueryResults>, metadata: Queries.Metadata, showLoader: boolean = true): void {        
        var parsedMetaData = this._parseMetaData(metadata);

        this._initializeFieldOptions(parsedMetaData);
        this._renderChart(parsedMetaData);
        ResultHandling.handleResult(resultsPromise, parsedMetaData, this, this._loadData, showLoader);
    }

    private _parseMetaData(metadata: Queries.Metadata){
        var options = this._options,
            type = options.type,
            typeOptions = options[type],
            parsedMetaData = _.clone(metadata),
            filteredSelected = _.without(metadata.selects, this._minSelectName, this._maxSelectName);

        parsedMetaData.selects = filteredSelected;

        return parsedMetaData;
    }

    private _loadData(results: Api.QueryResults, metadata: Queries.Metadata): void {
        var options = this._options,
            type = options.type,
            typeOptions = options[type],
            dataset = this._buildDataset(results, metadata),
            keys = dataset.getLabels(),
            uniqueKeys = _.unique(keys),
            colors = Palette.getSwatch(uniqueKeys, options.colors),
            setMinProperty = this._minSelectName && results.length,
            setMaxProperty = this._maxSelectName && results.length,
            minConfigProperty = type + '_min',
            maxConfigProperty = type + '_max',
            showLabelConfigProperty = type + '_label_show',
            internalChartConfig = (<any>this._chart).internal.config;


        if (setMinProperty){
            internalChartConfig[minConfigProperty] = results[0][this._minSelectName];
            internalChartConfig[showLabelConfigProperty] = true;
        }

        if (setMaxProperty){
            internalChartConfig[maxConfigProperty] = results[0][this._maxSelectName];
            internalChartConfig[showLabelConfigProperty] = true;
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
        this._showTitle();
        internalChartConfig.transition_duration = 300;
    }

    public clear(): void{        
        this._rendered = false;
        Dom.removeAllChildren(this.targetElement)
    }

    private _buildDataset(results: Api.QueryResults, metadata: Queries.Metadata): Dataset.ChartDataset{
        var options = this._options,
            formatters = {        
                selectLabelFormatter: select => options.fieldOptions[select] && options.fieldOptions[select].label ? options.fieldOptions[select].label : select,
                groupValueFormatter: (groupByName, groupValue) => this._formatGroupValue(groupByName, groupValue)
            },
            isGroupedInterval = metadata.interval && metadata.groups.length;

            return isGroupedInterval ? new GroupedIntervalDataset(results, metadata, formatters)
                                     : new StandardDataset(results, metadata, formatters);

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
            fieldOption = options.fieldOptions[select],
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
            rootElement = this.targetElement,
            titleElement = document.createElement('span'),
            timezone = options.timezone || metadata.timezone,
            dateFormat = null,
            standardDateformatter = (value) => Formatters.formatDate(value, timezone, dateFormat),
            customDateFormatter = options.intervalOptions.valueFormatter,
            tooltipValueFormatter = (value, ratio, id, index) => this._formatValueForLabel(id, value),
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
                },
                legend: {
                    show: options.showLegend
                }
            };

        this.clear();
        titleElement.className = 'connect-viz-title';
        c3Element.className = 'connect-viz-result'
        connectChartContainer.className = 'connect-viz connect-chart connect-chart-' + options.type;
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