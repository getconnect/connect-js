import chai = require('chai');
import data_driven = require('mocha-data-driven');
import Timeframes = require('../../../lib/core/queries/timeframes');

var expect = chai.expect;

describe('Timeframes', () => {
	describe('AbsoluteTimeframe', () => {
		describe('constructor', () => {
			it('should be able to be constructed with only a start date', () => {
				var start = new Date(),
					timeframe = new Timeframes.AbsoluteTimeframe(start);

				expect(timeframe.start).to.equal(start);
				expect(timeframe.end).to.not.exist;
			});

			it('should be able to be constructed with only an end date', () => {
				var end = new Date(),
					timeframe = new Timeframes.AbsoluteTimeframe(null, end);

				expect(timeframe.start).to.not.exist;
				expect(timeframe.end).to.equal(end);
			});

			it('should be able to be constructed with a start and end date', () => {
				var start = new Date(),
					end = new Date(),
					timeframe = new Timeframes.AbsoluteTimeframe(start, end);

				expect(timeframe.start).to.equal(start);
				expect(timeframe.end).to.equal(end);
			});
		});
	});

	describe('RelativeTimeframe', () => {
		describe('constructor', () => {
			var current = true,
				length = 2,
				period = 'days',
				timeframe: Timeframes.RelativeTimeframe;

			before(() => {
				timeframe = new Timeframes.RelativeTimeframe(current, length, period);
			});

			it('should set the isCurrent', () => {
				expect(timeframe.isCurrent).to.equal(current);
			});

			it('should set the length', () => {
				expect(timeframe.length).to.equal(length);
			});

			it('should set the period', () => {
				expect(timeframe.period).to.equal(period);
			});
		});

		describe('#direction()', () => {
			it('should return current when timeframe is current', () => {
				var timeframe = new Timeframes.RelativeTimeframe(true, 1, 'days');

				expect(timeframe.direction()).to.equal('current');
			});

			it('should return previous when timeframe is not current', () => {
				var timeframe = new Timeframes.RelativeTimeframe(false, 1, 'days');

				expect(timeframe.direction()).to.equal('previous');
			});
		});
	});

	describe('TimeframeBuilder', () => {
		var builder: Timeframes.TimeframeBuilder;

		before(() => {
			builder = new Timeframes.TimeframeBuilder();
		});

		describe('#from()', () => {
			var date = new Date(),
				timeframe: Timeframes.AbsoluteTimeframe;

			before(() => {
				timeframe = builder.from(date);
			});

			it('should return an instance of AbsoluteTimeframe', () => {
				expect(timeframe).to.be.instanceof(Timeframes.AbsoluteTimeframe);
			});

			it('should set the start date', () => {
				expect(timeframe.start).to.equal(date);
			});

			it('should not set an end date', () => {
				expect(timeframe.end).to.not.exist;
			});
		});

		describe('#to()', () => {
			var date = new Date(),
				timeframe: Timeframes.AbsoluteTimeframe;

			before(() => {
				timeframe = builder.to(date);
			});

			it('should return an instance of AbsoluteTimeframe', () => {
				expect(timeframe).to.be.instanceof(Timeframes.AbsoluteTimeframe);
			});

			it('should set the end date', () => {
				expect(timeframe.end).to.equal(date);
			});

			it('should not set a start date', () => {
				expect(timeframe.start).to.not.exist;
			});
		});

		describe('#between()', () => {
			var date = new Date(),
				timeframe: Timeframes.AbsoluteTimeframe;

			before(() => {
				timeframe = builder.between(date, date);
			});

			it('should return an instance of AbsoluteTimeframe', () => {
				expect(timeframe).to.be.instanceof(Timeframes.AbsoluteTimeframe);
			});

			it('should set the start date', () => {
				expect(timeframe.start).to.equal(date);
			});

			it('should set the end date', () => {
				expect(timeframe.end).to.equal(date);
			});
		});

		describe('#current()', () => {
			var length = 2,
				period = 'days',
				timeframe: Timeframes.RelativeTimeframe;

			before(() => {
				timeframe = builder.current(length, period);
			});

			it('should return an instance of RelativeTimeframe', () => {
				expect(timeframe).to.be.instanceof(Timeframes.RelativeTimeframe);
			});

			it('should set isCurrent to true', () => {
				expect(timeframe.isCurrent).to.be.true;
			});

			it('should set the length', () => {
				expect(timeframe.length).to.equal(length);;
			});

			it('should set the period', () => {
				expect(timeframe.period).to.equal(period);;
			});
		});

		describe('#last()', () => {
			var length = 2,
				period = 'days',
				timeframe: Timeframes.RelativeTimeframe;

			before(() => {
				timeframe = builder.last(length, period);
			});

			it('should return an instance of RelativeTimeframe', () => {
				expect(timeframe).to.be.instanceof(Timeframes.RelativeTimeframe);
			});

			it('should set isCurrent to false', () => {
				expect(timeframe.isCurrent).to.be.false;
			});

			it('should set the length', () => {
				expect(timeframe.length).to.equal(length);;
			});

			it('should set the period', () => {
				expect(timeframe.period).to.equal(period);;
			});
		});
	});
});