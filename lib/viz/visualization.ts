import Api = require('../core/api');
import Queries = require('../core/queries/queries');
import Config = require('./config');
import Loader = require('./Loader');

export interface Visualization {
    init?(container: HTMLElement, options: Config.VisualizationOptions): void;
    render(container: HTMLElement, results: Api.QueryResults, options: Config.VisualizationOptions, hasQueryChanged?: boolean): void;
    redraw?: () => void;
    destroy?: () => void;
    defaultOptions?: () => Config.VisualizationOptions;
    modifyResults?: (resultsPromise: Q.IPromise<Api.QueryResults>) => Q.IPromise<Api.QueryResults>;
    isSupported?: (metadata: Api.Metadata, selects: string[]) => boolean;
    cssClasses?: (options: Config.VisualizationOptions) => string[];
}
