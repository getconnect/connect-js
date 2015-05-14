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
		var field = 'foo',
			value = 'testing',
			allOperators = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'exists', 'startsWith', 'endsWith', 'contains', 'in'];

		it('should default string to be "eq" operator', () => {
			var filterValue = 'testing',
				defaultOp = 'eq',
				filter = Filters.queryFilterBuilder(filterValue, field)[0];

			expect(filter.operator).to.equal(defaultOp);
		});

		it('should default number to be "eq" operator', () => {
			var filterValue = 5,
				defaultOp = 'eq',
				filter = Filters.queryFilterBuilder(filterValue, field)[0];

			expect(filter.operator).to.equal(defaultOp);
		});

		it('should default array to be "in" operator', () => {
			var filterValue = ['testing'],
				defaultOp = 'in',
				filter = Filters.queryFilterBuilder(filterValue, field)[0];

			expect(filter.operator).to.equal(defaultOp);
		});

		it('should be an empty array for an object with no properties', () => {
			var filterValue = 'testing',
				filters = Filters.queryFilterBuilder({}, field);

			expect(filters).to.be.empty;
		});

		it('should be an empty array for null', () => {
			var filterValue = 'testing',
				filters = Filters.queryFilterBuilder({}, field);

			expect(filters).to.be.empty;
		});

		it('should create a filter for each operator property in filter spec', () => {
			var filterValue = {};
			
			allOperators.forEach(op => {
				filterValue[op] = op + 'Value';
			});
			
			var filters = Filters.queryFilterBuilder(filterValue, field);
			expect(filters).to.have.length(allOperators.length);
		});


		it('should use the correct value for operator in complex spec', () => {
			var filterValue = { lt: 10, gt: 5 },
				field = 'field';
			
			var filters = Filters.queryFilterBuilder(filterValue, field);
			expect(filters[0]).to.deep.equal(new Filters.QueryFilter(field, 'lt', 10));
			expect(filters[1]).to.deep.equal(new Filters.QueryFilter(field, 'gt', 5));
		});		

		data_driven(allOperators, () => {
			it('should return a QueryFilter instance', op => {
				var filterValue = {},
					filter;
				
				filterValue[op] = value;
				filter = Filters.queryFilterBuilder(filterValue, field)[0];

				filterValue[op] = value;
				expect(filter).to.be.instanceof(Filters.QueryFilter);
			});

			it('should set the correct field', op => {
				var filterValue = {},
					filter;
				
				filterValue[op] = value;
				filter = Filters.queryFilterBuilder(filterValue, field)[0];

				filterValue[op] = value;
				expect(filter.field).to.equal(field);
			});

			it('should set the correct value', op => {
				var filterValue = {},
					filter;
				
				filterValue[op] = value;
				filter = Filters.queryFilterBuilder(filterValue, field)[0];

				filterValue[op] = value;
				expect(filter.value).to.equal(value);
			});

			it('should set the operator', op => {
				var filterValue = {},
					filter;
				
				filterValue[op] = value;
				filter = Filters.queryFilterBuilder(filterValue, field)[0];

				expect(filter.operator).to.equal(op);
			});
		});

	});
});