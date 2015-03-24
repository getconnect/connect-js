interface DataDriven {
    (data: any, cb: any): void;
}

declare module 'mocha-data-driven' {
    var d: DataDriven;
    export = d;
}