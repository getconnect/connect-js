import Api = require('../api')

module Filters {
	export type QueryFilters = Array<QueryFilter>;

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

	export class QueryFilterBuilder { 
		field: string;

		constructor(field: string) {
			this.field = field;
		}

		public eq(value: any): Filters.QueryFilter {
			return new Filters.QueryFilter(this.field, 'eq', value);
		}

		public ne(value: any): Filters.QueryFilter {
			return new Filters.QueryFilter(this.field, 'ne', value);
		}

		public gt(value: any): Filters.QueryFilter {
			return new Filters.QueryFilter(this.field, 'gt', value);
		}

		public gte(value: any): Filters.QueryFilter {
			return new Filters.QueryFilter(this.field, 'gte', value);
		}

		public lt(value: any): Filters.QueryFilter {
			return new Filters.QueryFilter(this.field, 'lt', value);
		}

		public lte(value: any): Filters.QueryFilter {
			return new Filters.QueryFilter(this.field, 'lte', value);
		}

		public exists(value: boolean): Filters.QueryFilter {
			return new Filters.QueryFilter(this.field, 'exists', value);
		}

		public startsWith(value: string): Filters.QueryFilter {
			return new Filters.QueryFilter(this.field, 'startsWith', value);
		}

		public endsWith(value: string): Filters.QueryFilter {
			return new Filters.QueryFilter(this.field, 'endsWith', value);
		}

		public contains(value: string): Filters.QueryFilter {
			return new Filters.QueryFilter(this.field, 'contains', value);
		}
	}
}

export = Filters;