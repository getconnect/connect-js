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
        fieldOptions?: FieldOptions;   
        intervalOptions?: IntervalOptions;   
        timezone?: string|number;
    }

    export interface ChartOptions extends VisualizationOptions {
        type: string;
        height?: number;
        colors?: ChartColors;
        padding?: {
            top?: number;
            right?: number;
            bottom?: number;
            left?: number;
        };
        gauge?:{
            min?: number;
            max?: number;
        };
        showLegend?: boolean; 
        yAxisValueFormatter?: (value: any) => any;
    }

	export interface TextOptions extends VisualizationOptions {
        fieldOptions?: FieldOptions;
	}

    export interface TableOptions extends VisualizationOptions {
        
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
                formatall: true
            },
            expand: true
        },
        bar: {}
    }
}

export = Config;
