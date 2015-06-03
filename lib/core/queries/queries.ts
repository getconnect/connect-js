import Api = require('../api')
import Filters = require('./filters');
import Selects = require('./selects');
import QueryBuilder = require('./query-builder');
import Q = require('q');
import _ = require('underscore');

module Queries {
	export class ConnectQuery {
		_client: Api.Client;
		_collection: string;
		_selects: Selects.QuerySelects;
		_filters: Filters.QueryFilter[];
		_groups: string[];
		_timeframe: Api.Timeframe;
		_interval: string;
		_timezone: Api.Timezone;

		constructor(
			client: Api.Client,
			collection: string, 
			selects?: Selects.QuerySelects, 
			filters?: Filters.QueryFilter[], 
			groups?: string[], 
			timeframe?: Api.Timeframe, 
			interval?: string,
			timezone?: Api.Timezone) {
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

		public select(selects: Selects.QuerySelects): ConnectQuery {
			for(var key in selects) {
				var select = selects[key];

				if(!_.isString(select) && Object.keys(select).length > 1)
					throw new Error('You can only provide one aggregation function per select.');
			}

			return new ConnectQuery(this._client, this._collection, selects, this._filters, this._groups, this._timeframe, this._interval, this._timezone);
		}

		public filter(filterSpecification: any): ConnectQuery {
			var filters = _.chain(filterSpecification)
				.map(Filters.queryFilterBuilder)
				.flatten()
				.value()
				.concat(this._filters);

			filters = _.uniq(filters, filter => filter.field + '|' + filter.operator);

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

		public timeframe(timeframe: Api.Timeframe): ConnectQuery {

			return new ConnectQuery(this._client, this._collection, this._selects, this._filters, this._groups, timeframe, this._interval, this._timezone);
		}

		public interval(interval: string): ConnectQuery {
			return new ConnectQuery(this._client, this._collection, this._selects, this._filters, this._groups, this._timeframe, interval, this._timezone);
		}

		public timezone(timezone: Api.Timezone): ConnectQuery {
			if(!this._timeframe && !this._interval)
				throw new Error('You can only set a timezone when a valid timeframe or interval has been set.');
			
			return new ConnectQuery(this._client, this._collection, this._selects, this._filters, this._groups, this._timeframe, this._interval, timezone);
		}

		public execute(): Q.IPromise<Api.QueryResults> {
			var queryBuilder = new QueryBuilder(),
				apiQuery = queryBuilder.build(this._selects, this._filters, this._groups, this._timeframe, this._interval, this._timezone);

			return this._client.query(this._collection, apiQuery);
		}
	}
}

export = Queries;