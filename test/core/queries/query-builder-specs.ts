import chai = require('chai');
import QueryBuilder = require('../../../lib/core/queries/query-builder');
import Selects = require('../../../lib/core/queries/selects');
import Filters = require('../../../lib/core/queries/filters');
import Timeframes = require('../../../lib/core/queries/timeframes');

var expect = chai.expect;

describe('QueryBuilder', () => {
	describe('#build()', () => {
		var builder: QueryBuilder = new QueryBuilder();

		it('should add select to query', () => {
			var selects: Selects.QuerySelects = {
				count: 'count',
				total: { sum: 'field1' },
				average: { avg: 'field2' }
			};

			var result = builder.build(selects, [], [], null, null, null);
			expect(result.select).to.deep.equal({
				count: 'count',
				total: { sum: 'field1' },
				average: { avg: 'field2' }
			});
		});

		it('should add filter to query', () => {
			var filters = [
				new Filters.QueryFilter('name', 'eq', 'bob'),
				new Filters.QueryFilter('age', 'gt', 50)
			];

			var result = builder.build({}, filters, [], null, null, null);

			expect(result.filter).to.deep.equal({
				age: { gt: 50 },
				name: { eq: 'bob' }
			});
		});

		it('should add groupby to query', () => {
			var groups = ['field1', 'field2'],
				result = builder.build({}, [], groups, null, null, null);

			expect(result.groupBy).to.deep.equal(groups);
		});

		it('should add string timeframe to query', () => {
			var timeframe = 'today',
				result = builder.build({}, [], [], timeframe, null, null);

			expect(result.timeframe).to.equal(timeframe);
		});

		it('should add absolute timeframe to query', () => {
			var timeframe = new Timeframes.AbsoluteTimeframe(new Date(), new Date()),
				result = builder.build({}, [], [], timeframe, null, null);

			expect(result.timeframe).to.deep.equal({
				start: timeframe.start,
				end: timeframe.end	
			});
		});

		it('should add absolute timeframe with only start to query', () => {
			var timeframe = new Timeframes.AbsoluteTimeframe(new Date(), null),
				result = builder.build({}, [], [], timeframe, null, null);

			expect(result.timeframe).to.deep.equal({
				start: timeframe.start
			});
		});

		it('should add absolute timeframe with only end to query', () => {
			var timeframe = new Timeframes.AbsoluteTimeframe(null, new Date()),
				result = builder.build({}, [], [], timeframe, null, null);

			expect(result.timeframe).to.deep.equal({
				end: timeframe.end
			});
		});

		it('should add current relative timeframe to query', () => {
			var timeframe = new Timeframes.RelativeTimeframe(true, 2, 'days'),
				result = builder.build({}, [], [], timeframe, null, null);

			expect(result.timeframe).to.deep.equal({
				current: { days: 2 }
			});
		});

		it('should add last relative timeframe to query', () => {
			var timeframe = new Timeframes.RelativeTimeframe(false, 2, 'weeks'),
				result = builder.build({}, [], [], timeframe, null, null);

			expect(result.timeframe).to.deep.equal({
				previous: { weeks: 2 }
			});
		});

		it('should add string based timezone', () => {
			var timezone = 'Australia/Brisbane',
				timeframe = new Timeframes.RelativeTimeframe(false, 2, 'weeks'),
				result = builder.build({}, [], [], timeframe, null, timezone);

			expect(result.timezone).to.equal(timezone);
		});

		it('should add offset based timezone', () => {
			var timezone = -5,
				timeframe = new Timeframes.RelativeTimeframe(false, 2, 'weeks'),
				result = builder.build({}, [], [], timeframe, null, timezone);

			expect(result.timezone).to.equal(timezone);
		});

		it('should add interval', () => {
			var interval = 'daily',
				result = builder.build({}, [], [], null, interval, null);

			expect(result.interval).to.equal(interval);
		});
	});
});