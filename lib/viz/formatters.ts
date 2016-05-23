import moment = require('moment-timezone');
import Config = require('./config');
import d3 = require('./d3');
import _ = require('underscore');

export function format(format: string|Config.ValueFormatter): Config.ValueFormatter {
    if (!format) {
        return (value) => value;
    }
    
    if (_.isFunction(format)) {
        return <Config.IntervalValueFormatter>format;
    }
    
    return d3.format(format);
}

export function formatForInterval(format: string|Config.IntervalFormats|Config.IntervalValueFormatter, interval: string, timezone: string|number): Config.IntervalValueFormatter {
    if (_.isFunction(format)) {
        return <Config.IntervalValueFormatter>format;
    }
    
    if (_.isObject(format)) {
        format = format[interval] || Config.defaultTimeSeriesFormats[interval];
    }
    
    return (value) => formatDate(value, timezone, <string>format);
}

export function formatDate(dateToFormat: Date, timezone: string|number, format: string): string{
    var date = moment(dateToFormat);

    if (_.isString(timezone)){
        date = date.tz(<string>timezone);
    } else if (_.isNumber(timezone)){
        date = date.zone(<number>timezone);
    }

    return date.format(format);
}



