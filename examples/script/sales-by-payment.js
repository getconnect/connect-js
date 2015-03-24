var queryResults = require('./query-results.js').salesByPayment;

var fieldOptions = {
    'sellPriceTotal': {
        label: 'Sell Price',
        valueFormatter: d3.format('$,.2f')
    },
    'costPriceTotal': {
        label: 'Cost Price',
        valueFormatter: d3.format('$,.2f')
    },
    'paymentType': {
        label: 'Payment Type'
    }
}

var bar = new Connect.Viz.Chart('#sales-by-payment-bar', {
    title: 'Sales by Payment Type',
    type: 'bar',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});

var line = new Connect.Viz.Chart('#sales-by-payment-line', {
    title: 'Sales by Payment Type',
    type: 'line',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});

var table = new Connect.Viz.Table('#sales-by-payment-table', {
    title: 'Sales by Payment Type',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});

bar.displayData(queryResults.results, queryResults.metadata);
line.displayData(queryResults.results, queryResults.metadata);
table.displayData(queryResults.results, queryResults.metadata);

module.exports = {
    bar: bar,
    line: line,
    table: table
}