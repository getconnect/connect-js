import Api = require('../api')
import Filters = require('./filters');
import Selects = require('./selects');
import Timeframes = require('./timeframes');

class QueryBuilder {
	public build(selects: Selects.QuerySelects, filters: Filters.QueryFilters, groups: string[], timeframe: Timeframes.Timeframe, interval: string, timezone: Timeframes.Timezone): Api.Query {
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
			query['timeframe'] = this._buildTimeframe(timeframe);
		}

		if(interval) {
			query['interval'] = interval;
		}

		if(timezone) {
			query['timezone'] = timezone;
		}

		return query;
	}

	private _buildFilter(filters: Filters.QueryFilters): Api.QueryFilters {
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

	private _buildTimeframe(timeframe: Timeframes.Timeframe): Api.QueryTimeframe {
		if(typeof timeframe === 'string') {
			return timeframe;
		} else if (timeframe instanceof Timeframes.AbsoluteTimeframe) {
			return this._buildAbsoluteTimeframe(timeframe);
		} else if (timeframe instanceof Timeframes.RelativeTimeframe) {
			return this._buildRelativeTimeframe(timeframe);
		}
	}

	private _buildRelativeTimeframe(timeframe: Timeframes.RelativeTimeframe): Api.QueryTimeframe {
		var queryTimeframe = {},
			direction = timeframe.direction();

		queryTimeframe[direction] = {};
		queryTimeframe[direction][timeframe.period] = timeframe.length;

		return queryTimeframe;
	}

	private _buildAbsoluteTimeframe(timeframe: Timeframes.AbsoluteTimeframe): Api.QueryTimeframe {
		var queryTimeframe = {};

		if(timeframe.start) {
			queryTimeframe['start'] = timeframe.start;
		}

		if(timeframe.end) {
			queryTimeframe['end'] = timeframe.end;
		}

		return queryTimeframe;			
	}
}

export = QueryBuilder;