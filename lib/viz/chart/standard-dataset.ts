import Queries = require('../../core/queries/queries');
import Config = require('../config');
import Api = require('../../core/api');
import Dataset = require('./dataset');
import _ = require('underscore');

class StandardDataset implements Dataset.ChartDataset {
    private _metadata: Api.Metadata;
    private _selectLabelFormatter: (value: string) => string;
    private _groupValueFormatter: (groupByName: string, groupValue: any) => string;

    private _selectLabels: Dataset.SelectLabel[] = [];
    private _data: any = [];

    constructor(results: Api.QueryResultItem[], metadata: Api.Metadata, formatters: Dataset.Formatters) {
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

    private _mapLabels(results: Api.QueryResultItem[]): Dataset.SelectLabel[] {
        return _.map(this._metadata.selects, select => <Dataset.SelectLabel>{
            select: select,
            label: this._selectLabelFormatter(select)
        });
    }

    private _mapData(results: Api.QueryResultItem[]): any {      
        return _.map(results, result => {
                var isGrouped = this._metadata.groups.length > 0,
                    interval = result['interval'],
                    mappedResult = this._mapResult(result),
                    groupPath = Dataset.getGroupPath(result, this._metadata.groups, this._groupValueFormatter);

                if(interval) {
                    mappedResult['_x'] = interval['start'];
                } else {
                    mappedResult['_x'] = isGrouped ? groupPath : ' ';
                }

                return mappedResult;
            });
    }

    private _mapResult(result: Api.QueryResultItem): any{
        var mappedResult = {},
            origResult = this._metadata.interval ? result.results[0] : result;
        _.each(this._metadata.selects, select => mappedResult[this._selectLabelFormatter(select)] = origResult[select]);
        return mappedResult;
    }
}

export = StandardDataset;