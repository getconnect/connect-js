export function removeAllChildren(selector: string){
    var elementToClear = document.querySelector(selector);

    if (!elementToClear)
        return;

    while (elementToClear.firstChild) 
        elementToClear.removeChild(elementToClear.firstChild);
}