var q = require('q');

function createResponse(results, metadata){
    return {
        results: results,
        metadata: metadata
    }
}

function empty(){
    var metadata = {"selects":["sellPriceTotal"],"groups":[],"interval":null,"timezone":"UTC"};
    var resultsPromise = q.fcall(function(){
        return createResponse(null, metadata);
    });

    return {
        results: resultsPromise,
        metadata: metadata
    };
}

function sales(){
    var metadata = {"selects":["sellPriceTotal","costPriceTotal"],"groups":[],"interval":null,"timezone":"UTC"};
    var resultsPromise = q.fcall(function(){
        return createResponse([{sellPriceTotal: 16.7793, costPriceTotal: 7.0553, _count: 2388740}], metadata);
    });

    return {
        results: resultsPromise,
        metadata: metadata
    };
}

function marketSharePercent(){
    var metadata = {"selects":["share"],"groups":[],"interval":null,"timezone":"UTC"};
    var resultsPromise = q.fcall(function(){
        return createResponse([{share: 77.2345, _count: 1}], metadata);
    });

    return {
        results: resultsPromise,
        metadata: metadata
    };
}

function marketShareDollars(){
    var metadata = {"selects":["share", 'totalMarketValue'],"groups":[],"interval":null,"timezone":"UTC"}
    var resultsPromise = q.fcall(function(){
        return createResponse([{share: 22.2345, totalMarketValue: 27, _count: 1}], metadata);
    });

    return {
        results: resultsPromise,
        metadata: metadata
    };
}

function salesSellPrice(){
    var metadata = {"selects":["sellPriceTotal"],"groups":[],"interval":null,"timezone":"UTC"};
    var resultsPromise = q.fcall(function(){
        return createResponse([{sellPriceTotal: 100001.7793, _count: 2388740}], metadata);
    });

    return {
        results: resultsPromise,
        metadata: metadata
    };
}

function salesByPayment(){
    var metadata = {"selects":["sellPriceTotal","costPriceTotal"],"groups":["paymentType"],"interval":null,"timezone":"UTC"};
    var resultsPromise = q.fcall(function(){
        return createResponse([
        {"paymentType":"cash","sellPriceTotal":13.7793,"costPriceTotal":12.7793,"_count":1974313.0},
        {"paymentType":"card","sellPriceTotal":37.7793,"costPriceTotal":36.7793,"_count":336411.0}
        ], metadata);
    });

    return {
        results: resultsPromise,
        metadata: metadata
    };
}

function salesOver15Mins(){
    var metadata = {"selects":["sellPriceTotal","costPriceTotal"],"groups":[],"interval":"minutely","timezone":"UTC"};
    var resultsPromise = q.fcall(function(){
        return createResponse([
        {"interval": {"start": "2015-03-04T00:00:00Z", "end": "2015-03-04T00:01:00Z"}, "results": [{sellPriceTotal: 22.7793, costPriceTotal: 7.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:01:00Z", "end": "2015-03-04T00:02:00Z"}, "results": [{sellPriceTotal: 2.7793, costPriceTotal: 4.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:02:00Z", "end": "2015-03-04T00:03:00Z"}, "results": [{sellPriceTotal: 33.7793, costPriceTotal: 5.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:03:00Z", "end": "2015-03-04T00:04:00Z"}, "results": [{sellPriceTotal: 11.7793, costPriceTotal: 23.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:04:00Z", "end": "2015-03-04T00:05:00Z"}, "results": [{sellPriceTotal: 68.7793, costPriceTotal: 3.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:05:00Z", "end": "2015-03-04T00:06:00Z"}, "results": [{sellPriceTotal: 100.7793, costPriceTotal: 12.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:06:00Z", "end": "2015-03-04T00:07:00Z"}, "results": [{sellPriceTotal: 5.7793, costPriceTotal: 5.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:07:00Z", "end": "2015-03-04T00:08:00Z"}, "results": [{sellPriceTotal: 0, costPriceTotal: 0, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:08:00Z", "end": "2015-03-04T00:09:00Z"}, "results": [{sellPriceTotal: 18.7793, costPriceTotal: 14.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:09:00Z", "end": "2015-03-04T00:10:00Z"}, "results": [{sellPriceTotal: 55.7793, costPriceTotal: 60.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:10:00Z", "end": "2015-03-04T00:11:00Z"}, "results": [{sellPriceTotal: 32.7793, costPriceTotal: 2.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:11:00Z", "end": "2015-03-04T00:12:00Z"}, "results": [{sellPriceTotal: 12.7793, costPriceTotal: 7.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:12:00Z", "end": "2015-03-04T00:13:00Z"}, "results": [{sellPriceTotal: 66.7793, costPriceTotal: 12.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:13:00Z", "end": "2015-03-04T00:14:00Z"}, "results": [{sellPriceTotal: 33.7793, costPriceTotal: 6.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:14:00Z", "end": "2015-03-04T00:15:00Z"}, "results": [{sellPriceTotal: 12.7793, costPriceTotal: 8.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:15:00Z", "end": "2015-03-04T00:16:00Z"}, "results": [{sellPriceTotal: 5.7793, costPriceTotal: 1.0553, _count: 2388740}]}
        ], metadata);
    });

    return {
        results: resultsPromise,
        metadata: metadata
    };
}

function salesOver15MinsTimezone(){
    var metadata = {"selects":["sellPriceTotal","costPriceTotal"],"groups":[],"interval":"minutely","timezone":"UTC"}
    var resultsPromise = q.fcall(function(){
        return createResponse([
        {"interval": {"start": "2015-03-04T00:00:00Z", "end": "2015-03-04T00:01:00Z"}, "results": [{sellPriceTotal: 22.7793, costPriceTotal: 7.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:01:00Z", "end": "2015-03-04T00:02:00Z"}, "results": [{sellPriceTotal: 2.7793, costPriceTotal: 4.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:02:00Z", "end": "2015-03-04T00:03:00Z"}, "results": [{sellPriceTotal: 33.7793, costPriceTotal: 5.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:03:00Z", "end": "2015-03-04T00:04:00Z"}, "results": [{sellPriceTotal: 11.7793, costPriceTotal: 23.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:04:00Z", "end": "2015-03-04T00:05:00Z"}, "results": [{sellPriceTotal: 68.7793, costPriceTotal: 3.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:05:00Z", "end": "2015-03-04T00:06:00Z"}, "results": [{sellPriceTotal: 100.7793, costPriceTotal: 12.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:06:00Z", "end": "2015-03-04T00:07:00Z"}, "results": [{sellPriceTotal: 5.7793, costPriceTotal: 5.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:07:00Z", "end": "2015-03-04T00:08:00Z"}, "results": [{sellPriceTotal: 0, costPriceTotal: 0, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:08:00Z", "end": "2015-03-04T00:09:00Z"}, "results": [{sellPriceTotal: 18.7793, costPriceTotal: 14.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:09:00Z", "end": "2015-03-04T00:10:00Z"}, "results": [{sellPriceTotal: 55.7793, costPriceTotal: 60.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:10:00Z", "end": "2015-03-04T00:11:00Z"}, "results": [{sellPriceTotal: 32.7793, costPriceTotal: 2.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:11:00Z", "end": "2015-03-04T00:12:00Z"}, "results": [{sellPriceTotal: 12.7793, costPriceTotal: 7.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:12:00Z", "end": "2015-03-04T00:13:00Z"}, "results": [{sellPriceTotal: 66.7793, costPriceTotal: 12.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:13:00Z", "end": "2015-03-04T00:14:00Z"}, "results": [{sellPriceTotal: 33.7793, costPriceTotal: 6.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:14:00Z", "end": "2015-03-04T00:15:00Z"}, "results": [{sellPriceTotal: 12.7793, costPriceTotal: 8.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:15:00Z", "end": "2015-03-04T00:16:00Z"}, "results": [{sellPriceTotal: 5.7793, costPriceTotal: 1.0553, _count: 2388740}]}
        ], metadata);
    });

    return {
        results: resultsPromise,
        metadata: metadata
    };
}

function salesOver15MinsByPayment(){
    var metadata = {"selects":["sellPriceTotal","costPriceTotal"],"groups":["paymentType"],"interval":"minutely","timezone":"UTC"};
    var resultsPromise = q.fcall(function(){
        return createResponse([
        {"interval": {"start": "2015-03-04T00:00:00Z", "end": "2015-03-04T00:01:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 22.7793, costPriceTotal: 7.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 11.7793, costPriceTotal: 7.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:01:00Z", "end": "2015-03-04T00:02:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 2.7793, costPriceTotal: 4.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 3.7793, costPriceTotal: 6.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:02:00Z", "end": "2015-03-04T00:03:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 33.7793, costPriceTotal: 5.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 55.7793, costPriceTotal: 9.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:03:00Z", "end": "2015-03-04T00:04:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 11.7793, costPriceTotal: 23.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 23.7793, costPriceTotal: 44.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:04:00Z", "end": "2015-03-04T00:05:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 68.7793, costPriceTotal: 3.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 6.7793, costPriceTotal: 1.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:05:00Z", "end": "2015-03-04T00:06:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 100.7793, costPriceTotal: 12.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 7.7793, costPriceTotal: 2.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:06:00Z", "end": "2015-03-04T00:07:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 5.7793, costPriceTotal: 5.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 88.7793, costPriceTotal: 1.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:07:00Z", "end": "2015-03-04T00:08:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 0, costPriceTotal: 0, _count: 2388740}, {paymentType: "card", sellPriceTotal: 1, costPriceTotal: 1, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:08:00Z", "end": "2015-03-04T00:09:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 18.7793, costPriceTotal: 14.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 4.7793, costPriceTotal: 33.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:09:00Z", "end": "2015-03-04T00:10:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 55.7793, costPriceTotal: 60.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 56.7793, costPriceTotal: 21.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:10:00Z", "end": "2015-03-04T00:11:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 32.7793, costPriceTotal: 2.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 12.7793, costPriceTotal: 3.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:11:00Z", "end": "2015-03-04T00:12:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 12.7793, costPriceTotal: 7.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 34.7793, costPriceTotal: 12.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:12:00Z", "end": "2015-03-04T00:13:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 66.7793, costPriceTotal: 12.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 21.7793, costPriceTotal: 21.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:13:00Z", "end": "2015-03-04T00:14:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 33.7793, costPriceTotal: 6.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 9.7793, costPriceTotal: 12.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:14:00Z", "end": "2015-03-04T00:15:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 12.7793, costPriceTotal: 8.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 33.7793, costPriceTotal: 9.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:15:00Z", "end": "2015-03-04T00:16:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 5.7793, costPriceTotal: 1.0553, _count: 2388740}, {paymentType: "card", sellPriceTotal: 12.7793, costPriceTotal: 2.0553, _count: 2388740}]}
        ], metadata);
    });

    return {
        results: resultsPromise,
        metadata: metadata
    };
}



function sellPriceOver15MinsByPayment(){
    var metadata = {"selects":["sellPriceTotal"],"groups":["paymentType"],"interval":"minutely","timezone":"UTC"};
    var resultsPromise = q.fcall(function(){
        return createResponse([
        {"interval": {"start": "2015-03-04T00:00:00Z", "end": "2015-03-04T00:01:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 22.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 11.7793, costPriceTotal: 7.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:01:00Z", "end": "2015-03-04T00:02:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 2.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 3.7793, costPriceTotal: 6.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:02:00Z", "end": "2015-03-04T00:03:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 33.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 55.7793, costPriceTotal: 9.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:03:00Z", "end": "2015-03-04T00:04:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 11.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 23.7793, costPriceTotal: 44.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:04:00Z", "end": "2015-03-04T00:05:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 68.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 6.7793, costPriceTotal: 1.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:05:00Z", "end": "2015-03-04T00:06:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 100.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 7.7793, costPriceTotal: 2.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:06:00Z", "end": "2015-03-04T00:07:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 5.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 88.7793, costPriceTotal: 1.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:07:00Z", "end": "2015-03-04T00:08:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 0, _count: 2388740}, {paymentType: "card", sellPriceTotal: 1, costPriceTotal: 1, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:08:00Z", "end": "2015-03-04T00:09:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 18.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 4.7793, costPriceTotal: 33.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:09:00Z", "end": "2015-03-04T00:10:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 55.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 56.7793, costPriceTotal: 21.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:10:00Z", "end": "2015-03-04T00:11:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 32.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 12.7793, costPriceTotal: 3.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:11:00Z", "end": "2015-03-04T00:12:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 12.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 34.7793, costPriceTotal: 12.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:12:00Z", "end": "2015-03-04T00:13:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 66.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 21.7793, costPriceTotal: 21.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:13:00Z", "end": "2015-03-04T00:14:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 33.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 9.7793, costPriceTotal: 12.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:14:00Z", "end": "2015-03-04T00:15:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 12.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 33.7793, costPriceTotal: 9.0553, _count: 2388740}]},
        {"interval": {"start": "2015-03-04T00:15:00Z", "end": "2015-03-04T00:16:00Z"}, "results": [{paymentType: "cash", sellPriceTotal: 5.7793, _count: 2388740}, {paymentType: "card", sellPriceTotal: 12.7793, costPriceTotal: 2.0553, _count: 2388740}]}
        ], metadata);
    });

    return {
        results: resultsPromise,
        metadata: metadata
    };
}

module.exports = {
    empty: empty(),
    marketSharePercent: marketSharePercent(),
    marketShareDollars: marketShareDollars(),
    sales: sales(),
    salesSellPrice: salesSellPrice(),
    salesByPayment: salesByPayment(),
    salesOver15Mins: salesOver15Mins(),
    salesOver15MinsByPayment: salesOver15MinsByPayment(),
    sellPriceOver15MinsByPayment: sellPriceOver15MinsByPayment()
}