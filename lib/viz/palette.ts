import Config = require('./config');
import _ = require('underscore');

module Palette{
    var defaultSwatch = ['#1abc9c', '#3498db', '#9b59b6', '#34495e', '#d35400', '#f1c40f', '#8e44ad', '#e67e22', '#7f8c8d', '#bdc3c7'];
    export function getSwatch(colors? : string[]) : string[] {
		return colors || defaultSwatch;
	};
}

export = Palette;