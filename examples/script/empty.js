var connect = require('./connection.js');
var emptyProvider = require('./query-results.js').empty;

var bar = connect.chart(emptyProvider, '#empty-bar', {
    title: 'Sales',
    chart: {
        type: 'bar'
    }
});

var table = connect.table(emptyProvider, '#empty-table', {
    title: 'Sales'
});

var text = connect.text(emptyProvider, '#empty-text', {
    title: 'Sales'
});

var gauge = connect.gauge(emptyProvider, '#empty-gauge', {
    title: 'Market (%)',
});

module.exports = {
    bar: bar,
    text: text,
    table: table,
    gauge: gauge
};