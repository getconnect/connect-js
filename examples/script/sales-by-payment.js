var connect = require('./connection.js');
var salesByPaymentProvider = require('./query-results.js').salesByPayment;

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
    },
    valueFormatter = Connect.Viz.format('$,.2f'),
    yAxis = {
        valueFormatter: valueFormatter
    },
    tooltip = {
        valueFormatter: valueFormatter        
    };

var bar = connect.chart(salesByPaymentProvider, '#sales-by-payment-bar', {
    title: 'Sales by Payment Type',
    chart: {
        type: 'bar',
        yAxis: yAxis,
        tooltip: tooltip,
    },
    fields: fieldOptions
});

var barNoLegend = connect.chart(salesByPaymentProvider, '#sales-by-payment-bar-no-legend', {
    title: 'Sales by Payment Type (No Legend)',
    chart: {
        type: 'bar',  
        yAxis: yAxis,
        tooltip: tooltip,
        showLegend: false
    },
    fields: fieldOptions
});

var line = connect.chart(salesByPaymentProvider, '#sales-by-payment-line', {
    title: 'Sales by Payment Type',
    chart: {
        type: 'line',  
        yAxis: yAxis,
        tooltip: tooltip,
    },
    fields: fieldOptions
});

var table = connect.table(salesByPaymentProvider, '#sales-by-payment-table', {
    title: 'Sales by Payment Type',
    fields: fieldOptions,
});

module.exports = {
    bar: bar,
    barNoLegend: barNoLegend,
    line: line,
    table: table
}