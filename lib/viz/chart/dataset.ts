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
        mapLabels(results: Api.QueryResult):  SelectLabel[];
        mapData(results: Api.QueryResult): any;
    }

    function getGroupPath(result: Api.QueryResultItem, groups: string[], formatter: GroupValueFormatter): string {
        return groups
            .map(group => formatter(group, result[group]))
            .join(' / ');
    }

    class ChartDataset {
        private _selectLabelFormatter: SelectLabelFormatter;
        private _groupValueFormatter: GroupValueFormatter;

        private _selectLabels: Dataset.SelectLabel[] = [];
        private _data: any = [];

        constructor(results: Api.QueryResults, formatters: Formatters) {
            var isGroupedInterval = metadata.interval && metadata.groups.length;
                mapper = isGroupedInterval ? new GroupedIntervalDataset(results, formatters)
                                           : new StandardDataset(results, formatters);

            this._selectLabels = mapper.mapLabels(results);
            this._data = mapper.mapData(results);
        }

        public getLabels(labels: SelectLabel[]){
            return _.pluck(labels, 'label');
        }

        public getSelect(selectLabels: SelectLabel[], label: string): string{
            return _.find(selectLabels, (selectLabel) => selectLabel.label === label).select;
        }

        public getData(): any{
            return this._data;
        }
    }

    class GroupedIntervalMapper implements DatasetMapper{
        private _selectLabelFormatter: SelectLabelFormatter;
        private _groupValueFormatter: GroupValueFormatter;

        constructor(formatters: Formatters) {
            this._selectLabelFormatter = formatters.selectLabelFormatter;
            this._groupValueFormatter = formatters.groupValueFormatter;
        }

        public mapLabels(results: Api.QueryResult): Dataset.SelectLabel[] {
            var metadata = results.metadata;

            return _.chain(results)
                .map(result => result['results'])
                .flatten()
                .map(result => {
                    var groupPath = Dataset.getGroupPath(result, metadata.groups, this._groupValueFormatter);
                    return _.map(metadata.selects, select => <SelectLabel>{
                        select: select,
                        label: this._generateLabelForResult(result, select, groupPath)
                    });
                })
                .flatten()  
                .value();        
        }

        public mapData(results: Api.QueryResult): any {    
            var metadata = results.metadata;

            return _.chain(results)
                .map(result => {
                    var start = result.interval.start,
                        mappedResult = this._mapResult(metadata, result);
                        mappedResult['_x'] = start;

                    return mappedResult;
                })
                .value();
        }

        private _mapResult(metadata: Api.Metadata, result: Api.QueryResultItem): any {        
            return _.reduce<Api.QueryResultItem, any>(result.results, (mappedResult, intervalResult) => {
                var groupPath = Dataset.getGroupPath(intervalResult, results.groups, this._groupValueFormatter);

                _.each(metadata.selects, select => {
                    var label = this._generateLabelForResult(metadata, mappedResult, select, groupPath);
                    mappedResult[label] = intervalResult[select];
                });

                return mappedResult;
            }, {});
        }

        private _generateLabelForResult(metadata: Api.Metadata, result: Api.QueryResultItem, select: string, groupPath: string): string{
            return metadata.selects.length > 1 ? groupPath + ' - ' + this._selectLabelFormatter(select) : groupPath;
        }
    }

    class StandardMapper implements DatasetMapper {
        private _selectLabelFormatter: SelectLabelFormatter;
        private _groupValueFormatter: GroupValueFormatter;
        
        constructor(formatters: Formatters) {
            this._selectLabelFormatter = formatters.selectLabelFormatter;
            this._groupValueFormatter = formatters.groupValueFormatter;
        }

        public mapLabels(results: Api.QueryResult): SelectLabel[] {
            return _.map(results.metadata.selects, select => <SelectLabel>{
                select: select,
                label: this._selectLabelFormatter(select)
            });
        }

        public mapData(results: Api.QueryResult): any {     
            var metadata = results.metadata;

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

        private _mapResult(metadata: Api.Metadata, result: Api.QueryResultItem): any{
            var mappedResult = {},
                origResult = metadata.interval ? result.results[0] : result;
            _.each(metadata.selects, select => mappedResult[this._selectLabelFormatter(select)] = origResult[select]);
            return mappedResult;
        }
    }    
}

export = Dataset;