import Queries = require('../../core/queries/queries');
import Config = require('../config');
import Api = require('../../core/api');
import _ = require('underscore');

interface KeyMap {
    originalFieldName: string;
    derivedKey: string;
}

class Dataset {
    private _metadata: Queries.Metadata;
    private _selectLabelFormatter: (value: string) => string;
    private _groupValueFormatter: (groupByName: string, groupValue: any) => string;

    private keys: KeyMap[] = [];
    public data: any = [];

    constructor(results: Api.QueryResults, metadata: Queries.Metadata, selectLabelFormatter: (value: string) => string, groupValueFormatter: (groupByName: string, groupValue: any) => string) {
        this._metadata = metadata;
        this._selectLabelFormatter = selectLabelFormatter;
        this._groupValueFormatter = groupValueFormatter;

        this.keys = this._mapKeys(results);
        this.data = this._mapData(results);
    }

    public getKeys(): string[]{
        return _.pluck(this.keys, 'derivedKey');
    }

    public getFieldNameForKey(key: string): string{
        return _.find(this.keys, (keyMap) => keyMap.derivedKey === key).originalFieldName;
    }

    private _mapKeys(results: Api.QueryResults): KeyMap[] {
        if(this._metadata.interval && this._metadata.groups.length > 0) {   
            return _.chain(results)
                .map(result => result['results'])
                .flatten()
                .map(intervalResult => {
                    var groupPath = this._getGroupPath(intervalResult);
                    return _.map(this._metadata.selects, select => <KeyMap>{
                        originalFieldName: select,
                        derivedKey: groupPath + ' - ' + this._selectLabelFormatter(select)
                    });
                })
                .flatten()  
                .value();
        }

        return _.map(this._metadata.selects, select => <KeyMap>{
            originalFieldName: select,
            derivedKey: this._selectLabelFormatter(select)
        });
    }

    private _mapData(results: Api.QueryResults): any {      
        return _.chain(results)
            .map(result => _.clone(result))
            .map(result => {
                var isGrouped = this._metadata.groups.length > 0,
                    interval = result['interval'];

                if(this._metadata.interval) {
                    result = this._mapIntervalResult(result);
                    result['_x'] = interval['start'];
                } else {
                    result = this._mapStandardResult(result);
                    result['_x'] = isGrouped ? this._getGroupPath(result) : ' ';
                }

                return result;
            })
            .value();
    }

    private _mapStandardResult(result: Api.QueryResultItem): Api.QueryResultItem{
        _.each(this._metadata.selects, select => result[this._selectLabelFormatter(select)] = result[select])

        return result;
    }

    private _mapIntervalResult(result: Api.QueryResultItem): any {
        if(this._metadata.groups.length === 0){
            var result = _.clone(result.results[0]) || {}
            return this._mapStandardResult(result);
        }
        
        return _.reduce<Api.QueryResultItem, any>(result.results, (result, intervalResult) => {
            var groupPath = this._getGroupPath(intervalResult);

            _.each(this._metadata.selects, select => {
                result[groupPath + ' - ' + this._selectLabelFormatter(select)] = intervalResult[select];
            });

            return result;
        }, {});
    }

    private _getGroupPath(result: Api.QueryResultItem): string {
        return this._metadata.groups
            .map(group => this._groupValueFormatter(group, result[group]))
            .join(' / ');
    }
}

export = Dataset;