import chai = require('chai');
import proxyquire = require('proxyquire');
import sinon = require('sinon');
import Connect = require('../lib/core/connect');
import Api = require('../lib/core/api');
import Queries = require('../lib/core/queries/queries');
import QueryBuilder = require('../lib/core/queries/query-builder');

var expect = chai.expect,
	Q = require('Q');

describe('Connect', () => {
	var connect: Connect;

	before(() => {
		connect = new Connect({
			apiKey: 'abc'
		});
	});

    describe('#query()', () => {
    	var query: Queries.ConnectQuery,
    		collection = 'purchases';

    	before(() => {
			query = connect.query(collection);
		});

    	it('should return new ConnectQuery instance', () => {
    		expect(query).to.be.an.instanceof(Queries.ConnectQuery);
    	});

    	it('should set the collection name', () => {
			expect(query._collection).to.be.equal(collection);
		});
	});
});