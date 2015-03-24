import Api = require('../api')

module Timeframes {
	export type Timeframe = string|AbsoluteTimeframe|RelativeTimeframe;
	export type Timezone = string | number;

	export class AbsoluteTimeframe {
		start: Date;
		end: Date;

		constructor(start?: Date, end?: Date) {
			this.start = start;
			this.end = end;
		}
	}

	export class RelativeTimeframe {
		isCurrent: boolean;
		length: number;
		period: string;

		constructor(isCurrent: boolean, length: number, period: string) {
			this.isCurrent = isCurrent;
			this.length = length;
			this.period = period;
		}

		public direction(): string {
			return this.isCurrent ? 'current' : 'previous';
		}
	}

	export class TimeframeBuilder {
		public from(from: Date): AbsoluteTimeframe {
			return new AbsoluteTimeframe(from);
		}

		public to(to: Date): AbsoluteTimeframe {
			return new AbsoluteTimeframe(null, to);
		}

		public between(start: Date, end: Date): AbsoluteTimeframe {
			return new AbsoluteTimeframe(start, end);
		}

		public current(length: number, period: string): RelativeTimeframe {
			return new RelativeTimeframe(true, length, period);
		}

		public last(length: number, period: string): RelativeTimeframe {
			return new RelativeTimeframe(false, length, period);
		}
	}
}

export = Timeframes;