import moment = require('moment-timezone');
import _ = require('underscore');

export function formatDate(dateToFormat: Date, timezone: string|number, format: string): string{
    var date = moment(dateToFormat);

    if (_.isString(timezone)){
        date = date.tz(<string>timezone);
    } else if (_.isNumber(timezone)){
        date = date.zone(<number>timezone);
    }

    return date.format(format);
}