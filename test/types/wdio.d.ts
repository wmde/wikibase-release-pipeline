declare namespace WebdriverIO {
	type AxiosResponse = import( 'axios' ).AxiosResponse;
	type Binding = import( './binding.js' ).default;
	type BotResponse = import( './bot-response.js' ).default;
	type DatabaseConfig = import( './database-config.js' ).default;
	type ExternalChange = import( './external-change.js' ).default;
	type LuaCPUValue = import( './lua-cpu-value.js' ).default;

	interface Browser {
		/**
		 * Execute query on database
		 */
		dbQuery: ( query: string, config?: DatabaseConfig ) => Promise<string>;

		/**
		 * Delete a claim by guid or pipe-separated list of guids
		 */
		deleteClaim: ( claimGuid: string ) => Promise<BotResponse>;

		/**
		 * Execute docker command on container and get output
		 */
		dockerExecute: (
			container: string,
			command: string,
			opts?: string,
			shouldLog?: boolean,
		) => Promise<unknown>;

		/**
		 * Creates or edits a page with content
		 */
		editPage: (
			host: string,
			title: string,
			content: Buffer | string,
			captcha?: string,
		) => Promise<string>;

		/**
		 * Execute quickstatements query
		 */
		executeQuickStatement: ( theQuery: string ) => Promise<void>;

		/**
		 * Moves browser to recent changes then asserts that a change is in the api result
		 */
		getDispatchedExternalChange: (
			host: string,
			expectedChange: ExternalChange,
		) => Promise<ExternalChange | null>;

		/**
		 * Get installed extensions on wiki
		 */
		getInstalledExtensions: ( server: string ) => Promise<string[] | undefined>;

		/**
		 * Makes a request to a page and returns the lua cpu profiling data
		 */
		getLuaCpuTime: ( host: string, page: string ) => Promise<LuaCPUValue>;

		/**
		 * Make a get request to get full request response
		 */
		makeRequest: (
			url: string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
			params?: any,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
			postData?: any,
		) => Promise<AxiosResponse>;

		/**
		 * Query blazegraph directly (only works if proxy is disabled, used in upgrade test)
		 */
		queryBlazeGraphItem: ( itemId: string ) => Promise<Binding[]>;

		waitForJobs: (
			serverURL?: string,
			timeout?: number,
			timeoutMsg?: string,
		) => Promise<boolean>;
	}

	interface Element {
		submit: () => Promise<void>;
	}
}
