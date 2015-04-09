var results = require('./query-results.js');
var percentResults = results.marketSharePercent;
var dollarsResults = results.marketShareDollars;

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

var percentGauge = new Connect.Viz.Gauge('#market-share-percent-gauge', {
    title: 'Acme Market Share (%)',
    fields: percentFieldOptions
});
percentGauge.displayData(percentResults.results, percentResults.metadata);

var dollarsGauge = new Connect.Viz.Gauge('#market-share-dollars-gauge', {
    title: 'Acme Market Share ($)',
    fields: dollarsFieldOptions,
    gauge:{
    	min: 0,
    	max: 'totalMarketValue'
    }
});
dollarsGauge.displayData(dollarsResults.results, dollarsResults.metadata);

module.exports = {
    percentGauge: percentGauge,
    dollarsGauge: dollarsGauge
}