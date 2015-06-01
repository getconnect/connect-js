import Formatters = require('./formatters');
import deepExtend = require('deep-extend');

module Config {
    export interface IntervalFormats {
        [interval: string]: string;
    }

    export interface FormatValueFunction {
        (value: any): any;
    }    

    export interface FormatTitleFunction {
        (container: HTMLElement): void;
    }

    export interface ColorModifier {
        (currentColor: string, context: ChartDataContext|ChartDataContext[]): string
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

    export interface ChartDataContext {
        select: string;
        groupByValues: string[];
        intervalValue: Date;
        value: number;
    }

    export interface FieldOptions {
        [fieldName: string]: FieldOption;
    }

    export interface VisualizationOptions {
        title?: string | FormatTitleFunction;
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
        colors?: string[];
        colorModifier: ColorModifier;
        padding?: PaddingOptions;
        showLegend?: boolean; 
        yAxis?: {
            valueFormatter?: (value: any) => any;
            startAtZero?: boolean;
            min?: boolean;
            max?: boolean;
        };
        tooltip?: {
            valueFormatter?: (value: any) => any;
        };
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

    export var defaultC3ChartOptions = {
        line: {
            connectNull: true
        },
        spline: {
            connectNull: true
        },
        area: {
            zerobased: true
        },
        bar: {
            zerobased: true
        }
    }

    export var defaultC3GaugeOptions = {
        gauge: {
            label: {
                format: (value) => Formatters.format('.0f')(value) + '%',
                formatall: true,
                transition: false
            },
            expand: true,
            min: 0,
            max: 100
        }
    }

    export var defaultC3MinMaxFromResultsGaugeOptions = deepExtend({}, {
        gauge: {
            label: {
                show: false
            }        
        }
    }, defaultC3GaugeOptions);

    export var defaulField = {
        label: undefined,
        valueFormatter: undefined
    }
}

export = Config;
