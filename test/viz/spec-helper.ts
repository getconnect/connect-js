import cssClasses = require('../../lib/viz/css-classes');

export function getTitle(container: HTMLElement): HTMLElement {
    console.log('vizt:');
    console.log(container);
    return <HTMLElement>container.querySelector(`.${cssClasses.title}`);
}

export function getResultContainer(container: HTMLElement): HTMLElement {
    return <HTMLElement>container.querySelector(`.${cssClasses.result}`);
}

export function getVizContainer(container: HTMLElement): HTMLElement {
    return <HTMLElement>container.childNodes[0];
}

export function expect(done, resultsPromise, expectation) {
    resultsPromise.then(() => {
        setTimeout(() => {
            expectation();
            done();
        }, 0);
    });
}