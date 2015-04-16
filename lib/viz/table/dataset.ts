import _ = require('underscore');
import Queries = require('../../core/queries/queries');
import Config = require('../config');
import Api = require('../../core/api');
import Formatters = require('../formatters');

export interface Cell {
    isNumeric?: boolean;
    isGrouped?: boolean;
    isInterval?: boolean;
}

export interface HeaderCell extends Cell {
    title: String;
}
export type HeaderRow = HeaderCell[];

export interface ContentCell extends Cell {
    rawValue: String | Number | Api.QueryResultInterval;
    displayedValue: String;
}
export type ContentRow = ContentCell[];
type RowBuilder = (result: Api.QueryResultItem) => ContentRow;

export class TableDataset {
    public headerRow: HeaderRow;
    public contentRows: ContentRow[];

    constructor(results: Api.QueryResults, options: Config.VisualizationOptions) {
        this.headerRow = this._buildHeaderRow(results, options);
        this.contentRows = this._buildContentRows(results, options);
    }

    private _buildHeaderRow(results: Api.QueryResults, options: Config.VisualizationOptions) {
        var isColoumnNumeric = (key: string): boolean => {
            if (metadata.interval) {
                var firstIntervalWithDesiredCol = _(results).find((interval) => { 
                    return _.isObject(_(interval.results).find(result => result[key]));
                });
                var firstRowWithDesiredCol = _(firstIntervalWithDesiredCol.results).find(result => result[key]);
                return _.isNumber(firstRowWithDesiredCol[key]);
            }
            var firstRowWithDesiredCol = _(results).find(result => result[key]);
            return _.isNumber(firstRowWithDesiredCol[key]);
        };

        var createHeaderCell = (isGrouped: boolean, key: string): HeaderCell => {
            var optionsForField = options.fields[key];
            return {
                isGrouped: isGrouped,
                title: optionsForField && optionsForField.label ? optionsForField.label : key,
                isNumeric: isColoumnNumeric(key)
            };
        }

        var createGroupedHeaderCell = _.partial(createHeaderCell, true);
        var createSelectHeaderCell = _.partial(createHeaderCell, false);

        var groupHeaderCells = _(metadata.groups).map(key => createGroupedHeaderCell(key));
        var selectHeaderCells = _(metadata.selects).map(key => createSelectHeaderCell(key));

        if (metadata.interval) {
            var intervalHeader: HeaderCell = {
                isGrouped: false,
                title: options.intervals && options.intervals.label ? options.intervals.label : '',
                isNumeric: false,
                isInterval: true
            }
            return _.union([intervalHeader], groupHeaderCells, selectHeaderCells);
        }

        return _.union(groupHeaderCells, selectHeaderCells);
    }

    private _buildContentRows(results: Api.QueryResults, options: Config.VisualizationOptions) {
        var createContentCell = (isGrouped: boolean, result: Api.QueryResultItem, key: string): ContentCell => {
            var optionsForField: Config.FieldOption = options.fields[key];
            var rawValue = result[key];
            var isNumeric = _.isNumber(rawValue);
            var defaultFormatter: Config.FormatValueFunction = isNumeric ? d3.format(',.2f') : value => value;
            var valueFormatter = optionsForField && optionsForField.valueFormatter ? optionsForField.valueFormatter : defaultFormatter;
            return {
                isGrouped: isGrouped,
                rawValue: rawValue,
                displayedValue: valueFormatter(rawValue),
                isNumeric: isNumeric
            };
        };

        var createIntervalCell = (result: Api.QueryResultItem): ContentCell => {
            var serverTimeFormat = d3.time.format('%Y-%m-%dT%H:%M:%SZ');
            var startDate = serverTimeFormat.parse(result.interval.start);
            var endDate = serverTimeFormat.parse(result.interval.end);

            var defaultFormat = (start: Date, end: Date): String => {
                var timeFormat = options.intervals.formats[metadata.interval];
                var timezone = options.timezone || metadata.timezone;
                var startDate = Formatters.formatDate(start, timezone, timeFormat);
                var endDate = Formatters.formatDate(end, timezone, timeFormat)
                return startDate + ' - ' + endDate;
            };

            var intervalFormatter = options.intervals.valueFormatter ? options.intervals.valueFormatter : defaultFormat;

            return {
                isGrouped: false,
                rawValue: result.interval,
                displayedValue: intervalFormatter(startDate, endDate),
                isNumeric: false,
                isInterval: true
            };
        };

        var createGroupedContentCell = _.partial(createContentCell, true);
        var createSelectContentCell = _.partial(createContentCell, false);

        var createRow = (rowResult: Api.QueryResultItem, intervalCell?: ContentCell): ContentRow  => {
            var groupedContentCells = _(metadata.groups).map(key => createGroupedContentCell(rowResult, key));
            var selectContentCells = _(metadata.selects).map(key => createSelectContentCell(rowResult, key));

            if (intervalCell) {
                return _.union([intervalCell], groupedContentCells, selectContentCells);
            }

            return _.union(groupedContentCells, selectContentCells);
        };

        if (metadata.interval) {
            return _(results).reduce((memo, intervalRow) => {
                var intervalCell = createIntervalCell(intervalRow);
                var createIntervalRow = <RowBuilder>_.partial(createRow, _, intervalCell);
                return _.union(memo, _(intervalRow.results).map(createIntervalRow));
            }, []);
        }

        var createContentRow = <RowBuilder>_.partial(createRow, _, null);

        return _(results).map(createContentRow);
    }

}

