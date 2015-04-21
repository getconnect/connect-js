var connect = require('./connection.js');
var salesByPaymentProvider = require('./query-results.js').salesByPayment;

var text = connect.text(salesByPaymentProvider, '#invalid-text', {
    title: 'Sales'
});

module.exports = {
    text: text
};