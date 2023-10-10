import { config as wdioConf } from '../../wdio.conf.js';

export const config : WebdriverIO.Config = {
	...wdioConf,
	specs: [
		'../../specs/repo_client/*.ts',
		'../../specs/repo_client/extensions/*.ts'
	]
};
