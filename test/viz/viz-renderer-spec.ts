import chai = require('chai');
import proxyquire = require('proxyquire');
import sinon = require('sinon');
import Connect = require('../../lib/core/connect');
import VizRenderer = require('../../lib/viz/viz-renderer');
import Text = require('../../lib/viz/text/text');

var expect = chai.expect,
    Q = require('Q');

function getResults() {
    var metadata = {"groups":[],"interval":null,"timezone":"UTC"};
    return Q.fcall(() => {
        return new Connect.QueryResults({
            results: [{ sellPriceTotal: 16 }],
            metadata: metadata
        });
    });
}

describe('When viz is rendered', () => {
    var container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
    });

    describe('When title configured', () => {
        it("should render a title", () => {
            var options = {
                    title: 'Hello World'
                },
                text = new Text(options),
                renderer = new VizRenderer(container, getResults, options, text),
                vizContainer = container.childNodes[0],
                title = <HTMLSpanElement>vizContainer.childNodes[0];

            expect(title.textContent).to.be.equal('Hello World');
        });        
    });
});