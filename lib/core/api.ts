import request = require('superagent');
import Q = require('q');
import _ = require('underscore');

module Api {
    export interface Query {
        select?: QuerySelects;
        filter?: QueryFilters;
        groupBy?: string[];
        timeframe?: Timeframe;
        interval?: string;
        timezone?: Timezone;
    }

    export type Timeframe = string|AbsoluteTimeframe|RelativeTimeframe;
    export type Timezone = string|number;

    export interface AbsoluteTimeframe {
        start?: Date|string;
        end?: Date|string;
    }

    export interface Period {
        minutes?: number;
        hours?: number;
        days?: number;
        weeks?: number;
        months?: number;
        quarters?: number;
        years?: number;
    }

    export interface RelativeTimeframe {
        previous?: Period;
        current?: Period;
    }

    export interface Metadata {
        groups?: string[];
        interval?: string;
        timezone?: string | number;
    }

    export interface QuerySelect {
        [index: string]: string;
    }

    export interface QuerySelects {
        [index: string]: string|Api.QuerySelect;
    }

    export interface QueryFilter {
        [index: string]: string;
    }

    export interface QueryFilters {
        [index: string]: Api.QueryFilter;
    }

    export interface QueryResultInterval {
        start: string|Date;
        end: string|Date;
    }

    export interface QueryResultItem {
        [index: string]: any;
        interval?: QueryResultInterval;
        results?: QueryResultItem[];
    }

    export interface QueryResponse {
        metadata: Metadata;
        results: QueryResultItem[];
    }

    export class QueryResults {
        public metadata: Metadata;
        public results: QueryResultItem[];
        public cacheKey: string;

        constructor(response: QueryResponse, cacheKey: string) {
            this.metadata = response.metadata;
            this.results = response.results;
            this.cacheKey = cacheKey;

            if (this.metadata.interval){
                _.map(this.results, (intervalResult) => {
                    var interval = intervalResult.interval;
                    interval.start = new Date(<string>interval.start);
                    interval.end = new Date(<string>interval.end);
                });
            }
        }

        public selects(): string[]{
            var results = !this.metadata.interval ? this.results : _.flatten(_.map(this.results, result => result.results));

            return _.difference(_.keys(_.first(results)), this.metadata.groups.concat(['_count']));
        }

        public clone(): QueryResults{
            return new QueryResults({
                metadata: _.clone(this.metadata),
                results: JSON.parse(JSON.stringify(this.results))
            }, this.cacheKey);
        }
    }

    export type QueryResultsFactory = () => Q.IPromise<Api.QueryResults>;


    export interface ClientDeferredQuery {
        deferred: Q.Deferred<any>;
        request: request.Request<any>;
    }

    export class Client {
        _baseUrl: string;
        _projectId: string;
        _apiKey: string;

        constructor(baseUrl: string, projectId: string, apiKey: string) {
            this._baseUrl = baseUrl;
            this._projectId = projectId;
            this._apiKey = apiKey;
        }

        public query(collection: string, query: Api.Query): ClientDeferredQuery {
            var deferred = Q.defer(),
                queryJson = JSON.stringify(query),
                url = this._buildUrl('/events/' + collection),
                get = request.get(url).query({ query: queryJson });

            return this._send(get, r => new QueryResults(<QueryResponse>r.body, r.header["etag"]));
        }

        public pushBatch(batches: any): Q.IPromise<any> {
            var url = this._buildUrl('/events'),
                post = request.post(url).send(batches);

            return this._send(post, r => r.body).deferred.promise;
        }

        public push(collection: string, newEvent: any): Q.IPromise<any> {
            var url = this._buildUrl('/events/' + collection),
                post = request.post(url).send(newEvent);

            return this._send(post, r => r.body).deferred.promise;
        }

        private _send(requestToSend: request.Request<any>, resultsFactory: (response) => any): ClientDeferredQuery{
            var deferred = Q.defer();

            requestToSend
                .set('X-Project-Id', this._projectId)
                .set('X-Api-Key', this._apiKey)
                .end((err: any, res: request.Response) => {
                    if(err) {
                        if(!err.status) {
                            err.status = 'NetworkFailure';
                        }
                        deferred.reject(err);
                        return;
                    }

                    if (!res.ok) {
                        deferred.reject(res.error);
                        return;
                    }

                    var results = resultsFactory(res);
                    deferred.resolve(results);
                });

            return { deferred: deferred, request: requestToSend };
        }

        private _buildUrl(path: string): string {
            return this._baseUrl + path;
        }
    }

}

export = Api;
