var queryResults = require('./query-results.js').sales;
var sellPriceResults = require('./query-results.js').salesSellPrice;

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

var bar = new Connect.Viz.Chart('#sales-bar', {
    title: 'Sales',
    chart: {
        type: 'bar',        
        yAxisValueFormatter: d3.format('$,.2f'),
    }, 
    fields: fieldOptions,
});

var line = new Connect.Viz.Chart('#sales-line', {
    title: 'Sales',
    chart: {
        type: 'line',        
        yAxisValueFormatter: d3.format('$,.2f'),
    },
    fields: fieldOptions,
});

var text = new Connect.Viz.Text('#sales-text', {
    title: 'Sales',
    fields: fieldOptions
});

bar.displayData(queryResults.results, queryResults.metadata);
line.displayData(queryResults.results, queryResults.metadata);
text.displayData(sellPriceResults.results, sellPriceResults.metadata);

module.exports = {
    bar: bar,
    line: line,
    text: text
};