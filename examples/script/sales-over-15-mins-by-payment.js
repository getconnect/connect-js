var queryResults = require('./query-results.js').salesOver15MinsByPayment;
var sellPriceResults = require('./query-results.js').sellPriceOver15MinsByPayment;

var fieldOptions = {
    'sellPriceTotal': {
        label: 'Sell Price',
        valueFormatter: d3.format('$,.2f')
    },
    'costPriceTotal': {
        label: 'Cost Price',
        valueFormatter: d3.format('$,.2f')
    }
}

var bar = new Connect.Viz.Chart('#sales-over-15-mins-by-payment-bar', {
    title: 'Sales Over 15 Minutes by Payment Type',
    type: 'bar',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});


var line = new Connect.Viz.Chart('#sales-over-15-mins-by-payment-line', {
    title: 'Sales Over 15 Minutes by Payment Type',
    type: 'line',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});

var sellPriceLine = new Connect.Viz.Chart('#sell-price-over-15-mins-by-payment-line', {
    title: 'Sales Over 15 Minutes by Payment Type (Sell Price)',
    type: 'line',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});


var spline = new Connect.Viz.Chart('#sales-over-15-mins-by-payment-spline', {
    title: 'Sales Over 15 Minutes by Payment Type',
    type: 'spline',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});

bar.displayData(queryResults.results, queryResults.metadata);
line.displayData(queryResults.results, queryResults.metadata);
sellPriceLine.displayData(sellPriceResults.results, sellPriceResults.metadata);
spline.displayData(queryResults.results, queryResults.metadata);

module.exports = {
    bar: bar,
    line: line,
    sellPriceLine: sellPriceLine,
    spline: spline
}