import chai = require('chai');
import data_driven = require('mocha-data-driven');
import Filters = require('../../../lib/core/queries/filters');

var expect = chai.expect;

describe('Filters', () => {
	describe('QueryFilter', () => {
		var field = 'field',
			operator = 'operator',
			value = 'value',
			filter: Filters.QueryFilter;

		before(() => {
			filter = new Filters.QueryFilter(field, operator, value);
		});

		describe('constructor', () => {
			it('should set the field', () => {
				expect(filter.field).to.equal(field);
			});

			it('should set the operator', () => {
				expect(filter.operator).to.equal(operator);
			});

			it('should set the value', () => {
				expect(filter.value).to.equal(value);
			});
		});
	});

	describe('QueryFilterBuilder', () => {
		var builder: Filters.QueryFilterBuilder,
			field = 'foo',
			value = 'testing';

		before(() => {
			builder = new Filters.QueryFilterBuilder(field);
		});

		describe('constructor', () => {
			if('should set the field', () => {
				expect(builder.field).to.equal(field);
			});
		});

		data_driven(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'exists', 'startsWith', 'endsWith', 'contains'], () => {
			it('should return a QueryFilter instance', op => {
				var filter = builder[op](value);
				expect(filter).to.be.instanceof(Filters.QueryFilter);
			});

			it('should set the correct field', op => {
				var filter = builder[op](value);
				expect(filter.field).to.equal(field);
			});

			it('should set the correct value', op => {
				var filter = builder[op](value);
				expect(filter.value).to.equal(value);
			});

			it('should set the operator', op => {
				var filter = builder[op](value);
				expect(filter.operator).to.equal(op);
			});
		});
	});
});