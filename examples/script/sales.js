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
    type: 'bar',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});

var line = new Connect.Viz.Chart('#sales-line', {
    title: 'Sales',
    type: 'line',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});

var text = new Connect.Viz.Text('#sales-text', {
    title: 'Sales',
    fieldOptions: fieldOptions
});

bar.displayData(queryResults.results, queryResults.metadata);
line.displayData(queryResults.results, queryResults.metadata);
text.displayData(sellPriceResults.results, sellPriceResults.metadata);

module.exports = {
    bar: bar,
    line: line,
    text: text
};