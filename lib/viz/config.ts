
module Config {
    export type ValueFormatter = (any) => string;
    export type IntervalValueFormatter = (start: Date, end?: Date) => string;
    
    export interface IntervalFormats {
        [interval: string]: string;
    }  

    export interface FormatTitleFunction {
        (container: HTMLElement): void;
    }

    export interface ColorModifier {
        (context: ChartDataContext): string
    }

    export interface FieldOption {
        label?: string;
        format?: string|ValueFormatter;
    }

    export interface IntervalOptions {
        label?: string;
        format: string|IntervalFormats|IntervalValueFormatter;
    }

    export interface GroupByNameValuePairs {
        [groupBy: string]: string;
    }

    export interface ChartDataContext {
        select: string;
        groupBys: GroupByNameValuePairs;
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
        width?: number;
        colors?: string[] | ColorModifier;
        padding?: PaddingOptions;
        showLegend?: boolean;
        stack?: boolean;
        yAxis?: {
            format?: string|ValueFormatter;
            startAtZero?: boolean;
            min?: boolean;
            max?: boolean;
        };
        tooltip?: {
            format?: string|ValueFormatter;
        }
    }

    export interface GaugeOptions {        
        height?: number;
        width?: number;
        label?: {
            format?: string|ValueFormatter;
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
        weekly: 'DD/MM',
        monthly: 'MMM YY',
        quarterly: '[Q]Q YY',
        yearly: 'YYYY'
    };
    
    export var defaultField: FieldOption = {
        label: undefined,
        format: undefined
    };
}

export = Config;
