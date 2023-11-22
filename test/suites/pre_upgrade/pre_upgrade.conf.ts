import { config as wdioConf } from '../../wdio.conf.js';

export const config: WebdriverIO.Config = {
	...wdioConf,
	specs: [
		'specs/repo/api.ts',
		'specs/upgrade/pre-upgrade.ts',
		'specs/upgrade/queryservice-pre-and-post-upgrade.ts'
	]
};
