import Config = require('./config');
import _ = require('underscore');

module Palette{
    var defaultSwatch = ['#1abc9c', '#3498db', '#9b59b6', '#34495e', '#1abc9c', '#bdc3c7', '#95a5a6', '#e74c3c', '#e67e22', '#f1c40f'];
    export function getSwatch(colors? : string[]) : string[] {
		return colors || defaultSwatch;
	};
}

export = Palette;