module Config {
    export interface ChartColors {
        [categoryKey: string]: string;
    }

    export interface IntervalFormats {
        [interval: string]: string;
    }

    export interface FormatValueFunction {
        (value: any): any;
    }    

    export interface FormatIntervalFunction {
        (start: Date, end?: Date): any;
    }

    export interface FieldOption {
        label?: string;
        valueFormatter?: FormatValueFunction;
    }

    export interface IntervalOptions {
        label?: string;
        formats?: IntervalFormats;
        valueFormatter?: FormatIntervalFunction;
    }

    export interface FieldOptions {
        [fieldName: string]: FieldOption;
    }

    export interface VisualizationOptions {
        title?: string | boolean;
        fields?: FieldOptions;   
        intervals?: IntervalOptions;   
        timezone?: string|number;
        text?: TextOptions;
        table?: TableOptions;
        gauge?: GaugeOptions;
        chart?: ChartOptions;
        transitionOnReload?: boolean;
    }

    export interface ChartOptions {
        type: string;
        height?: number;
        colors?: ChartColors|string[];
        padding?: PaddingOptions;
        showLegend?: boolean; 
        yAxisValueFormatter?: (value: any) => any;
    }

    export interface GaugeOptions { 
        label?: {
            format?: (value: any) => any;
        };
        min?: number|string;
        max?: number|string;
        color?: string;
        padding?: PaddingOptions;
    }

    export interface TextOptions {    
        counterDurationMs: number;    
    }

    export interface TableOptions {
        
    }

    export interface PaddingOptions {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    }

    export var defaultTimeSeriesFormats: IntervalFormats = {
        minutely: 'HH:mm',
        hourly: 'HH:mm',
        daily: 'DD/MM',
        weekly: '',
        monthly: 'MMM YY',
        quarterly: '[Q]Q YY',
        yearly: 'YYYY'
    }

    export var defaultC3Options = {
        line: {
            connectNull: true
        },
        spline: {
            connectNull: true
        },
        gauge: {
            label: {
                format: (value) => d3.format('.0f')(value) + '%',
                formatall: true,
                transition: false
            },
            expand: true
        },
        minMaxFromResults: {
            label: {
                show: false
            },
            min: 0,
            max: 100          
        },
        bar: {}
    }
}

export = Config;
