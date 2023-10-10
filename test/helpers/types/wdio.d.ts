declare namespace WebdriverIO {
	type AxiosResponse = import("axios").AxiosResponse;
	type Binding = import("./binding.js").default<any>;
	type BotResponse = import("./bot-response.js").default;
	type DatabaseConfig = import("./database-config.js").default;
	type ExternalChange = import("./external-change.js").default;
	type LuaCPUValue = import("./lua-cpu-value.js").default;

	interface Browser {
		dbQuery:  ( query: string, config?: DatabaseConfig ) => Promise<string>;
		deleteClaim: ( claimGuid: string ) => Promise<BotResponse>;
		dockerExecute: ( container: string, command: string, opts?: string, shouldLog?: boolean ) => Promise<unknown>;
		editPage: ( host: string, title: string, content: Buffer | string, captcha?: string ) => Promise<string>;
		executeQuickStatement: ( theQuery: string ) => Promise<void>;
		getDispatchedExternalChange: ( host: string, expectedChange: ExternalChange ) => Promise<ExternalChange | undefined>;
		getInstalledExtensions: ( server: string ) => Promise<string[] | undefined>;
		getLuaCpuTime: ( host: string, page: string ) => Promise<LuaCPUValue>;
		makeRequest: ( url: string, params?: Object, postData?: any ) => Promise<AxiosResponse>;
		queryBlazeGraphItem: ( itemId: string ) => Promise<Binding[]>;
		waitForJobs: ( serverURL?: string, timeout?: number, timeoutMsg?: string ) => Promise<boolean>;
	}

	interface Element {
	    submit: () => Promise<void>;
	}
}