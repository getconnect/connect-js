/// <reference path="../../../typings/chai/chai.d.ts" />
/// <reference path="../../../typings/mocha/mocha.d.ts" />
import chai = require('chai');

import Api = require('../../../lib/core/api');
import Dataset = require('../../../lib/viz/chart/dataset');

var expect = chai.expect;

describe('Dataset', () => {
	
	
	describe('ChartDataset', () => {
	
		var formatters: Dataset.Formatters = {
			selectLabelFormatter: select => select,
			groupValueFormatter: (groupByName, groupValue) => groupValue
		}

		describe('when a single groupby and select are defined', () => {
			
			var select = 'test';
			var response: Api.QueryResponse = {
					metadata: {
						groups: ['groupName']
					},
					results: [{
						'test': 0,
						'groupName': 'groupValue'
					}]
				};
			var results = new Api.QueryResults(response);
			var chartDataset = new Dataset.ChartDataset(results, formatters);
			
			describe('#getContext() for legend datum', () => {
				var context = chartDataset.getContext(select);
				
				it('should not be null', () => {
					expect(context).to.be.not.null;
				});
				
				it('should contain null groupBys', () => {
					expect(context.groupBys).to.be.null;
				});
				
				it('should contain correct select', () => {
					expect(context.select).to.be.string(select);
				});
			});
			
			describe('#getContext() for normal datum', () => {
				var context = chartDataset.getContext({ x: 0, value: 0, id: select, index: 0 });
				
				it('should not be null', () => {
					expect(context).to.be.not.null;
				});
				
				it('should contain keyed groupBys', () => {
					expect(context.groupBys['groupName']).to.be.string('groupValue');
				});
				
				it('should contain correct select', () => {
					expect(context.select).to.be.string(select);
				});
			});
			
		});

		describe('when multiple selects and an interval are defined', () => {
			
			var response: Api.QueryResponse = {
				metadata: {
					groups: [],
					interval: 'daily',
					timezone: 'UTC'
				},
				results: [{
					interval: { start: '', end: ''},
					results: [{
						'first': 0,
						'second': 0
					}]
				}]
			};
			var results = new Api.QueryResults(response);
			var chartDataset = new Dataset.ChartDataset(results, formatters);
			
			describe('#getContext() for legend datum', () => {
				var context = chartDataset.getContext('first');
				
				it('should not be null', () => {
					expect(context).to.be.not.null;
				});
				
				it('should contain null groupBys', () => {
					expect(context.groupBys).to.be.null;
				});
				
				it('should contain correct select', () => {
					expect(context.select).to.be.string('first');
				});
			});
			
			describe('#getContext() for normal datum', () => {
				var context = chartDataset.getContext({x: '', value: 0, id: "second", index: 0});
				
				it('should not be null', () => {
					expect(context).to.be.not.null;
				});
				
				it('should contain null groupBys', () => {
					expect(context.groupBys).to.be.null;
				});
				
				it('should contain correct select', () => {
					expect(context.select).to.be.string('second');
				});
			});
			
		});

	});
});