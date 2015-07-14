import Api = require('../core/api');
import Queries = require('../core/queries/queries');
import Config = require('./config');
import Loader = require('./Loader');

export interface Visualization{
    renderDom(targetElement: HTMLElement, resultsElement: HTMLElement): void;
    displayResults(results: Api.QueryResults, isQueryUpdate?: boolean): void;
    isResultSetSupported?: (metadata: Api.Metadata, selects: string[]) => boolean;
    modifyResults?: (resultsPromise: Q.IPromise<Api.QueryResults>) => Q.IPromise<Api.QueryResults>;
    destroy?: () => void;
    recalculateSize?: () => void;
}