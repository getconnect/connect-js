import request = require('superagent');
import Q = require('q');

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

    export interface ResultMetadata : Metadata {
        selects: string[];
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
        start: string;
        end: string;
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
        private _metadata: ResultMetadata;
        private _results: ResultMetadata;

        constructor(response: QueryResponse) {
            var responseMetadata = response.metadata;

            this._metadata = {
                selects: this.parseReponseForSelects(response),
                groups: responseMetadata.groups,
                interval: responseMetadata.interval,
                timezone: responseMetadata.timezone
            };

            this._results = response.results;
        }

        get metadata(): ResultMetadata{
            return this._metadata;
        }

        get results(): QueryResultItem[]{
            return this._results;
        }

        public updateResults(results: QueryResultItem[], metadata?: Metadata): QueryResults{
            return new QueryResults({
                results: results,
                metadata: metadata || this._metadata
            });
        }

        private parseReponseForSelects(response: QueryResponse): string[]{
            var firstResultItem,
                metadata = response.metadata,
                results = response.results

            if (response == null || response.results == null || response.results.length)
                return [];

            firstResultItem = metadata.interval ? results[0] : results[0].results[0];
        }
    }

    export type Promiser = () => Q.IPromise<Api.QueryResults>;
    
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

            return this._send(get);
        }

        public pushBatch(batches: any): Q.IPromise<any> {
            var url = this._buildUrl('/events'),
                post = request.post(url).send(batches);

            return this._send(post);
        }

        public push(collection: string, newEvent: any): Q.IPromise<any> {
            var url = this._buildUrl('/events/' + collection),
                post = request.post(url).send(newEvent);

            return this._send(post);
        }

        private _send(requestToSend: request.Request<any>): Q.IPromise<any>{
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

                    deferred.resolve(res.body);
                });     

            return deferred.promise;
        }

        private _buildUrl(path: string): string {
            return this._baseUrl + path;
        }
    }
    
}

export = Api;