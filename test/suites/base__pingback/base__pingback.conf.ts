import { config as wdioConf } from '../../wdio.conf.js';

export const config : WebdriverIO.Config = {
	...wdioConf,
	specs: [ '../../specs/pingback/*.ts' ]
};
