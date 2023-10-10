import { config as wdioConf } from '../../wdio.conf.js';

export const config : WebdriverIO.Config = {
	...wdioConf,
	specs: [
		'../../specs/repo_client/interwiki-links.ts',
		'../../specs/repo_client/item.ts',
		'../../specs/repo/api.ts'
	]
};
