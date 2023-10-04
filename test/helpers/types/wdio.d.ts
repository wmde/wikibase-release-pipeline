import { AxiosRequestConfig, AxiosResponse } from "axios";


export type DBQueryConfig = {
	user: string,
	pass: string,
	database: 'client_wiki'
};
export type LuaCPUTimeReturn= {
	value: number, scale: string 
};
export type WaitForJobsParams = {
	serverURL? : string,
	timeout? : number,
	timeoutMsg? : string
};

declare namespace WebdriverIO {
	interface Element {
		dbQuery: ( query: string, config?: DBQueryConfig ) => Promise<any>;
		deleteClaim: ( claimGuid: any ) => Promise<any>;
		dockerExecute: ( container: string, command: string, opts: string, shouldLog: boolean ) => Promise<any>;
		editPage: ( host: string, title: string, content: any, captcha: any ) => Promise<string>;
		executeQuickStatement: ( theQuery: string ) => Promise<boolean | undefined>;
		getDispatchedExternalChange<T>( host: string, expectedChange: T ): Promise<T | undefined>; 
		getInstalledExtensions: ( server: string ) => Promise<string[] | undefined>;
		getLuaCpuTime: ( host: string, page: string ) => Promise<LuaCPUTimeReturn>;
		makeRequest: ( url: string, params?: AxiosRequestConfig, postData?: any ) => Promise<AxiosResponse<any>>;
		queryBlazeGraphItem: ( itemId: string ) => Promise<any>;
        waitForJobs: (params: WaitForJobsParams) => Promise<boolean | undefined>;
	}
}