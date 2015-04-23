import request = require('superagent');
import Q = require('q');
import _ = require('underscore');

module Api {    
    export interface Query {
        select?: Api.QuerySelects;
        filter?: Api.QueryFilters;
        groupBy?: string[];
        timeframe?: string|Api.QueryTimeframe;
        interval?: string;
        timezone?: string|number;
    }

    export interface Metadata {
        groups: string[];
        interval: string;
        timezone: string | number;
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

    export interface QueryTimeframe {
        timeframe?: string;
        from?: Date;
        to?: Date;
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

        constructor(response: QueryResponse) {
            this.metadata = response.metadata;
            this.results = response.results;

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
            });
        }            
    }

    export type QueryResultsFactory = () => Q.IPromise<Api.QueryResults>;
    
    export class Client {
        _baseUrl: string;
        _apiKey: string;

        constructor(baseUrl: string, apiKey: string) {
            this._baseUrl = baseUrl;
            this._apiKey = apiKey;
        }

        public query(collection: string, query: Api.Query): Q.IPromise<QueryResults> {
            var deferred = Q.defer(),
                queryJson = JSON.stringify(query),
                url = this._buildUrl('/events/' + collection + '?query=' + queryJson),
                get = request.get(url);

            return this._send(get, r => new QueryResults(<QueryResponse>r.body));
        }

        public pushBatch(batches: any): Q.IPromise<any> {
            var url = this._buildUrl('/events'),
                post = request.post(url).send(batches);

            return this._send(post, r => r.body);
        }

        public push(collection: string, newEvent: any): Q.IPromise<any> {
            var url = this._buildUrl('/events/' + collection),
                post = request.post(url).send(newEvent);

            return this._send(post, r => r.body);
        }

        private _send(requestToSend: request.Request<any>, resultsFactory: (response) => any): Q.IPromise<any>{
            var deferred = Q.defer();

            requestToSend
                .set('X-API-Key', this._apiKey)
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

            return deferred.promise;
        }

        private _buildUrl(path: string): string {
            return this._baseUrl + path;
        }
    }
    
}

export = Api;