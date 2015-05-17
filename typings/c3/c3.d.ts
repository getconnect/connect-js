/// <reference path="../d3/d3.d.ts" />

declare module C3 {
	export interface Base {
		generate(config: ChartConfig): Chart;
	}

	export interface Chart {
		focus(targetIds: string|string[]);
		defocus(targetIds: string|string[]);
		revert(targetIds: string|string[]);
		show(targetIds?: string|string[], options?: ChartShowOptions);
		hide(targetIds?: string|string[], options?: ChartShowOptions);
		toggle(targetIds?: string|string[], options?: ChartShowOptions);
		load(args: ChartLoadArgs);
		unload(args: ChartUnloadArgs);
		flow(args: ChartFlowArgs);
		select(ids?: string[], indices?: string[], resetOthers?: boolean);
		unselect(ids?: string[], indices?: string[]);
		selected(targetId?: string);
		transform(type: string, targetIds?: string|string[]);
		groups(groups: string[][]);

		xgrids: ChartGrids;
		ygrids: ChartGrids;
		regions: {
			(regions: ChartRegion[]);
			add(regions: ChartRegion|ChartRegion[]);
			remove(args?: {
				classes: string[];
			});
		};
		data: {
			(targetIds?: string|string[]): any;
			shown(targetIds?: string|string[]): any;
			values(targetId?: string): any;
			names(names: ChartDataOption<string>);
			names(): ChartDataOption<string>;
			colors(names: ChartDataOption<string>);
			colors(): ChartDataOption<string>;
			axes(names: ChartDataOption<string>);
			axes(): ChartDataOption<string>;
		};

		category(i: number, category: string);
		categories(categories: string[]);

		x(): number[];
		x(x: number[]);
		xs(): ChartDataOption<number>;
		xs(xs: ChartDataOption<number>);

		axis: {
			labels(): ChartDataOption<string>;
			labels(labels: ChartDataOption<string>);
			min(): ChartAxisMinMax;
			min(min: ChartAxisMinMax);
			max(): ChartAxisMinMax;
			max(min: ChartAxisMinMax);
		};
		legend: {
			show(targetIds?: string|string[]);
			hide(targetIds?: string|string[]);
		};
		tooltip: {
			show(targetIds?: string|string[]);
			hide(targetIds?: string|string[]);
		};

		zoom: {
			(domain: number[]);
			enable(enabled: boolean);
		};
		unzoom();

		resize(size: ChartSize);
		flush();
		destroy();
	}

	export interface ChartAxisMinMax {
		x?: number;
		y?: number;
		y2?: number;
	}

	export interface ChartGrids {
		(grids: ChartGridLine[]);

		add(grids: ChartGridLine|ChartGridLine[]);
		remove(args?: {
			value?: number;
			class?: string;
		});
	}

	export interface ChartFlowArgs {
		json?: any[];
		rows?: any[][];
		columns?: any[][];
		keys?: ChartDataKeys;
		to?: number;
		length?: number;
		duration?: number;
		done: () => void;
	}

	export interface ChartUnloadArgs {
		ids?: string|string[];
		done: () => void;
	}

	export interface ChartLoadArgs {
		url?: string;
		json?: any[];
		rows?: any[][];
		columns?: any[][];
		classes?: ChartDataOption<string>;
		categories?: string[];
		axes?: ChartDataOption<any>;
		type?: string;
		types?: ChartDataOption<string>;
		unload?: boolean|string|string[];
		done?: () => void;
	}

	export interface ChartShowOptions {
		withLegend?: boolean;
	}

	export interface ChartConfig {
		bindto?: string|HTMLElement|D3.Selection;
		size?: ChartSize;
		padding?: ChartPadding;
		color?: {
			pattern?: string[];
		};
		interaction?: {
			enabled?: boolean;
		};
		transition?: {
			duration?: number;
		};
		oninit?: () => void;
		onrendered?: () => void;
		onmouseover?: () => void;
		onmouseout?: () => void;
		onresize?: () => void;
		onresized?: () => void;
		data?: ChartData;
		axis?: ChartAxis;
		grid?: ChartGrid;
		regions?: ChartRegion[];
		legend?: ChartLegend;
		tooltip?: ChartTooltip;
		subchart?: ChartSubchart;
		zoom?: ChartZoom;
		point?: ChartPoint;
		line?: ChartLine;
		area?: ChartArea;
		bar?: ChartBar;
		pie?: ChartPie;
		donut?: ChartDonut;
		gauge?: ChartGauge;
	}

	export interface ChartSize {
		width?: number;
		height?: number;
	}

	export interface ChartPadding {
		top?: number;
		right?: number;
		bottom?: number;
		left?: number;
	}

	export interface ChartDataKeys {
		x?: string|string[];
		value?: string|string[];
	}

	export interface ChartDataRegion {
		start?: number;
		end?: number;
		style?: string;
	}

	export interface ChartDataOption<T> {
		[index: string]: T;
	}

	export interface ChartData {
		url?: string;
		json?: any[];
		rows?: any[][];
		columns?: any[][];
		mimeType?: string;
		keys?: ChartDataKeys;
		x?: string;
		xs?: ChartDataOption<string>;
		xFormat?: string;
		names?: ChartDataOption<string>;
		classes?: ChartDataOption<string>;
		groups?: string[][];
		axes?: any;
		type?: string;
		types?: ChartDataOption<string>;
		labels?: boolean;
		order?: ((data1, data2) => number)|string;
		regions?: ChartDataOption<ChartDataRegion[]>;
		color?: (color: string, d: any) => string;
		colors?: ChartDataOption<string>;
		hide?: boolean|string[];
		empty?: {
			label?: {
				text?: string;
			};
		};
		selection?: {
			enabled?: boolean;
			grouped?: boolean;
			multiple?: boolean;
			draggable?: boolean;
			isselectable?: boolean;
		};
		onclick?: () => void;
		onmouseover?: () => void;
		onmouseout?: () => void;
		onselected?: () => void;
		onunselected?: () => void;
	}

	export interface ChartAxisConfig {
		show?: boolean;
		max?: number;
		min?: number;
		padding?: ChartPadding;
		label?: string|{
			text: string;
			position?: string;
		};
	}

	export interface ChartXAxisConfig extends ChartAxisConfig {
		type?: string;
		localtime?: string;
		categories?: string[];
		tick?: ChartXAxisTick;
		height?: number;
		extent?: (() => number[])|number[];
	}

	export interface ChartYAxisConfig extends ChartAxisConfig {
		inner?: boolean;
		inverted?: boolean;
		center?: number;
		tick?: ChartYAxisTick;
		default?: number[];
	}

	export interface ChartAxisTick {
		format?: ((x: any) => string)|string;
		count?: number;
		values?: number[];
		outer?: boolean;
	}

	export interface ChartXAxisTick extends ChartAxisTick {
		centered?: boolean;
		culling?: boolean|{
			max?: number;
		};
		fit?: boolean;
		rotate?: number;
	}

	export interface ChartYAxisTick extends ChartAxisTick {
	}

	export interface ChartAxis {
		rotated?: boolean;
		x?: ChartXAxisConfig;
		y?: ChartYAxisConfig;
		y2?: ChartYAxisConfig;
	}

	export interface ChartGridLine {
		value: number;
		text?: string;
		class?: string;
	}

	export interface ChartGridAxis {
		show?: boolean;
		lines?: ChartGridLine[];
	}

	export interface ChartGrid {
		x?: ChartGridAxis;
		y?: ChartGridAxis;
		focus?: {
			show?: boolean;
		};
		lines?: {
			front?: any;
		};
	}

	export interface ChartRegion {
		axis: string;
		start?: number;
		end?: number;
		class?: string;
	}

	export interface ChartLegend {
		show?: boolean;
		hide?: boolean;
		position?: string;
		inset?: {
			anchor: string;
			x: number;
			y: number;
			step?: number;
		};
		item?: {
			onclick: (id: any) => void;
			onmouseover: (id: any) => void;
			onmouseout: (id: any) => void;
		};
	}

	export interface ChartTooltip {
		show?: boolean;
		grouped?: boolean;
		format?: {
			title?: (x: any) => string;
			name?: (name: string, ratio: number, id: any, index: number) => string;
			value?: (value: any, ratio: number, id: any, index: number) => any;
		};
		position?: (data: any, width: number, height: number, element: any) => {
			top: number;
			left: number;
		};
	}

	export interface ChartSubchart {
		show?: boolean;
		size?: {
			height?: number;
		};
		onbrush?: (domain: number[]) => void;
	}

	export interface ChartZoom {
		enabled?: boolean;
		rescale?: boolean;
		extent?: number[];
		onzoom?: (domain: number[]) => void;
		onzoomstart?: (domain: number[]) => void;
		onzoomend?: (domain: number[]) => void;
	}

	export interface ChartPoint {
		show?: boolean;
		r?: number;
		focus?: {
			expand?: {
				enabled?: boolean;
				r?: number;
			};
		};
		select?: {
			r?: number;
		};
	}

	export interface ChartLine {
		connectNull?: boolean;
		step?: {
			type?: string;
		};
	}

	export interface ChartArea {
		zerobased?: boolean;
	}

	export interface ChartBar {
		width?: number|string|{
			ratio: number;
		};
		zerobased?: boolean;
	}

	export interface ChartPie {
		label?: {
			show?: boolean;
			format?: (value: any, ratio: number, id: any) => string;
			threshold?: number;
		};
		expand?: boolean;
	}

	export interface ChartDonut extends ChartPie {
		width?: number|string;
		title?: string;
	}

	export interface ChartGauge {
		label?: {
			show?: boolean;
			format?: (value: any, ratio: number) => string;
		};
		expand?: boolean;
		min?: number;
		max?: number;
		units?: string;
		width?: number|string;
	}
}

declare var c3: C3.Base;

declare module "connect-js-c3" {
    export = c3;
}
