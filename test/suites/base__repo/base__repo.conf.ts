import { config as wdioConf } from '../../wdio.conf.js';

export const config : WebdriverIO.Config = {
	...wdioConf,
	specs: [
		'../../specs/repo/api.ts',
		'../../specs/repo/property.ts',
		'../../specs/repo/special-item.ts',
		'../../specs/repo/special-property.ts',
		'../../specs/repo/queryservice.ts'
	]
};
