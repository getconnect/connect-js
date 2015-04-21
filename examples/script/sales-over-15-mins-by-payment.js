var connect = require('./connection.js');
var salesOver15MinsByPaymentProvider = require('./query-results.js').salesOver15MinsByPayment;
var sellPriceOver15MinsByPaymentProvider = require('./query-results.js').sellPriceOver15MinsByPayment;

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

var bar = connect.chart(salesOver15MinsByPaymentProvider, '#sales-over-15-mins-by-payment-bar', {
    title: 'Sales Over 15 Minutes by Payment Type',
    chart: {
        type: 'bar',        
        yAxisValueFormatter: d3.format('$,.2f'),
        colors: ['#9b59b6', '#34495e', '#1abc9c', '#bdc3c7', '#95a5a6', '#e74c3c', '#e67e22', '#f1c40f', '#1abc9c', '#3498db'],
    },
    fields: fieldOptions 
});

var line = connect.chart(salesOver15MinsByPaymentProvider, '#sales-over-15-mins-by-payment-line', {
    title: 'Sales Over 15 Minutes by Payment Type',
    chart: {
        type: 'line',        
        yAxisValueFormatter: d3.format('$,.2f'),
    },    
    fields: fieldOptions,
});

var sellPriceLine = connect.chart(sellPriceOver15MinsByPaymentProvider, '#sell-price-over-15-mins-by-payment-line', {
    title: 'Sales Over 15 Minutes by Payment Type (Sell Price)',
    chart: {
        type: 'line',        
        yAxisValueFormatter: d3.format('$,.2f'),
    }, 
    fields: fieldOptions,
});

var spline = connect.chart(salesOver15MinsByPaymentProvider, '#sales-over-15-mins-by-payment-spline', {
    title: 'Sales Over 15 Minutes by Payment Type',
    chart: {
        type: 'spline',        
        yAxisValueFormatter: d3.format('$,.2f'),
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