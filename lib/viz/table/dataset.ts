import _ = require('underscore');
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
        var selects = results.selects();

        this.headerRow = this._buildHeaderRow(results.metadata, selects, results.results, options);
        this.contentRows = this._buildContentRows(results.metadata, selects, results.results, options);
    }

    private _buildHeaderRow(metadata: Api.Metadata, selects: string[], results: Api.QueryResultItem[], options: Config.VisualizationOptions) {
        var isColoumnNumeric = (key: string): boolean => {
            if (metadata.interval) {
                var firstIntervalWithDesiredCol = _(results).find((interval) => { 
                    return _.isObject(_(interval.results).find(result => result[key]));
                });
                var firstRowWithDesiredCol = _(firstIntervalWithDesiredCol.results).find(result => result[key]);
                return _.isNumber(firstRowWithDesiredCol[key]);
            }
            var firstRowWithDesiredCol = _(results).find(result => result[key]);
            return firstRowWithDesiredCol != null ? _.isNumber(firstRowWithDesiredCol[key]) : false;
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
        var selectHeaderCells = _(selects).map(key => createSelectHeaderCell(key));

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

    private _buildContentRows(metadata: Api.Metadata, selects: string[], results: Api.QueryResultItem[], options: Config.VisualizationOptions) {
        var createContentCell = (isGrouped: boolean, result: Api.QueryResultItem, key: string): ContentCell => {
            var optionsForField: Config.FieldOption = options.fields[key] || Config.defaultField;
            var rawValue = result[key];
            var isNumeric = _.isNumber(rawValue);
            var defaultFormatter: Config.ValueFormatter = isNumeric ? Formatters.format(',.2f') : value => value;
            var valueFormatter = Formatters.format(optionsForField.format || defaultFormatter);
            return {
                isGrouped: isGrouped,
                rawValue: rawValue,
                displayedValue: valueFormatter(rawValue),
                isNumeric: isNumeric
            };
        };

        var createIntervalCell = (result: Api.QueryResultItem): ContentCell => {
            var startDate = <Date>result.interval.start;
            var endDate = <Date>result.interval.end;
            var timezone = options.timezone || metadata.timezone;
            var valueFormatter = Formatters.formatForInterval(options.intervals.format, metadata.interval, timezone);

            return {
                isGrouped: false,
                rawValue: result.interval,
                displayedValue: valueFormatter(startDate, endDate),
                isNumeric: false,
                isInterval: true
            };
        };

        var createGroupedContentCell = _.partial(createContentCell, true);
        var createSelectContentCell = _.partial(createContentCell, false);

        var createRow = (rowResult: Api.QueryResultItem, intervalCell?: ContentCell): ContentRow  => {
            var groupedContentCells = _(metadata.groups).map(key => createGroupedContentCell(rowResult, key));
            var selectContentCells = _(selects).map(key => createSelectContentCell(rowResult, key));

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

