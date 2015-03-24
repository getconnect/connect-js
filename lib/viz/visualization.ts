import Api = require('../core/api');
import Queries = require('../core/queries/queries');
import Config = require('./config');

export interface Visualization{
    targetElementId: string;
    displayData(resultsPromise: Q.IPromise<Api.QueryResults>, metadata: Queries.Metadata): void; 
    clear(): void;   
}