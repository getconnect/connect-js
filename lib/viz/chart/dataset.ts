import Api = require('../../core/api');
import _ = require('underscore');

module Dataset{
    export function getLabels(labels: SelectLabel[]){
        return _.pluck(labels, 'label');
    }

    export function getSelect(selectLabels: SelectLabel[], label: string): string{
        return _.find(selectLabels, (selectLabel) => selectLabel.label === label).select;
    }

    export function getGroupPath(result: Api.QueryResultItem, groups: string[], formatter: (groupByName: string, groupValue: any) => string): string {
        return groups
            .map(group => formatter(group, result[group]))
            .join(' / ');
    }

    export interface Formatters {
        selectLabelFormatter: (value: string) => string;
        groupValueFormatter: (groupByName: string, groupValue: any) => string;
    }

    export interface ChartDataset {
        getLabels(): string[];
        getSelect(label: string): string;
        getData(): any;
    }

    export interface SelectLabel {
        select: string;
        label: string;
    }
}

export = Dataset;