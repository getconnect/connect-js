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
    chart: {
        type: 'bar',        
        yAxisValueFormatter: d3.format('$,.2f')
    },
    fields: fieldOptions,
});

var barNoLegend = new Connect.Viz.Chart('#sales-by-payment-bar-no-legend', {
    title: 'Sales by Payment Type (No Legend)',
    chart: {
        type: 'bar',
        yAxisValueFormatter: d3.format('$,.2f')
    },
    fields: fieldOptions,
    showLegend: false,
});

var line = new Connect.Viz.Chart('#sales-by-payment-line', {
    title: 'Sales by Payment Type',
    chart: {
        type: 'line',
        yAxisValueFormatter: d3.format('$,.2f')
    },
    fields: fieldOptions,
});

var table = new Connect.Viz.Table('#sales-by-payment-table', {
    title: 'Sales by Payment Type',
    fields: fieldOptions,
});

bar.displayData(queryResults.results, queryResults.metadata);
barNoLegend.displayData(queryResults.results, queryResults.metadata);
line.displayData(queryResults.results, queryResults.metadata);
table.displayData(queryResults.results, queryResults.metadata);

module.exports = {
    bar: bar,
    barNoLegend: barNoLegend,
    line: line,
    table: table
}