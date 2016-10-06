import Api = require('../api')
import Filters = require('./filters');
import Selects = require('./selects');

class QueryBuilder {
	public build(selects: Selects.QuerySelects, filters: Filters.QueryFilter[], groups: string[], timeframe: Api.Timeframe, interval: string, timezone: Api.Timezone, customOptions: any): Api.Query {
		var query = {
			select: selects || {}
		};

		if(filters.length > 0) {
			query['filter'] = this._buildFilter(filters);
		}

		if(groups.length > 0) {
			query['groupBy'] = groups;
		}

		if(timeframe) {
			query['timeframe'] = timeframe;
		}

		if(interval) {
			query['interval'] = interval;
		}

		if(timezone) {
			query['timezone'] = timezone;
		}

		if (customOptions) {
			for (var name in customOptions)
				query[name] = customOptions[name];
		}

		return query;
	}

	private _buildFilter(filters: Filters.QueryFilter[]): Api.QueryFilters {
		var queryFilter: Api.QueryFilters = {};

		filters.forEach(function(filter) {
			var fieldFilters = queryFilter[filter.field];

			if(!fieldFilters) {
				fieldFilters = {};

				queryFilter[filter.field] = fieldFilters;
			}

			fieldFilters[filter.operator] = filter.value;
		});

		return queryFilter;
	}
}

export = QueryBuilder;
