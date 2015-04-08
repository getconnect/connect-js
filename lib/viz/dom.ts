import _ = require('underscore');

export function getElement(selector: string|HTMLElement) : HTMLElement {
	if(_.isString(selector))
		return <HTMLElement>document.querySelector(<string>selector);

	return <HTMLElement>selector;
}

export function removeAllChildren(targetElement: HTMLElement){
    var elementToClear = targetElement;

    if (!elementToClear)
        return;

    while (elementToClear.firstChild) 
        elementToClear.removeChild(elementToClear.firstChild);
}