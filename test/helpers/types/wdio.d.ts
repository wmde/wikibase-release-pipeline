declare namespace WebdriverIO {
	type AxiosResponse = import("axios").AxiosResponse;
	type DatabaseConfig = import("./database-config.js").default;

	interface Browser {
		dbQuery:  ( query: string, config?: DatabaseConfig ) => Promise<string>;
		dockerExecute: ( container: string, command: string, opts?: string, shouldLog?: boolean ) => Promise<unknown>;
		editPage: ( host: string, title: string, content: string, captcha?: string ) => Promise<string>;
		getDispatchedExternalChange<T>( host: string, expectedChange: T ) : Promise<T | undefined>;
		getInstalledExtensions: ( server: string ) => Promise<string[] | undefined>;
		makeRequest: ( url: string, params?: Object, postData?: any ) => Promise<AxiosResponse>;
		waitForJobs: ( serverURL: string, timeout?: number, timeoutMsg?: string ) => Promise<boolean>;
	}

	interface Element {
	    submit: () => Promise<void>;
	}
}