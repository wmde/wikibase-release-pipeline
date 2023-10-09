import { AxiosRequestConfig, AxiosResponse } from "axios";
import { DBQueryConfig, LuaCPUTimeReturn, WaitForJobsParams } from "./param-types.ts";



declare namespace WebdriverIO {
	export interface Browser {
		dbQuery: ( query: string, config?: DBQueryConfig ) => Promise<string>;
		deleteClaim: ( claimGuid: any ) => Promise<any>;
		dockerExecute: ( container: string, command: string, opts: string, shouldLog: boolean ) => Promise<string>;
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