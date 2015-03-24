import Api = require('../api')
import Filters = require('./filters');
import Selects = require('./selects');
import Timeframes = require('./timeframes');
import QueryBuilder = require('./query-builder');
import Q = require('q');
import _ = require('underscore');

module Queries {
	export type FilterFactory = (builder: (field: string) => Filters.QueryFilterBuilder) => Filters.QueryFilter;
	export type TimeframeFactory = (builder: Timeframes.TimeframeBuilder) => Timeframes.Timeframe;

	export interface Metadata {
		selects: string[];
		groups: string[];
		interval: string;
		timezone: string | number;
	}

	export class ConnectQuery {
		_client: Api.Client;
		_collection: string;
		_selects: Selects.QuerySelects;
		_filters: Filters.QueryFilters;
		_groups: string[];
		_timeframe: Timeframes.Timeframe;
		_interval: string;
		_timezone: Timeframes.Timezone;

		constructor(
			client: Api.Client,
			collection: string, 
			selects?: Selects.QuerySelects, 
			filters?: Filters.QueryFilters, 
			groups?: string[], 
			timeframe?: Timeframes.Timeframe, 
			interval?: string,
			timezone?: Timeframes.Timezone) {
			this._client = client;
			this._collection = collection;
			this._selects = selects || {};
			this._filters = filters || [];
			this._groups = groups || [];
			this._timeframe = timeframe || null;
			this._interval = interval || null;
			this._timezone = timezone || null;
		}

		public collection(): string {
			return this._collection;
		}

		public metadata(): Metadata {
			return {
				selects: _(this._selects).keys(),
				groups: this._groups,
				interval: this._interval,
				timezone: this._timezone || 'UTC'
			};
		}

		public select(selects: Selects.QuerySelects): ConnectQuery {
			for(var key in selects) {
				var select = selects[key];

				if(!_.isString(select) && Object.keys(select).length > 1)
					throw new Error('You can only provide one aggregation function per select.');
			}

			return new ConnectQuery(this._client, this._collection, selects, this._filters, this._groups, this._timeframe, this._interval, this._timezone);
		}

		public filter(factory: FilterFactory): ConnectQuery {
			var builder = (field: string) => {
				return new Filters.QueryFilterBuilder(field);
			};	

			var filter = factory(builder);
			if(_.any(this._filters, x => x.field === filter.field && x.operator === filter.operator))
				throw new Error('You have already defined a filter on operator \'' + filter.operator + '\' for field \'' + filter.field + '\'.');

			var filters = this._filters.concat(filter);
			return new ConnectQuery(this._client, this._collection, this._selects, filters, this._groups, this._timeframe, this._interval, this._timezone);
		}

		public groupBy(field: string|string[]) {
			var groups;

			if(typeof field === 'string') {
				groups = this._groups.concat([field]);
			} else {
				groups = this._groups.concat(field);
			}

			return new ConnectQuery(this._client, this._collection, this._selects, this._filters, groups, this._timeframe, this._interval, this._timezone);
		}

		public timeframe(factory: string|TimeframeFactory): ConnectQuery {
			var timeframe;

			if(typeof factory === 'string') {
				timeframe = factory;
			} else {
				var builder = new Timeframes.TimeframeBuilder();
				timeframe = factory(builder);
			}

			return new ConnectQuery(this._client, this._collection, this._selects, this._filters, this._groups, timeframe, this._interval, this._timezone);
		}

		public interval(interval: string): ConnectQuery {
			return new ConnectQuery(this._client, this._collection, this._selects, this._filters, this._groups, this._timeframe, interval, this._timezone);
		}

		public timezone(timezone: Timeframes.Timezone): ConnectQuery {
			if(!this._timeframe && !this._interval)
				throw new Error('You can only set a timezone when a valid timeframe or interval has been set.');
			
			return new ConnectQuery(this._client, this._collection, this._selects, this._filters, this._groups, this._timeframe, this._interval, timezone);
		}

		public execute(): Q.IPromise<any> {
			var queryBuilder = new QueryBuilder(),
				apiQuery = queryBuilder.build(this._selects, this._filters, this._groups, this._timeframe, this._interval, this._timezone);

			return this._client.query(this._collection, apiQuery);
		}
	}
}

export = Queries;