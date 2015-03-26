var queryResults = require('./query-results.js').empty;

var bar = new Connect.Viz.Chart('#empty-bar', {
    title: 'Sales',
    type: 'bar'
});

var table = new Connect.Viz.Table('#empty-table', {
    title: 'Sales'
});

var text = new Connect.Viz.Text('#empty-text', {
    title: 'Sales'
});

var gauge = new Connect.Viz.Chart('#empty-gauge', {
    title: 'Market (%)',
    type: 'gauge'
});

bar.displayData(queryResults.results, queryResults.metadata);
table.displayData(queryResults.results, queryResults.metadata);
text.displayData(queryResults.results, queryResults.metadata);
gauge.displayData(queryResults.results, queryResults.metadata);

module.exports = {
    bar: bar,
    text: text,
    table: table,
    gauge: gauge
};