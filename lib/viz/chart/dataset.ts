import Api = require('../../core/api');
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

    interface DatasetMapper {
        mapLabels(results: Api.QueryResults):  SelectLabel[];
        mapData(results: Api.QueryResults): any;
    }

    function getGroupPath(result: Api.QueryResultItem, groups: string[], formatter: GroupValueFormatter): string {
        return groups
            .map(group => formatter(group, result[group]))
            .join(' / ');
    }

    export class ChartDataset {
        private _selectLabelFormatter: SelectLabelFormatter;
        private _groupValueFormatter: GroupValueFormatter;

        private _selectLabels: Dataset.SelectLabel[] = [];
        private _data: any = [];

        constructor(results: Api.QueryResults, formatters: Formatters) {
            var metadata = results.metadata;

            var isGroupedInterval = metadata.interval && metadata.groups.length,
                mapper = isGroupedInterval ? new GroupedIntervalMapper(results, formatters)
                                           : new StandardMapper(results, formatters);

            this._selectLabels = mapper.mapLabels();
            this._data = mapper.mapData();
        }

        public getLabels(){
            return _.pluck(this._selectLabels, 'label');
        }

        public getSelect(label: string): string{
            return _.find(this._selectLabels, (selectLabel) => selectLabel.label === label).select;
        }

        public getData(): any{
            return this._data;
        }
    }

    class GroupedIntervalMapper implements DatasetMapper{
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
                        label: this._generateLabelForResult(metadata, result, select, groupPath)
                    });
                })
                .flatten()  
                .value();        
        }

        public mapData(): any {    
            var metadata = this._metadata,
                results = this._results;

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
            var metadata = this._metadata;

            return _.reduce<Api.QueryResultItem, any>(result.results, (mappedResult, intervalResult) => {
                var groupPath = getGroupPath(intervalResult, metadata.groups, this._groupValueFormatter);

                _.each(this._selects, select => {
                    var label = this._generateLabelForResult(metadata, mappedResult, select, groupPath);
                    mappedResult[label] = intervalResult[select];
                });

                return mappedResult;
            }, {});
        }

        private _generateLabelForResult(metadata: Api.Metadata, result: Api.QueryResultItem, select: string, groupPath: string): string{
            return this._selects.length > 1 ? groupPath + ' - ' + this._selectLabelFormatter(select) : groupPath;
        }
    }

    class StandardMapper implements DatasetMapper {
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

        public mapData(): any {     
            var metadata = this._metadata,
                results = this._results;

            return _.map(results, result => {
                var isGrouped = this._metadata.groups.length > 0,
                    interval = result['interval'],
                    mappedResult = this._mapResult(result),
                    groupPath = getGroupPath(result, metadata.groups, this._groupValueFormatter);

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

            _.each(this._selects, select => {
                mappedResult[this._selectLabelFormatter(select)] = origResult ? origResult[select] : null
            });

            return mappedResult;
        }
    }    
}

export = Dataset;