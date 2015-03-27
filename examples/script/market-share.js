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

var percentGauge = new Connect.Viz.Chart('#market-share-percent-gauge', {
    title: 'Acme Market Share (%)',
    type: 'gauge',
    fieldOptions: percentFieldOptions
});
percentGauge.displayData(percentResults.results, percentResults.metadata);

var dollarsGauge = new Connect.Viz.Chart('#market-share-dollars-gauge', {
    title: 'Acme Market Share ($)',
    type: 'gauge',
    fieldOptions: dollarsFieldOptions,
    gauge:{
    	min: 0,
    	max: 27
    }
});
dollarsGauge.displayData(dollarsResults.results, dollarsResults.metadata);

module.exports = {
    percentGauge: percentGauge,
    dollarsGauge: dollarsGauge
}