import Api = require('../api');
import _ = require('underscore');

module Filters {
	export class QueryFilter {
		field: string;
		operator: string;
		value: any;

		constructor(field: string, operator: string, value: any) {
			this.field = field;
			this.operator = operator;
			this.value = value;
		}
	}

	export function queryFilterBuilder(filterValue: any, field: string) : QueryFilter[]{
		if (!_.isObject(filterValue)){
			return [new QueryFilter(field, "eq", filterValue)];
		}else if (_.isArray(filterValue)){
			return [new QueryFilter(field, "in", filterValue)];
		}else{
			return _.map(filterValue, (value: any, opName: string) => new QueryFilter(field, opName, value));
		}
	}
}

export = Filters;