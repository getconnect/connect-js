export function removeAllChildren(targetElement: HTMLElement){
    var elementToClear = targetElement;

    if (!elementToClear)
        return;

    while (elementToClear.firstChild) 
        elementToClear.removeChild(elementToClear.firstChild);
}