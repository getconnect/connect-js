
import chai = require('chai');
import proxyquire = require('proxyquire');
import sinon = require('sinon');
import Connect = require('../../lib/core/connect');
import Viz  = require('../../lib/viz/visualization');
import Registrar  = require('../../lib/viz/registrar');

var expect = chai.expect,
    Q = require('Q');

describe('Registrar', () => {
    var container: HTMLElement;
    
    beforeEach(() => {
        container = document.createElement('div');
    });

    describe('When a valid custom viz registered', () => {
        var dummyConnect: any;
        var customVizName = 'customViz';
        var customViz: Viz.Visualization = {
            init: (container, options) => {
                container.classList.add(customVizName);
            },  
            render: (container, results, options) => { }
        };
        
        dummyConnect = { 
            prototype: { },
            registerViz: Registrar.registerViz
        };
        dummyConnect.registerViz(customVizName, customViz);
        
        it("should be accessable", () => {
            expect(dummyConnect[customVizName]).not.to.be.an('undefined');
        }); 
        
    });
    
    describe('When an invalid custom viz registered', () => {
        var dummyConnect: any;
        var customVizName = 'customViz';
        var customViz: any = {
            init: (container, options) => { },
        };
        
        dummyConnect = { 
            prototype: { },
            registerViz: Registrar.registerViz
        };
        dummyConnect.registerViz(customVizName, customViz);
        
        it("should not be accessable", () => {
            expect(dummyConnect[customVizName]).to.be.an('undefined');
        });
    });
    
    describe('When a duplicate custom viz registered', () => {
        var dummyConnect: any;
        var existingViz = 'existingViz';
        var customViz: Viz.Visualization = {
            init: (container, options) => { },
            render: (container, results, options) => { }
        };
        
        dummyConnect = { 
            prototype: { },
            registerViz: Registrar.registerViz,
            existingViz: existingViz
        };
        dummyConnect.registerViz(existingViz, customViz);
        
        it("should not overwrite original", () => {
            expect(dummyConnect[existingViz]).to.equal(existingViz);
        });
    });
    
});
