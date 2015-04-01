import _ = require('underscore');

export function getElement(selector: string|HTMLElement) : HTMLElement {
	if(_.isString(selector))
		return <HTMLElement>document.querySelector(<string>selector);

	return <HTMLElement>selector;
}