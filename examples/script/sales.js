var connect = require('./connection.js');
var salesProvider = require('./query-results.js').sales;
var sellPriceProvider = require('./query-results.js').salesSellPrice;

var fieldOptions = {
    'sellPriceTotal': {
        label: 'Sell Price',
        valueFormatter: Connect.Viz.format('$,.2f')
    },
    'costPriceTotal': {
        label: 'Cost Price',
        valueFormatter: Connect.Viz.format('$,.2f')
    }
}

var bar = connect.chart(salesProvider, '#sales-bar', {
    title: 'Sales',
    chart: {
        type: 'bar',        
        yAxisValueFormatter: Connect.Viz.format('$,.2f'),
    }, 
    fields: fieldOptions,
});

var line = connect.chart(salesProvider, '#sales-line', {
    title: 'Sales',
    chart: {
        type: 'line',        
        yAxisValueFormatter: Connect.Viz.format('$,.2f'),
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