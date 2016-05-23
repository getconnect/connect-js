import VizRenderer = require('./viz-renderer');
import Viz  = require('./visualization');
import Queries = require('../core/queries/queries');
import Api = require('../core/api');
import Config = require('./config');

export function extendConnectWithVisualize(Connect: any) {
    Connect.visualize = Connect.prototype.visualize = visualize;
}

export function visualize(query: Queries.ConnectQuery|Api.QueryResultsFactory) {
    return new VisualizationBuilder(this._visualizations, query);
};

export class VisualizationBuilder {
	_visualizations: any;
	_query: Queries.ConnectQuery|Api.QueryResultsFactory;
	_viz: string;
	_container: string|HTMLElement;
	_options: Config.VisualizationOptions;

	constructor(
		visualizations: any,
		query: Queries.ConnectQuery|Api.QueryResultsFactory,
		viz?: string, 
		container?: string|HTMLElement, 
		options?: Config.VisualizationOptions) {
			
		this._visualizations = visualizations;
		this._query = query;
		this._viz = viz || null;
		this._container = container || null;
		this._options = options || {};
	}

	public as(viz: string) {
		return new VisualizationBuilder(this._visualizations, this._query, viz, this._container, this._options);
	}
		
	public inside(container: string|HTMLElement) {
		return new VisualizationBuilder(this._visualizations, this._query, this._viz, container, this._options);
	}
		
	public with(options: Config.VisualizationOptions) {
		return new VisualizationBuilder(this._visualizations, this._query, this._viz, this._container, options);
	}

	public draw(): VizRenderer {
			
		if (!this._viz) {
			console.error(`No visualization name was specified. Use .as() to specify a visualization.`);
			return;
		}
			
		if (!this._container) {
			console.error(`No container was specified. Use .inside() to specify a container for the visualization.`);
			return;
		}
			
		if (!this._visualizations[this._viz]) {
			console.error(`The viz ${this._viz} has not been registered. Ensure it is spelled correctly.`);
			return;
		}
			
		return this._visualizations[this._viz](this._query, this._container, this._options);
	}
		
}
	