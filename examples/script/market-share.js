var connect = require('./connection.js');
var marketSharePercentProvider = require('./query-results.js').marketSharePercent;
var marketShareDollarsProvider = require('./query-results.js').marketShareDollars;

var percentFieldOptions = {
    share: {
        label: 'Share'
    }
}

var dollarsFieldOptions = {
    share: {
        label: 'Share',
        valueFormatter: function(value){
        	return d3.format('$,.0f')(value) + 'M'
        }
    }
}

var percentGauge = connect.gauge(marketSharePercentProvider, '#market-share-percent-gauge', {
    title: 'Acme Market Share (%)',
    fields: percentFieldOptions
});

var dollarsGauge = connect.gauge(marketShareDollarsProvider, '#market-share-dollars-gauge', {
    title: 'Acme Market Share ($)',
    fields: dollarsFieldOptions,
    gauge:{
    	min: 0,
    	max: 'totalMarketValue'
    }
});

module.exports = {
    percentGauge: percentGauge,
    dollarsGauge: dollarsGauge
}