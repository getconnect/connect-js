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
    chart: {
        type: 'bar',        
        yAxisValueFormatter: d3.format('$,.2f'),
    }, 
    fields: fieldOptions,
});

var line = new Connect.Viz.Chart('#sales-over-15-mins-line', {
    title: 'Sales Over 15 Minutes',
    chart: {
        type: 'line',        
        yAxisValueFormatter: d3.format('$,.2f'),
    }, 
    fields: fieldOptions,
});

var spline = new Connect.Viz.Chart('#sales-over-15-mins-spline', {
    title: 'Sales Over 15 Minutes',
    chart: {
        type: 'spline',        
        yAxisValueFormatter: d3.format('$,.2f'),
    }, 
    fields: fieldOptions,
});

var areaLine = new Connect.Viz.Chart('#sales-over-15-mins-area-line', {
    title: 'Sales Over 15 Minutes',
    chart: {
        type: 'area',        
        yAxisValueFormatter: d3.format('$,.2f'),
    }, 
    fields: fieldOptions,
});

var areaSpline = new Connect.Viz.Chart('#sales-over-15-mins-area-spline', {
    title: 'Sales Over 15 Minutes',    
    chart: {
        type: 'area-spline',        
        yAxisValueFormatter: d3.format('$,.2f'),
    }, 
    fields: fieldOptions,    
});


var timezone = new Connect.Viz.Chart('#sales-over-15-mins-timezone', {
    title: 'Sales Over 15 Minutes in Asia/Tokyo Timezone',  
    chart: {
        type: 'line',        
        yAxisValueFormatter: d3.format('$,.2f'),
    }, 
    timezone: 'Asia/Tokyo',
    fields: fieldOptions,
});


var table = new Connect.Viz.Table('#sales-over-15-mins-table', {
    title: 'Sales Over 15 Minutes',
    fields: fieldOptions,
    intervalOptions: {
        label: 'Time'
    }
});

bar.displayData(queryResults.results, queryResults.metadata);
line.displayData(queryResults.results, queryResults.metadata);
spline.displayData(queryResults.results, queryResults.metadata);
areaLine.displayData(queryResults.results, queryResults.metadata);
areaSpline.displayData(queryResults.results, queryResults.metadata);
timezone.displayData(queryResults.results, queryResults.metadata);
table.displayData(queryResults.results, queryResults.metadata);

module.exports = {
    bar: bar,
    line: line,
    spline: spline,
    timezone: timezone,
    table: table
}