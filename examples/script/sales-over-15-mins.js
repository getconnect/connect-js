var connect = require('./connection.js');
var salesOver15MinsProvider = require('./query-results.js').salesOver15Mins;

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

var bar = connect.chart(salesOver15MinsProvider, '#sales-over-15-mins-bar', {
    title: 'Sales Over 15 Minutes',    
    chart: {
        type: 'bar',        
        yAxisValueFormatter: Connect.Viz.format('$,.2f'),
    }, 
    fields: fieldOptions,
});

var line = connect.chart(salesOver15MinsProvider, '#sales-over-15-mins-line', {
    title: 'Sales Over 15 Minutes',
    chart: {
        type: 'line',        
        yAxisValueFormatter: Connect.Viz.format('$,.2f'),
    }, 
    fields: fieldOptions,
});

var spline = connect.chart(salesOver15MinsProvider, '#sales-over-15-mins-spline', {
    title: 'Sales Over 15 Minutes',
    chart: {
        type: 'spline',        
        yAxisValueFormatter: Connect.Viz.format('$,.2f'),
    }, 
    fields: fieldOptions,
});

var areaLine = connect.chart(salesOver15MinsProvider, '#sales-over-15-mins-area-line', {
    title: 'Sales Over 15 Minutes',
    chart: {
        type: 'area',        
        yAxisValueFormatter: Connect.Viz.format('$,.2f'),
    }, 
    fields: fieldOptions,
});

var areaSpline = connect.chart(salesOver15MinsProvider, '#sales-over-15-mins-area-spline', {
    title: 'Sales Over 15 Minutes',    
    chart: {
        type: 'area-spline',        
        yAxisValueFormatter: Connect.Viz.format('$,.2f'),
    }, 
    fields: fieldOptions,    
});


var timezone = connect.chart(salesOver15MinsProvider, '#sales-over-15-mins-timezone', {
    title: 'Sales Over 15 Minutes in Asia/Tokyo Timezone',  
    chart: {
        type: 'line',        
        yAxisValueFormatter: Connect.Viz.format('$,.2f'),
    }, 
    timezone: 'Asia/Tokyo',
    fields: fieldOptions,
});


var table = connect.table(salesOver15MinsProvider, '#sales-over-15-mins-table', {
    title: 'Sales Over 15 Minutes',
    fields: fieldOptions,
    intervalOptions: {
        label: 'Time'
    }
});

module.exports = {
    bar: bar,
    line: line,
    spline: spline,
    timezone: timezone,
    table: table
}