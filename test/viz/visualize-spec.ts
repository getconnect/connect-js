/// <reference path="../../typings/chai/chai.d.ts" />
/// <reference path="../../typings/mocha/mocha.d.ts" />
import chai = require('chai');

import Visualize = require('../../lib/viz/visualize');

var expect = chai.expect;

describe('Visualize', () => {
	
	describe('VisualizationBuilder', () => {
		var query;
		var visualization;

		beforeEach(() => {
			query = () => [];
			visualization = new Visualize.VisualizationBuilder({}, query);
		});
		
		describe('constructor', () => {
			
			it('should set the query', () => {
				expect(visualization._query).to.equal(query);
			});
			
		});
		
		describe('#as()', () => {
			
			it('should set viz type', () => {
				var viz = 'chart';
				visualization = visualization.as(viz);
				expect(visualization._viz).to.equal(viz);
			});

			it('should return a new query instance', () => {
				var visualizationReturned = visualization.as('table');
				expect(visualization).to.not.equal(visualizationReturned);
			});
			
		});
		
		describe('#inside()', () => {
			
			it('should set the container', () => {
				var container = '#container';
				visualization = visualization.inside(container);
				expect(visualization._container).to.equal(container);
			});

			it('should return a new query instance', () => {
				var visualizationReturned = visualization.inside('#container');
				expect(visualization).to.not.equal(visualizationReturned);
			});
			
		});

		describe('#with()', () => {
			
			it('should set the options', () => {
				var options = {
					chart: {
						type: 'bar'
					}
				};
				visualization = visualization.with(options);
				expect(visualization._options).to.equal(options);
			});

			it('should return a new query instance', () => {
				var visualizationReturned = visualization.with({});
				expect(visualization).to.not.equal(visualizationReturned);
			});
			
		});

	});
	
});