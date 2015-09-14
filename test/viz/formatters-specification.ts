/// <reference path="../../typings/chai/chai.d.ts" />
/// <reference path="../../typings/mocha/mocha.d.ts" />
import chai = require('chai');

import moment = require('moment-timezone');
import Config = require('../../lib/viz/config');
import Formatters = require('../../lib/viz/formatters');

var expect = chai.expect;

describe('Formatters', () => {
	
	describe('#format()', () => {
	
		describe('when a format string is provided', () => {
			var formatString = '$,.2f';
			var result = Formatters.format(formatString);
			
			it('should return a function', () => {
				expect(result).to.be.a('function');
			});
			
			it('should return a function that applies the given format', () => {
				var valueToFormat = 23459;
				var expextedValue = '$23,459.00';
				var valueFromResult = result(valueToFormat);
				
				expect(valueFromResult).to.equal(expextedValue);
			});
			
		});

		describe('when a function is provided', () => {
			var valueToFormat = 23459;
			var expextedValue = 'yay';
			var formatFunction = (value) => expextedValue;
			var result = Formatters.format(formatFunction);
			
			it('should return an equivelent function', () => {
				var valueFromResult = result(valueToFormat);
				expect(valueFromResult).to.equal(expextedValue);
			});

		});

	});
	
	describe('#formatForInterval()', () => {
	
		describe('when a format string is provided', () => {
			var timezone = 'Australia/Brisbane';
			var formatString = 'DD/MM';
			var result = Formatters.formatForInterval(formatString, 'hourly', timezone);
			
			it('should return a function', () => {
				expect(result).to.be.a('function');
			});
			
			it('should use the format string specified', () => {
				var date = moment();
				var result = Formatters.formatForInterval(formatString, 'hourly', timezone);
				var expectedResult = date.tz(timezone).format(formatString);
				var resultOutput = result(date.toDate());
				expect(resultOutput).to.equal(expectedResult);
			});
			
		});

		describe('when a function is provided', () => {
			var expextedValue = 'yay';
			var formatFunction = (value) => expextedValue;
			var result = Formatters.formatForInterval(formatFunction, 'hourly', 'Australia/Brisbane');
			
			it('should return a function', () => {
				expect(result).to.be.a('function');
			});
			
			it('should return an equivelent function', () => {
				var valueFromResult = result(new Date());
				expect(valueFromResult).to.equal(expextedValue);
			});

		});
		
		describe('when an object is provided', () => {
			var timezone = 'Australia/Brisbane';
			var hourlyFormat = 'HH'
			var formats: Config.IntervalFormats = { hourly: hourlyFormat };
			
			it('should return a function', () => {
				var result = Formatters.formatForInterval(formats, 'hourly', timezone);
				expect(result).to.be.a('function');
			});
			
			it('should use the format specifed for the interval if it is provided object', () => {
				var date = moment();
				var result = Formatters.formatForInterval(formats, 'hourly', timezone);
				var expectedResult = date.tz(timezone).format(hourlyFormat);
				var resultOutput = result(date.toDate());
				expect(resultOutput).to.equal(expectedResult);
			});
			
			it('should use the deafult format if an interval is not defined in provided object', () => {
				var date = moment();
				var interval = 'monthly';
				var defaultFormat = Config.defaultTimeSeriesFormats[interval];
				var result = Formatters.formatForInterval(formats, interval, timezone);
				var expectedResult = date.tz(timezone).format(defaultFormat);
				var resultOutput = result(date.toDate());
				expect(resultOutput).to.equal(expectedResult);
			});

		});

	});
	
});