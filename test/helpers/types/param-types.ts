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
