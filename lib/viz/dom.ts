import _ = require('underscore');
import Config = require('./config');
import Classes = require('./css-classes');

export function getElement(selector: string|HTMLElement) : HTMLElement {
	if(_.isString(selector))
		return <HTMLElement>document.querySelector(<string>selector);

	return <HTMLElement>selector;
}

export function removeAllChildren(targetElement: HTMLElement): void{
    var elementToClear = targetElement;

    if (!elementToClear)
        return;

    while (elementToClear.firstChild) 
        elementToClear.removeChild(elementToClear.firstChild);
}

export function createElement(tag: string, ...classNames: string[]): HTMLElement{
    var element: HTMLElement = document.createElement(tag);

    _.each(classNames, (className) => {
        element.classList.add(className);
    });

    return element;
}

export function createTitle(title: string|Config.FormatTitleFunction): HTMLElement{
    var titleContainer = createElement('div', Classes.title),
        titleFunc = typeof title === 'function' ? title : (container) => {
            var titleElement = createElement('span');
            titleElement.textContent = <string>title || '';
            container.appendChild(titleElement); 
        };
    titleContainer.style.display = title == null ? 'none' : '';    
    titleFunc(titleContainer);

    return titleContainer;
}