import chai = require('chai');
import data_driven = require('mocha-data-driven');
import proxyquire = require('proxyquire');
import sinon = require('sinon');
import Api = require('../../../lib/core/api');
import Queries = require('../../../lib/core/queries/queries');
import Selects = require('../../../lib/core/queries/selects');
import Filters = require('../../../lib/core/queries/filters');
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
						queryFilterBuilder: builder
					}
				});

				query = new QueriesProxy.ConnectQuery(client, 'test');
			});

			it('should add a single filter', () => {
				var field = 'field',
					fieldValue = 10,
					filterSpec = {},
					fieldFilter = new Filters.QueryFilter('field', 'eq', 10);

				filterSpec[field] = fieldValue;

				builder.withArgs(fieldValue, field).returns(fieldFilter);

				query = query.filter(filterSpec);
				expect(query._filters).to.contain(fieldFilter);
			});

			it('should add multiple filters', () => {
				var field1 = 'field1',
					field2 = 'field2',
					field1Value =  { eq: 10 },
					field2Value =  { gt: 20 },
					filterSpec = {},
					field1Filter = new Filters.QueryFilter(field1, 'eq', 10),
					field2Filter = new Filters.QueryFilter(field2, 'gt', 20);

				filterSpec[field1] = field1Value;
				filterSpec[field2] = field2Value;

				builder.withArgs(field1Value, field1).returns([field1Filter]);
				builder.withArgs(field2Value, field2).returns([field2Filter]);

				query = query.filter(filterSpec);
				expect(query._filters).to.contain(field1Filter);
				expect(query._filters).to.contain(field2Filter);
			});

			it('should return a new query instance', () => {
				var query = new Queries.ConnectQuery(client, 'test');
				var query2 = query.filter({test: 10});

				expect(query2).to.not.equal(query);
			});

			it('should use last filter specification of operator and field', () => {
				var field1 = 'field1',
					field1Value =  { eq: 10 },
					field2Value =  { gt: 20 },
					filterSpec1 = {},
					filterSpec2 = {},
					field1Filter = new Filters.QueryFilter(field1, 'eq', 10),
					field2Filter = new Filters.QueryFilter(field1, 'eq', 20);

				filterSpec1[field1] = field1Value;
				filterSpec2[field1] = field2Value;

				builder.withArgs(field1Value, field1).returns([field1Filter]);
				builder.withArgs(field2Value, field1).returns([field2Filter]);

				query = query.filter(filterSpec1);
				query = query.filter(filterSpec2);
				expect(query._filters).not.to.contain(field1Filter);
				expect(query._filters).to.contain(field2Filter);
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
				var query = new Queries.ConnectQuery(client, 'test'),
					timeframe = {
						start: new Date(),
						end: new Date()
					};

				query = query.timeframe(timeframe);

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
					expectedResult = sinon.stub(),
                    deferred = Q.defer();

				builder['build'].withArgs(query._selects, query._filters, query._groups, query._timeframe)
					.returns(apiQuery);

				stubClient['query'].withArgs(query._collection, apiQuery)
					.returns({deferred: deferred, request: sinon.stub()});

				query.execute()
					.then(result => {
						expect(result).to.equal(expectedResult);
						done();
					});

                deferred.resolve(expectedResult);
			});
		});

        describe('#abort()', () => {
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

			it('should abort all running queries', () => {
				var apiQuery = sinon.stub(),
					expectedResult = sinon.stub(),
                    runningRequest = {abort: function() {}};

                var requestAborted = sinon.spy(runningRequest, "abort");

				builder['build'].withArgs(query._selects, query._filters, query._groups, query._timeframe)
					.returns(apiQuery);

				stubClient['query'].withArgs(query._collection, apiQuery)
					.returns({deferred: Q.defer(), request: runningRequest});

				var promise = query.execute();
                query.abort();

                expect(requestAborted.calledOnce).to.be.true;
                expect(promise.isRejected()).to.be.true;
			});

		});
	});
});
