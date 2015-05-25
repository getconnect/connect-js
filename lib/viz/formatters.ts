import moment = require('moment-timezone');
import d3 = require('./d3');
import _ = require('underscore');

export function format(format: string): (any) => string {
    return d3.format(format);
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