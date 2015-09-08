import chai = require('chai');
import proxyquire = require('proxyquire');
import sinon = require('sinon');
import Connect = require('../../../lib/core/connect');
import VizRenderer = require('../../../lib/viz/viz-renderer');
import Text = require('../../../lib/viz/text/text');
import helper = require('../spec-helper');

var expect = chai.expect,
    Q = require('Q'),
    metadata = {"groups":[],"interval":null,"timezone":"UTC"},
    promise = Q.fcall(() => {
        return new Connect.QueryResults({
            results: [{ sellPriceTotal: 16 }],
            metadata: metadata
        });
    });

function getResults() {
    return promise;
}

describe('When text is rendered', () => {
    var container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
    });

    it("should render a value", (done) => {
        var options = {
                title: 'Hello World',
                transitionOnReload: false
            },
            text = new Text(),
            renderer = new VizRenderer(container, getResults, options, text),
            vizContainer = helper.getVizContainer(container),
            results = helper.getResultContainer(vizContainer),
            value = results.querySelector('.connect-text-value');

        helper.expect(done, promise, () => {
            expect(value.textContent).to.be.equal('16');
        });
    });
});