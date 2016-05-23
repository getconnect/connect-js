import Api = require('../../core/api');
import Config = require('../config');
import _ = require('underscore');

module Dataset{
    export type GroupValueFormatter = (groupByName: string, groupValue: any) => string;
    export type SelectLabelFormatter = (value: string) => string;

    export interface Formatters {
        selectLabelFormatter: SelectLabelFormatter;
        groupValueFormatter: GroupValueFormatter;
    }

    export interface SelectLabel {
        select: string;
        label: string;
    }

    export interface KeyedContext {
        [resultPropertyName: string]: Config.ChartDataContext;
    }

    export interface ResultWithContext {
        result: any;
        contexts: KeyedContext;
    }

    export interface DatasetMapper {
        mapLabels(results: Api.QueryResults):  SelectLabel[];
        mapData(results: Api.QueryResults): any;
    }

    function getGroupByNameValuePairs(result: Api.QueryResultItem, groups: string[], formatter: GroupValueFormatter): Config.GroupByNameValuePairs {
        var values = groups.map(group => formatter(group, result[group]));
        if (values.length < 1) {
            return null;
        }
        return <Config.GroupByNameValuePairs>_.object(groups, values);
    }

    function getGroupPath(result: Api.QueryResultItem, groups: string[], formatter: GroupValueFormatter): string {
        var groupBys = getGroupByNameValuePairs(result, groups, formatter);
        return formatGroupBysAsGroupPath(groupBys);
    }

    function formatGroupBysAsGroupPath(groupNameValuePairs: Config.GroupByNameValuePairs): string {
        var values = _.values(groupNameValuePairs);
        return values.join(' / ');
    }

    export class ChartDataset {
        private _selectLabelFormatter: SelectLabelFormatter;
        private _groupValueFormatter: GroupValueFormatter;

        private _selectLabels: Dataset.SelectLabel[] = [];
        private _data: any[] = [];
        private _contexts: KeyedContext[] = [];
        private _metadata: Api.Metadata;

        constructor(results: Api.QueryResults, formatters: Formatters) {  
            var metadata = results.metadata,
                mappedData,
                isGroupedInterval = metadata.interval && metadata.groups.length,
                mapper = isGroupedInterval ? new GroupedIntervalMapper(results, formatters)
                                           : new StandardMapper(results, formatters);

            mappedData = mapper.mapData();

            this._selectLabels = mapper.mapLabels();
            this._data = _.pluck(mappedData, 'result');
            this._contexts = _.pluck(mappedData, 'contexts');
            this._metadata = metadata;
        }

        public getLabels(){
            return _.pluck(this._selectLabels, 'label');
        }

        public getSelect(label: string): string{
            return _.find(this._selectLabels, (selectLabel) => selectLabel.label === label).select;
        }

        public getData(): any[]{
            return this._data;
        }

        public getContext(datum: any): Config.ChartDataContext{
            if (_.isString(datum)){
                return this._buildGenericContext(datum);
            }

            if (this._contexts[datum.index]){
                return this._contexts[datum.index][datum.id];
            }

            return null;
        }

        private _buildGenericContext(propertyName: string): Config.ChartDataContext {
            var matchingKeyedContext = _.find(this._contexts, (context) => context[propertyName] != null),
                matchingContext = matchingKeyedContext ? matchingKeyedContext[propertyName] : null,
                hasInterval = matchingContext && this._metadata.interval,
                groupBys: Config.GroupByNameValuePairs = hasInterval ? matchingContext.groupBys : null;

            if (matchingContext){
                return {
                    groupBys: groupBys,
                    select: matchingContext.select
                };
            }

            return null;
        }
    }

    export class GroupedIntervalMapper implements DatasetMapper{
        private _selectLabelFormatter: SelectLabelFormatter;
        private _groupValueFormatter: GroupValueFormatter;
        private _selects: string[];
        private _metadata: Api.Metadata;
        private _results: Api.QueryResultItem[];

        constructor(results: Api.QueryResults, formatters: Formatters) {
            this._selectLabelFormatter = formatters.selectLabelFormatter;
            this._groupValueFormatter = formatters.groupValueFormatter;
            this._metadata = results.metadata;
            this._selects = results.selects();
            this._results = results.results;
        }

        public mapLabels(): Dataset.SelectLabel[] {
            var metadata = this._metadata,
                results = this._results;

            return _.chain(results)
                .map(result => result['results'])
                .flatten()
                .map(result => {
                    var groupPath = getGroupPath(result, metadata.groups, this._groupValueFormatter);
                    return _.map(this._selects, select => <SelectLabel>{
                        select: select,
                        label: this._generateLabelForResult(metadata, select, groupPath)
                    });
                })
                .flatten()
                .unique((selectLabel: SelectLabel) => selectLabel.label)
                .value();
        }

        public mapData(): ResultWithContext[] {    
            var metadata = this._metadata,
                results = this._results;

            return _.chain(results)
                .map(result => {
                    var start = result.interval.start,
                        mappedResultWithContext = this._mapResult(result),
                        mappedResult = mappedResultWithContext.result;

                    mappedResult['_x'] = start;

                    return mappedResultWithContext;
                })
                .value();
        }

        private _mapResult(result: Api.QueryResultItem): ResultWithContext {        
            var metadata = this._metadata,
                resultWithContext: ResultWithContext = {
                    result: {},
                    contexts: <KeyedContext>{}
                };

            return _.reduce<Api.QueryResultItem, any>(result.results, (mappedResult, intervalResult) => {
                var groupBys = getGroupByNameValuePairs(intervalResult, metadata.groups, this._groupValueFormatter),
                    groupPath = formatGroupBysAsGroupPath(groupBys);

                _.each(this._selects, select => {
                    var label = this._generateLabelForResult(metadata, select, groupPath);
                    
                    resultWithContext.result[label] = intervalResult[select];

                    resultWithContext.contexts[label] = {
                        groupBys: groupBys,
                        select: select
                    };
                });

                return resultWithContext;
            }, resultWithContext);
        }

        private _generateLabelForResult(metadata: Api.Metadata, select: string, groupPath: string): string{
            return this._selects.length > 1 ? groupPath + ' - ' + this._selectLabelFormatter(select) : groupPath;
        }
    }

    export class StandardMapper implements DatasetMapper {
        private _selectLabelFormatter: SelectLabelFormatter;
        private _groupValueFormatter: GroupValueFormatter;
        private _selects: string[];
        private _metadata: Api.Metadata;
        private _results: Api.QueryResultItem[];

        constructor(results: Api.QueryResults, formatters: Formatters) {
            this._selectLabelFormatter = formatters.selectLabelFormatter;
            this._groupValueFormatter = formatters.groupValueFormatter;
            this._metadata = results.metadata;
            this._selects = results.selects();
            this._results = results.results;
        }

        public mapLabels(): SelectLabel[] {
            var metadata = this._metadata;

            return _.map(this._selects, select => <SelectLabel>{
                select: select,
                label: this._selectLabelFormatter(select)
            });
        }

        public mapData(): ResultWithContext[] {
            var metadata = this._metadata,
                results = this._results;

            return _.map(results, result => {
                var isGrouped = this._metadata.groups.length > 0,
                    interval = result['interval'],
                    mappedResultWithContext = this._mapResult(result),
                    mappedResult = mappedResultWithContext.result,
                    groupPath = getGroupPath(result, metadata.groups, this._groupValueFormatter);

                if(interval) {
                    mappedResult['_x'] = interval['start'];
                } else {
                    mappedResult['_x'] = isGrouped ? groupPath : ' ';
                }

                return mappedResultWithContext;
            });
        }

        private _mapResult(result: Api.QueryResultItem): ResultWithContext{
            var mappedResult = {},
                resultWithContext: ResultWithContext = {
                    result: null,
                    contexts: <KeyedContext>{}
                },
                intervalStart = result.interval ? result.interval.start : null,
                origResult = intervalStart ? result.results[0] : result,
                groupBys = getGroupByNameValuePairs(origResult, this._metadata.groups, this._groupValueFormatter);

            _.each(this._selects, select => {
                var formattedSelect = this._selectLabelFormatter(select);
                
                mappedResult[formattedSelect] = origResult ? origResult[select] : null;

                resultWithContext.contexts[formattedSelect] = {
                    groupBys: groupBys,
                    select: formattedSelect
                };
            });

            resultWithContext.result = mappedResult;

            return resultWithContext;
        }
    }    
}

export = Dataset;