import chai = require('chai');
import data_driven = require('mocha-data-driven');
import proxyquire = require('proxyquire');
import sinon = require('sinon');
import Api = require('../../../lib/core/api');
import Queries = require('../../../lib/core/queries/queries');
import Selects = require('../../../lib/core/queries/selects');
import Filters = require('../../../lib/core/queries/filters');
import Timeframes = require('../../../lib/core/queries/timeframes');
import QueryBuilder = require('../../../lib/core/queries/query-builder');

var expect = chai.expect,
 	Q = require('Q');

describe('Queries', () => {
	describe('ConnectQuery', () => {
		var client: any = sinon.createStubInstance(Api.Client);

		describe('constructor', () => {
			var collection = 'foos',
				query = new Queries.ConnectQuery(client, collection);

			it('should set the query collection', () => {
				expect(query._collection).to.equal(collection);
			});
		});

		describe('#select()', () => {
			var query = new Queries.ConnectQuery(client, 'test');

			it('should set select with built filter', () => {
				var field = 'price';

				query = query.select({
					count: 'count',
					total: { sum: field },
					averageQty: { avg: field }
				});

				expect(query._selects).to.deep.equal({
					count: 'count',
					total: { sum: field },
					averageQty: { avg: field }
				});
			});

			it('should return a new query instance', () => {
				var query = new Queries.ConnectQuery(client, 'test');
				var query2 = query.select({
					sum: { sum: 'test' }
				});

				expect(query2).to.not.equal(query);
			});

			it('should not allow two aggregations in one select', () => {
				expect(() => query.select({a: {sum: 'a', avg: 'b'}})).to.throw(Error);
			});
		});

		describe('#filter()', () => {
			var builder,
				query: Queries.ConnectQuery;

			beforeEach(() => {
				builder = sinon.stub();

				var QueriesProxy = proxyquire('../../../lib/core/queries/queries', {
					'./filters': {
						QueryFilterBuilder: builder
					}	
				});

				query = new QueriesProxy.ConnectQuery(client, 'test');
			});

			it('should add a single filter', () => {
				var field = 'field',
					fieldFilter = sinon.createStubInstance(Filters.QueryFilter),
					fieldBuilder = sinon.createStubInstance(Filters.QueryFilterBuilder);

				builder.withArgs(field).returns(fieldBuilder);
				fieldBuilder['eq'].withArgs(10).returns(fieldFilter)

				query = query.filter(x => x(field).eq(10));
				expect(query._filters).to.contain(fieldFilter);
			});

			it('should add multiple filters', () => {
				var field1 = 'field1',
					field2 = 'field2',
					field1Filter = new Filters.QueryFilter(field1, 'eq', 10),
					field2Filter = new Filters.QueryFilter(field2, 'gt', 20),
					field1Builder = sinon.createStubInstance(Filters.QueryFilterBuilder),
					field2Builder = sinon.createStubInstance(Filters.QueryFilterBuilder);

				builder.withArgs(field1).returns(field1Builder);
				field1Builder['eq'].withArgs(10).returns(field1Filter);

				builder.withArgs(field2).returns(field2Builder);
				field2Builder['gt'].withArgs(20).returns(field2Filter);

				query = query.filter(x => x(field1).eq(10));
				query = query.filter(x => x(field2).gt(20));
				expect(query._filters).to.contain(field1Filter);
				expect(query._filters).to.contain(field2Filter);
			});

			it('should return a new query instance', () => {
				var query = new Queries.ConnectQuery(client, 'test');
				var query2 = query.filter(x => x('test').eq(10));

				expect(query2).to.not.equal(query);
			});

			it('should not allow to add same filter for same field', () => {
				var query = new Queries.ConnectQuery(client, 'test');	
				query = query.filter(x => x('name').eq('bob'));

				expect(() => query.filter(x => x('name').eq('bob'))).to.throw(Error);
			});
		});

		describe('#timeframe()', () => {
			it('should set simple string timeframe', () => {
				var timeframe = 'today',
					query = new Queries.ConnectQuery(client, 'test');

				query = query.timeframe(timeframe);
				expect(query._timeframe).to.equal(timeframe);
			});

			it('should set complex timeframe', () => {
				var builder = sinon.createStubInstance(Timeframes.TimeframeBuilder),
					QueriesProxy = proxyquire('../../../lib/core/queries/queries', {
						'./timeframes': {
							TimeframeBuilder: () => builder
						}	
					}),
					query = new QueriesProxy.ConnectQuery('test');

				var start = new Date(),
					end = new Date(),
					timeframe = sinon.createStubInstance(Timeframes.AbsoluteTimeframe);

				builder['between'].withArgs(start, end).returns(timeframe);

				query = query.timeframe(x => {
					return x.between(start, end);	
				});

				expect(query._timeframe).to.equal(timeframe);
			});

			it('should return a new query instance', () => {
				var query = new Queries.ConnectQuery(client, 'test');
				var query2 = query.timeframe('today');

				expect(query2).to.not.equal(query);
			});
		});

		describe('#interval()', () => {
			var query = new Queries.ConnectQuery(client, 'test');				

			it('should set the timeframe', () => {
				var timeframe = 'daily';

				query = query.timeframe(timeframe);

				expect(query._timeframe).to.equal(timeframe);
			})
		});

		describe('#timezone()', () => {
			var query = new Queries.ConnectQuery(client, 'test');

			before(() => {
				query = query.timeframe('today');
			});

			it('should set a string based timezone', () => {
				var timezone = 'Australia/Brisbane';

				query = query.timezone(timezone);
				expect(query._timezone).to.equal(timezone);
			});

			it('should set an offset based timezone', () => {
				var timezone = -8;

				query = query.timezone(timezone);
				expect(query._timezone).to.equal(timezone);
			});

			it('should not allow to add timezone when there is no timeframe', () => {
				var query = new Queries.ConnectQuery(client, 'test');
				
				expect(() => query.timezone('Australia/Brisbane')).to.throw(Error);
			});

			it('should return a new query instance', () => {
				var query2 = query.timezone('Australia/Brisbane');

				expect(query2).to.not.equal(query);
			});
		});

		describe('#groupBy()', () => {
			var query = new Queries.ConnectQuery(client, 'test');

			it('should set single groupBy', () => {
				var field = 'field';

				query = query.groupBy(field);
				expect(query._groups).to.contain(field);
			});

			it('should set multiple groupBy using multiple calls', () => {
				var field1 = 'field1',
					field2 = 'field2';	

				query = query.groupBy(field1);
				query = query.groupBy(field2);
				expect(query._groups).to.contain(field1);
				expect(query._groups).to.contain(field2);
			});

			it('should set multiple groupBy using array', () => {
				var fields = ['field1', 'field2'];

				query = query.groupBy(fields);
				expect(query._groups).to.contain(fields[0]);
				expect(query._groups).to.contain(fields[1]);
			});

			it('should return a new query instance', () => {
				var query = new Queries.ConnectQuery(client, 'test');
				var query2 = query.groupBy('test');

				expect(query2).to.not.equal(query);
			});
		});

		describe('#execute()', () => {
			var builder = sinon.createStubInstance(QueryBuilder),
				QueriesProxy = proxyquire('../../../lib/core/queries/queries', {
					'./query-builder': () => builder
				}),
				stubClient = sinon.createStubInstance(Api.Client),
				query = new QueriesProxy.ConnectQuery(stubClient, 'test');		

			beforeEach(() => {
				query.select(x => {
					return {
						sum: x.sum('price')
					};
				})
				.filter(x => x('price').gt(10))
				.groupBy('product')
				.timeframe('today');
			});

			it('should execute build query using api client', done => {
				var apiQuery = sinon.stub(),
					expectedResult = sinon.stub();

				builder['build'].withArgs(query._selects, query._filters, query._groups, query._timeframe)
					.returns(apiQuery);

				stubClient['query'].withArgs(query._collection, apiQuery)
					.returns(new Q(expectedResult));

				query.execute()
					.then(result => {
						expect(result).to.equal(expectedResult);
						done();
					});
			});
		});
	});
});