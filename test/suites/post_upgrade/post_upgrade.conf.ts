import { config as wdioConf } from '../../wdio.conf.js';

export const config : WebdriverIO.Config = {
	...wdioConf,
	specs: [
		'../../specs/repo/api.ts',
		'../../specs/upgrade/post-upgrade.ts',
		'../../specs/upgrade/queryservice-pre-and-post-upgrade.ts',
		'../../specs/upgrade/queryservice-post-upgrade.ts'
	]
};
