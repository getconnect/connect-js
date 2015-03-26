var queryResults = require('./query-results.js').salesOver15Mins;

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

var bar = new Connect.Viz.Chart('#sales-over-15-mins-bar', {
    title: 'Sales Over 15 Minutes',
    type: 'bar',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});

var line = new Connect.Viz.Chart('#sales-over-15-mins-line', {
    title: 'Sales Over 15 Minutes',
    type: 'line',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});

var spline = new Connect.Viz.Chart('#sales-over-15-mins-spline', {
    title: 'Sales Over 15 Minutes',
    type: 'spline',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});

var table = new Connect.Viz.Table('#sales-over-15-mins-table', {
    title: 'Sales Over 15 Minutes',
    fieldOptions: fieldOptions,
    intervalOptions: {
        label: 'Time'
    },
    yAxisValueFormatter: d3.format('$,.2f')
});

var timezone = new Connect.Viz.Chart('#sales-over-15-mins-timezone', {
    title: 'Sales Over 15 Minutes in Asia/Tokyo Timezone',
    type: 'line',
    timezone: 'Asia/Tokyo',
    fieldOptions: fieldOptions,
    yAxisValueFormatter: d3.format('$,.2f')
});

bar.displayData(queryResults.results, queryResults.metadata);
line.displayData(queryResults.results, queryResults.metadata);
spline.displayData(queryResults.results, queryResults.metadata);
timezone.displayData(queryResults.results, queryResults.metadata);
table.displayData(queryResults.results, queryResults.metadata)

module.exports = {
    bar: bar,
    line: line,
    spline: spline,
    timezone: timezone,
    table: table
}