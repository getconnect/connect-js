
import chai = require('chai');
import proxyquire = require('proxyquire');
import sinon = require('sinon');
import Connect = require('../../lib/core/connect');
import Viz  = require('../../lib/viz/visualization');
import Registrar  = require('../../lib/viz/registrar');

var expect = chai.expect,
    Q = require('Q');

describe('Registrar', () => {
    var dummyConnect: any;
    var container: HTMLElement;
    
    beforeEach(() => {
        container = document.createElement('div');
        dummyConnect = { 
            prototype: { 
                _visualizations: {}    
            },
            registerViz: Registrar.registerViz,
            _visualizations: {}
        };
    });

    describe('When a valid custom viz registered', () => {
        var customVizName = 'customViz';
        var customViz: Viz.Visualization = {
            init: (container, options) => {
                container.classList.add(customVizName);
            },  
            render: (container, results, options) => { }
        };
        
        it("should be accessable", () => {
            dummyConnect.registerViz(customVizName, customViz);
            
            expect(dummyConnect._visualizations[customVizName]).not.to.be.an('undefined');
        }); 
        
    });
    
    describe('When an invalid custom viz registered', () => {
        var customVizName = 'customViz';
        var customViz: any = {
            init: (container, options) => { },
        };
        
        it("should not be accessable", () => {
            dummyConnect.registerViz(customVizName, customViz);
            
            expect(dummyConnect._visualizations[customVizName]).to.be.an('undefined');
        });
    });
    
    describe('When a duplicate custom viz registered', () => {
        var existingViz = 'existingViz';
        var customViz: Viz.Visualization = {
            init: (container, options) => { },
            render: (container, results, options) => { }
        };
        
        it("should not overwrite original", () => {
            dummyConnect._visualizations[existingViz] = dummyConnect.prototype._visualizations[existingViz] = existingViz;
            dummyConnect.registerViz(existingViz, customViz);
            expect(dummyConnect._visualizations.existingViz).to.equal(existingViz);
        });
    });
    
});
