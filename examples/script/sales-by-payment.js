var connect = require('./connection.js');
var salesByPaymentResults = require('./query-results.js');

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

var bar = connect.chart(salesByPaymentResults.salesByPayment, '#sales-by-payment-bar', {
    title: 'Sales by Payment Type',
    chart: {
        type: 'bar',
        yAxis: yAxis,
        tooltip: tooltip,
    },
    fields: fieldOptions
});

var barWithColorMod = connect.chart(salesByPaymentResults.salesByPaymentSellPrice, '#sales-by-payment-colored-bar', {
    title: 'Sales by Payment Type',
    chart: {
        type: 'bar',
        yAxis: yAxis,
        tooltip: tooltip,
        colorModifier: function(currentColor, context) {
            if (context.groupByValues[0] === 'cash')
                return '#f39c12'
            return currentColor;
        }
    },
    fields: fieldOptions
});

var barNoLegend = connect.chart(salesByPaymentResults.salesByPayment, '#sales-by-payment-bar-no-legend', {
    title: 'Sales by Payment Type (No Legend)',
    chart: {
        type: 'bar',  
        yAxis: yAxis,
        tooltip: tooltip,
        showLegend: false
    },
    fields: fieldOptions
});

var line = connect.chart(salesByPaymentResults.salesByPayment, '#sales-by-payment-line', {
    title: 'Sales by Payment Type',
    chart: {
        type: 'line',  
        yAxis: yAxis,
        tooltip: tooltip,
    },
    fields: fieldOptions
});

var table = connect.table(salesByPaymentResults.salesByPayment, '#sales-by-payment-table', {
    title: 'Sales by Payment Type',
    fields: fieldOptions,
});

module.exports = {
    bar: bar,
    barWithColorMod: barWithColorMod,
    barNoLegend: barNoLegend,
    line: line,
    table: table
}