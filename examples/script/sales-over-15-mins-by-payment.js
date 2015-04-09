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
    chart: {
        type: 'bar',        
        yAxisValueFormatter: d3.format('$,.2f'),
        colors: ['#9b59b6', '#34495e', '#1abc9c', '#bdc3c7', '#95a5a6', '#e74c3c', '#e67e22', '#f1c40f', '#1abc9c', '#3498db'],
    },
    fields: fieldOptions 
});

var line = new Connect.Viz.Chart('#sales-over-15-mins-by-payment-line', {
    title: 'Sales Over 15 Minutes by Payment Type',
    chart: {
        type: 'line',        
        yAxisValueFormatter: d3.format('$,.2f'),
    },    
    fields: fieldOptions,
});

var sellPriceLine = new Connect.Viz.Chart('#sell-price-over-15-mins-by-payment-line', {
    title: 'Sales Over 15 Minutes by Payment Type (Sell Price)',
    chart: {
        type: 'line',        
        yAxisValueFormatter: d3.format('$,.2f'),
    }, 
    fields: fieldOptions,
});

var spline = new Connect.Viz.Chart('#sales-over-15-mins-by-payment-spline', {
    title: 'Sales Over 15 Minutes by Payment Type',
    chart: {
        type: 'spline',        
        yAxisValueFormatter: d3.format('$,.2f'),
    }, 
    type: 'spline',
    fields: fieldOptions,
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