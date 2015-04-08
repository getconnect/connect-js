var queryResults = require('./query-results.js').salesByPayment;

var text = new Connect.Viz.Text('#invalid-text', {
    title: 'Sales'
});

text.displayData(queryResults.results, queryResults.metadata);

module.exports = {
    text: text
};