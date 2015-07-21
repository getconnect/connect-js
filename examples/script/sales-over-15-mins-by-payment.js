var connect = require('./connection.js');
var salesOver15MinsByPaymentProvider = require('./query-results.js').salesOver15MinsByPayment;
var sellPriceOver15MinsByPaymentProvider = require('./query-results.js').sellPriceOver15MinsByPayment;

var valueFormatter = Connect.Viz.format('$,.2f'),
    fieldOptions = {
        'sellPriceTotal': {
            label: 'Sell Price',
            valueFormatter: valueFormatter
        },
        'costPriceTotal': {
            label: 'Cost Price',
            valueFormatter: valueFormatter
        }
    },
    yAxis = {
        valueFormatter: valueFormatter
    };

var bar = connect.chart(salesOver15MinsByPaymentProvider, '#sales-over-15-mins-by-payment-bar', {
    title: 'Sales Over 15 Minutes by Payment Type',
    chart: {
        type: 'bar',
        yAxis: yAxis,
    },
    fields: fieldOptions 
});

var line = connect.chart(salesOver15MinsByPaymentProvider, '#sales-over-15-mins-by-payment-line', {
    title: 'Sales Over 15 Minutes by Payment Type',
    chart: {
        type: 'line',
        yAxis: yAxis,
    },    
    fields: fieldOptions,
});

var sellPriceLine = connect.chart(sellPriceOver15MinsByPaymentProvider, '#sell-price-over-15-mins-by-payment-line', {
    title: 'Sales Over 15 Minutes by Payment Type (Sell Price)',
    chart: {
        type: 'line',
        yAxis: yAxis,
    }, 
    fields: fieldOptions,
});

var spline = connect.chart(salesOver15MinsByPaymentProvider, '#sales-over-15-mins-by-payment-spline', {
    title: 'Sales Over 15 Minutes by Payment Type',
    chart: {
        type: 'spline',
        yAxis: yAxis,
    }, 
    type: 'spline',
    fields: fieldOptions,
});

var areaSpline = connect.chart(salesOver15MinsByPaymentProvider, '#sales-over-15-mins-by-payment-stacked', {
    title: 'Sales Over 15 Minutes by Payment Type',
    chart: {
        type: 'area-spline',
        yAxis: yAxis,
        stack: true
    }, 
    type: 'spline',
    fields: fieldOptions,
});

module.exports = {
    bar: bar,
    line: line,
    sellPriceLine: sellPriceLine,
    spline: spline
}