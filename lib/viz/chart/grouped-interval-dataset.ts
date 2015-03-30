import Queries = require('../../core/queries/queries');
import Dataset = require('./dataset');
import Config = require('../config');
import Api = require('../../core/api');
import _ = require('underscore');

class GroupedIntervalDataset implements Dataset.ChartDataset {
    private _metadata: Queries.Metadata;
    private _selectLabelFormatter: (value: string) => string;
    private _groupValueFormatter: (groupByName: string, groupValue: any) => string;

    private _selectLabels: Dataset.SelectLabel[] = [];
    private _data: any = [];

    constructor(results: Api.QueryResults, metadata: Queries.Metadata, formatters: Dataset.Formatters) {
        this._metadata = metadata;
        this._selectLabelFormatter = formatters.selectLabelFormatter;
        this._groupValueFormatter = formatters.groupValueFormatter;

        this._selectLabels = this._mapLabels(results);
        this._data = this._mapData(results);
    }

    public getLabels(): string[]{
        return Dataset.getLabels(this._selectLabels);
    }

    public getSelect(label: string): string{
        return Dataset.getSelect(this._selectLabels, label);
    }

    public getData(): any{
        return this._data;
    }

    private _mapLabels(results: Api.QueryResults): Dataset.SelectLabel[] {  
        return _.chain(results)
            .map(result => result['results'])
            .flatten()
            .map(result => {
                var groupPath = Dataset.getGroupPath(result, this._metadata.groups, this._groupValueFormatter);
                return _.map(this._metadata.selects, select => <Dataset.SelectLabel>{
                    select: select,
                    label: this._generateLabelForResult(result, select, groupPath)
                });
            })
            .flatten()  
            .value();        
    }

    private _mapData(results: Api.QueryResults): any {      
        return _.chain(results)
            .map(result => {
                var start = result.interval.start,
                    mappedResult = this._mapResult(result);
                    mappedResult['_x'] = start;

                return mappedResult;
            })
            .value();
    }

    private _mapResult(result: Api.QueryResultItem): any {        
        return _.reduce<Api.QueryResultItem, any>(result.results, (mappedResult, intervalResult) => {
            var groupPath = Dataset.getGroupPath(intervalResult, this._metadata.groups, this._groupValueFormatter);

            _.each(this._metadata.selects, select => {
                var label = this._generateLabelForResult(mappedResult, select, groupPath);
                mappedResult[label] = intervalResult[select];
            });

            return mappedResult;
        }, {});
    }

    private _generateLabelForResult(result: Api.QueryResultItem, select: string, groupPath: string): string{
        return this._metadata.selects.length > 1 ? groupPath + ' - ' + this._selectLabelFormatter(select) : groupPath;
    }
}

export = GroupedIntervalDataset;