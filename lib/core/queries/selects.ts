import Api = require('../api')

module Selects {
	export interface QuerySelects {
		[index: string]: string|QuerySelect;
	}

	export class QuerySelect {
		[index: string]: string;
	}
}

export = Selects;