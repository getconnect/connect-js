var connect = require('./connection.js');
var salesProvider = require('./query-results.js').sales;
var sellPriceProvider = require('./query-results.js').salesSellPrice;

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

var bar = connect.chart(salesProvider, '#sales-bar', {
    title: 'Sales',
    chart: {
        type: 'bar',
        yAxis: yAxis
    }, 
    fields: fieldOptions,
});

var line = connect.chart(salesProvider, '#sales-line', {
    title: 'Sales',
    chart: {
        type: 'line',
        yAxis: yAxis
    },
    fields: fieldOptions,
});

var text = connect.text(sellPriceProvider, '#sales-text', {
    title: 'Sales',
    fields: fieldOptions
});

module.exports = {
    bar: bar,
    line: line,
    text: text
};